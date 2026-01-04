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
      // If the email matches, allow "claiming" the record even if linked to another userId (or no userId)
      // This is safe because we trust the authenticated email from the token
      if (idTaken.email.toLowerCase() === args.email.toLowerCase()) {
        await ctx.db.patch(idTaken._id, {
          userId,
          firstName: args.firstName || idTaken.firstName,
          lastName: args.lastName || idTaken.lastName,
          role: args.role
        });
        return idTaken._id;
      }

      // If it exists but email doesn't match, then it's a real conflict
      if (idTaken.userId && idTaken.userId !== userId) {
        throw new Error(`Employee ID ${args.employeeId} is already registered to another account.`);
      }

      // If no userId but email differs, still safer to block or update? 
      // User entered the ID correctly but the email is different from what's on file.
      if (idTaken.email.toLowerCase() !== args.email.toLowerCase()) {
        throw new Error(`The email provided does not match the record for ${args.employeeId}. Please contact HR.`);
      }

      // Fallback: If it exists but has no userId, link it
      await ctx.db.patch(idTaken._id, { userId, role: args.role });
      return idTaken._id;
    }

    return await ctx.db.insert("employees", {
      userId,
      employeeId: args.employeeId,
      role: args.role,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      department: "General",
      position: args.role === "hr" ? "HR Manager" : "Employee",
      hireDate: new Date().toISOString().split('T')[0],
      status: "active",
    });
  },
});

export const updateEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    profilePicture: v.optional(v.id("_storage")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    // New Fields
    bio: v.optional(v.string()),
    jobLove: v.optional(v.string()),
    hobbies: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    salaryDetails: v.optional(v.object({
      monthWage: v.number(),
      yearlyWage: v.number(),
      workingDaysPerWeek: v.number(),
      breakTimePerDay: v.string(),
      breakdown: v.object({
        basic: v.number(),
        hra: v.number(),
        standardAllowance: v.optional(v.number()),
        performanceBonus: v.optional(v.number()),
        lta: v.optional(v.number()),
        fixedAllowance: v.optional(v.number()),
        pfEmployee: v.number(),
        pfEmployer: v.number(),
        professionalTax: v.optional(v.number()),
      })
    })),
  },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee) throw new Error("Unauthorized");

    const { employeeId, ...updates } = args;

    // Employees can only update their own profile (limited fields)
    if (currentEmployee.role === "employee") {
      if (currentEmployee._id !== employeeId) {
        throw new Error("Access denied");
      }
      // Restricted fields for employees
      const allowedFields = [
        "firstName", "lastName", "phone", "address", "profilePicture",
        "bio", "jobLove", "hobbies", "skills", "certifications"
      ];
      const restrictedFields = Object.keys(updates).filter(k => !allowedFields.includes(k));
      if (restrictedFields.length > 0) {
        throw new Error(`You cannot update these fields: ${restrictedFields.join(", ")}`);
      }
    }

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(employeeId, cleanUpdates);
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
