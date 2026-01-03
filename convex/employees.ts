import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getLoggedInEmployee(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const employee = await ctx.db
    .query("employees")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .unique();

  return employee;
}

export const getCurrentEmployee = query({
  args: {},
  handler: async (ctx) => {
    return await getLoggedInEmployee(ctx);
  },
});

export const getEmployeeById = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee) throw new Error("Unauthorized");

    if (currentEmployee.role === "employee" && currentEmployee._id !== args.employeeId) {
      throw new Error("Access denied");
    }

    return await ctx.db.get(args.employeeId);
  },
});

export const getAllEmployees = query({
  args: {},
  handler: async (ctx) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    return await ctx.db.query("employees").collect();
  },
});

export const createEmployee = mutation({
  args: {
    employeeId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    department: v.string(),
    position: v.string(),
    hireDate: v.string(),
    role: v.union(v.literal("employee"), v.literal("admin"), v.literal("hr")),
  },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    // Check if employee ID already exists
    const existing = await ctx.db
      .query("employees")
      .withIndex("by_employee_id", (q: any) => q.eq("employeeId", args.employeeId))
      .unique();

    if (existing) {
      throw new Error("Employee ID already exists");
    }

    return await ctx.db.insert("employees", {
      ...args,
      status: "active",
    });
  },
});

export const syncUserWithEmployee = mutation({
  args: {
    employeeId: v.string(),
    role: v.union(v.literal("employee"), v.literal("hr")),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existingEmployee = await ctx.db
      .query("employees")
      .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
      .unique();

    if (existingEmployee) return existingEmployee._id;

    // Check if employee ID is already taken
    const idTaken = await ctx.db
      .query("employees")
      .withIndex("by_employee_id", (q: any) => q.eq("employeeId", args.employeeId))
      .unique();

    if (idTaken) {
      if (idTaken.userId && idTaken.userId !== userId) {
        throw new Error("Employee ID already registered");
      }

      // If employee exists but not linked (or linked to self), update/link it
      await ctx.db.patch(idTaken._id, {
        userId,
        // Update basic info if provided, but prioritize existing sensitive info from Admin
        firstName: args.firstName || idTaken.firstName,
        lastName: args.lastName || idTaken.lastName,
        email: args.email || idTaken.email,
        role: args.role // Allowing re-role on sync might be risky but needed for setup if Admin didn't set it right
      });
      return idTaken._id;
    }

    return await ctx.db.insert("employees", {
      userId,
      employeeId: args.employeeId,
      role: args.role,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      department: "General", // Default
      position: args.role === "hr" ? "HR Manager" : "Employee", // Default
      hireDate: new Date().toISOString().split('T')[0],
      status: "active",
    });
  },
});

export const updateLeaveAllocation = mutation({
  args: {
    employeeId: v.id("employees"),
    paidDays: v.number(),
    sickDays: v.number(),
    personalDays: v.number(),
  },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");

    // In a real implementation, you would store this in a separate leaveBalances table
    // For now, we'll store it in the employee document as a temporary solution
    await ctx.db.patch(args.employeeId, {
      leaveBalances: {
        paid: args.paidDays,
        sick: args.sickDays,
        personal: args.personalDays,
      }
    });

    return args.employeeId;
  },
});
