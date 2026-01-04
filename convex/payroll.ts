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
<<<<<<< HEAD
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
=======

    // Configurable inputs
    monthWage: v.optional(v.number()),
    workingDaysPerWeek: v.optional(v.number()),
    breakTime: v.optional(v.number()),

    breakdown: v.optional(v.object({
      basic: v.number(),
      hra: v.number(),
      standardAllowance: v.optional(v.number()),
      performanceBonus: v.optional(v.number()),
      lta: v.optional(v.number()),
      fixedAllowance: v.optional(v.number()),

      pfEmployee: v.optional(v.number()),
      pfEmployer: v.optional(v.number()),
      tax: v.number(),

      // Legacy support
      conveyance: v.optional(v.number()),
      special: v.optional(v.number()),
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
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
<<<<<<< HEAD
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
=======
      // For now, allow overwriting or patching could be better, but let's throw or return existing
      // Actually, let's delete existing and create new (overwrite logic) or throw
      // The current logic throws. Let's keep it but perhaps update if exists logic is better.
      // For simplified flow, we'll strip the existing check or use update logic.
      // Let's stick effectively to "update if exists" logic by deleting old one? 
      // No, let's just update the existing record if found, or insert if not.

      const { employeeId, ...updates } = args;
      await ctx.db.patch(existing._id, {
        ...updates,
        netSalary,
        status: existing.status // keep existing status
      });
      return existing._id;
    }

    let breakdown = args.breakdown;
    // Default fallback logic
    if (!breakdown) {
      breakdown = {
        basic: Math.round(args.baseSalary * 0.5),
        hra: Math.round(args.baseSalary * 0.3),
        standardAllowance: 0,
        performanceBonus: 0,
        lta: 0,
        fixedAllowance: 0,
        pfEmployee: Math.round(args.deductions * 0.3),
        pfEmployer: 0,
        tax: Math.round(args.deductions * 0.7),
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
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
<<<<<<< HEAD
=======
      monthWage: args.monthWage,
      workingDaysPerWeek: args.workingDaysPerWeek,
      breakTime: args.breakTime,
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
      breakdown,
      status: "draft"
    });

    return payrollId;
  },
});

<<<<<<< HEAD
export const updatePayrollStatus = mutation({
  args: {
    payrollId: v.id("payroll"),
    status: v.union(v.literal("draft"), v.literal("processed"), v.literal("paid"))
=======
export const calculatePayableDays = mutation({
  args: {
    employeeId: v.union(v.id("employees"), v.literal("all")),
    month: v.number(),
    year: v.number()
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

<<<<<<< HEAD
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
=======
    const startDate = new Date(args.year, args.month - 1, 1);
    const endDate = new Date(args.year, args.month, 0); // Last day of month
    
    // Get days in month
    const daysInMonth = new Date(args.year, args.month, 0).getDate();
    
    let employeesToProcess;
    
    if (args.employeeId === "all") {
      // Get all employees
      employeesToProcess = await ctx.db.query("employees").collect();
    } else {
      // Get specific employee
      const employee = await ctx.db.get(args.employeeId as any);
      employeesToProcess = employee ? [employee] : [];
    }

    const results = await Promise.all(
      employeesToProcess.map(async (employee) => {
        // Get attendance records for the month
        const attendanceRecords = await ctx.db
          .query("attendance")
          .withIndex("by_employee_date", (q: any) => 
            q.eq("employeeId", employee._id)
             .gte("date", startDate.toISOString().split('T')[0])
             .lt("date", endDate.toISOString().split('T')[0])
          )
          .collect();

        // Calculate payable days
        let payableDays = daysInMonth;
        let unpaidLeaveDays = 0;
        let absentDays = 0;

        attendanceRecords.forEach((record: any) => {
          if (record.status === "absent") {
            absentDays++;
          } else if (record.status === "on_leave") {
            if (record.leaveType === "unpaid") {
              unpaidLeaveDays++;
            }
            // Paid leave doesn't reduce payable days
          }
        });

        payableDays = daysInMonth - absentDays - unpaidLeaveDays;

        return {
          employeeId: employee._id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          totalDays: daysInMonth,
          payableDays,
          absentDays,
          unpaidLeaveDays,
          paidLeaveDays: attendanceRecords.filter((r: any) => 
            r.status === "on_leave" && r.leaveType !== "unpaid"
          ).length
        };
      })
    );

    return results;
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
  },
});
