import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getMyPayroll = query({
  args: { payPeriod: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    const query = ctx.db
      .query("payroll")
      .withIndex("by_employee", (q: any) => q.eq("employeeId", employee._id));

    if (args.payPeriod) {
      const records = await query.collect();
      return records.filter((r: any) => r.payPeriod === args.payPeriod);
    }

    return await query.order("desc").collect();
  },
});

export const getLatestPayrollForEmployee = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee) throw new Error("Unauthorized");

    // Only allow self or admin/hr
    if (currentEmployee.role === "employee" && currentEmployee._id !== args.employeeId) {
      throw new Error("Access denied");
    }

    return await ctx.db
      .query("payroll")
      .withIndex("by_employee", (q: any) => q.eq("employeeId", args.employeeId))
      .order("desc")
      .first();
  },
});

export const getAllPayroll = query({
  args: { payPeriod: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    let payrollRecords;

    if (args.payPeriod) {
      payrollRecords = await ctx.db
        .query("payroll")
        .withIndex("by_pay_period", (q: any) => q.eq("payPeriod", args.payPeriod))
        .collect();
    } else {
      payrollRecords = await ctx.db.query("payroll").collect();
    }

    // Get employee details for each record
    const payrollWithEmployees = await Promise.all(
      payrollRecords.map(async (record: any) => {
        const employee = await ctx.db.get(record.employeeId);
        return { ...record, employee };
      })
    );

    return payrollWithEmployees;
  },
});

export const createPayroll = mutation({
  args: {
    employeeId: v.id("employees"),
    baseSalary: v.number(),
    allowances: v.number(),
    deductions: v.number(),
    payPeriod: v.string(),
    payDate: v.optional(v.string()),
    breakdown: v.optional(v.object({
      basic: v.number(),
      hra: v.number(),
      standardAllowance: v.number(), // New
      performanceBonus: v.number(), // New
      lta: v.number(), // New
      fixedAllowance: v.number(), // New
      conveyance: v.optional(v.number()),
      special: v.optional(v.number()),
      tax: v.number(),
      pfEmployee: v.number(), // Employee Share
      pfEmployer: v.number(), // Employer Share
      professionalTax: v.number(), // New
    }))
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    const netSalary = args.baseSalary + args.allowances - args.deductions;

    // Check if payroll already exists for this period
    const existing = await ctx.db
      .query("payroll")
      .withIndex("by_employee", (q: any) => q.eq("employeeId", args.employeeId))
      .filter((q: any) => q.eq(q.field("payPeriod"), args.payPeriod))
      .unique();

    if (existing) {
      throw new Error("Payroll already exists for this period");
    }

    // Use provided breakdown or calculate default (Simplified fallback)
    let breakdown = args.breakdown;
    if (!breakdown) {
      // Simplified Auto-calculation fallback if breakdown not provided
      breakdown = {
        basic: Math.round(args.baseSalary * 0.4),
        hra: Math.round(args.baseSalary * 0.2),
        standardAllowance: 50000 / 12,
        performanceBonus: 0,
        lta: 0,
        fixedAllowance: Math.round(args.baseSalary * 0.1),
        conveyance: 0,
        special: 0,
        tax: Math.round(args.deductions * 0.5),
        pfEmployee: Math.round(args.deductions * 0.25),
        pfEmployer: Math.round(args.deductions * 0.25),
        professionalTax: 200
      };
    }

    const payrollId = await ctx.db.insert("payroll", {
      employeeId: args.employeeId,
      baseSalary: args.baseSalary,
      allowances: args.allowances,
      deductions: args.deductions,
      netSalary,
      payPeriod: args.payPeriod,
      payDate: args.payDate,
      breakdown,
      status: "draft"
    });

    return payrollId;
  },
});

export const updatePayrollStatus = mutation({
  args: {
    payrollId: v.id("payroll"),
    status: v.union(v.literal("draft"), v.literal("processed"), v.literal("paid"))
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.payrollId, { status: args.status });

    // If status is processed or paid, notify employee
    if (args.status === "processed" || args.status === "paid") {
      const payroll = await ctx.db.get(args.payrollId);
      if (payroll) {
        await ctx.db.insert("notifications", {
          recipientId: payroll.employeeId,
          title: `Payroll ${args.status}`,
          message: `Your payroll for ${payroll.payPeriod} has been ${args.status}`,
          type: "payroll",
          read: false,
          createdAt: Date.now()
        });
      }
    }
  },
});

export const generateBatchPayroll = mutation({
  args: { payPeriod: v.string() },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    const employees = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    let count = 0;
    for (const employee of employees) {
      // Check if already exists
      const existing = await ctx.db
        .query("payroll")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .filter((q) => q.eq(q.field("payPeriod"), args.payPeriod))
        .unique();

      if (existing) continue;

      if (!employee.salaryDetails) continue;

      const { monthWage, breakdown: empBreakdown } = employee.salaryDetails;
      const totalAllowances = empBreakdown.hra + empBreakdown.standardAllowance + empBreakdown.performanceBonus + empBreakdown.lta + empBreakdown.fixedAllowance;
      const totalDeductions = empBreakdown.pfEmployee + empBreakdown.professionalTax;

      await ctx.db.insert("payroll", {
        employeeId: employee._id,
        baseSalary: monthWage,
        allowances: totalAllowances,
        deductions: totalDeductions,
        netSalary: monthWage + totalAllowances - totalDeductions,
        payPeriod: args.payPeriod,
        breakdown: {
          basic: empBreakdown.basic,
          hra: empBreakdown.hra,
          standardAllowance: empBreakdown.standardAllowance,
          performanceBonus: empBreakdown.performanceBonus,
          lta: empBreakdown.lta,
          fixedAllowance: empBreakdown.fixedAllowance,
          pfEmployee: empBreakdown.pfEmployee,
          pfEmployer: empBreakdown.pfEmployer,
          professionalTax: empBreakdown.professionalTax,
          tax: 0, // Default for now
        },
        status: "draft"
      });
      count++;
    }

    return { count };
  },
});
