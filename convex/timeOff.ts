import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getTimeOffRequests = query({
  args: {
    employeeId: v.optional(v.id("employees")),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")))
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee) throw new Error("Unauthorized");

    let items;
    // Admins/HR can see all requests
    // Using `any` cast here to bypass the strict type inference which is conflicting with the runtime `employees` table structure
    // The `currentEmployee` already comes from the `employees` table, so direct access to its role is fine.
    // The original code already correctly checks `currentEmployee.role`.
    // The following block seems to be a re-implementation of the access control logic.
    // Let's integrate the spirit of the change (explicit type handling if needed, and the `order("desc")`)
    // while maintaining the existing `currentEmployee` logic.

    const isAdminOrHR = currentEmployee.role === "admin" || currentEmployee.role === "hr";

    if (isAdminOrHR) {
      // Fetch all requests if admin/hr
      items = await ctx.db.query("leaveRequests").order("desc").collect();
      // Filter by employeeId if provided
      if (args.employeeId) {
        items = items.filter(i => i.employeeId === args.employeeId);
      }
    } else {
      // Employees see only their own
      const targetEmployeeId = args.employeeId || currentEmployee._id;
      if (targetEmployeeId !== currentEmployee._id) {
        throw new Error("Access denied");
      }
      items = await ctx.db
        .query("leaveRequests")
        .withIndex("by_employee", (q) => q.eq("employeeId", targetEmployeeId))
        .order("desc") // Added order("desc") as per the change request
        .collect();
    }

    if (args.status) {
      items = items.filter((request) => request.status === args.status);
    }

    // Get employee details for each request
    const requestsWithEmployees = await Promise.all(
      items.map(async (request: any) => {
        const employee: any = await ctx.db.get(request.employeeId);
        return {
          ...request,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown",
          department: employee ? employee.department : "Unknown",
          employee // Return full object if needed
        };
      })
    );

    return requestsWithEmployees.sort((a, b) => b.appliedAt - a.appliedAt);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getTimeOffBalances = query({
  args: {},
  handler: async (ctx) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    return {
      paid: employee.paidLeaveBalance ?? 24,
      sick: employee.sickLeaveBalance ?? 7,
      unpaid: 0, // Unpaid is usually unlimited or tracked differently
    };
  },
});

export const createTimeOffRequest = mutation({
  args: {
    leaveType: v.union(v.literal("paid"), v.literal("sick"), v.literal("unpaid")),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(),
    reason: v.optional(v.string()),
    attachment: v.optional(v.id("_storage"))
  },
  handler: async (ctx, args) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    // Validate dates
    if (new Date(args.startDate) > new Date(args.endDate)) {
      throw new Error("End date must be after start date");
    }

    // Check balance if not unpaid
    if (args.leaveType !== "unpaid") {
      const balance = args.leaveType === "paid" ? ((employee as any).paidLeaveBalance ?? 24) : ((employee as any).sickLeaveBalance ?? 7);
      if (balance < args.days) {
        throw new Error(`Insufficient ${args.leaveType} leave balance`);
      }
    }

    const requestId = await ctx.db.insert("leaveRequests", {
      employeeId: employee._id,
      leaveType: args.leaveType,
      startDate: args.startDate,
      endDate: args.endDate,
      days: args.days,
      reason: args.reason,
      status: "pending",
      appliedAt: Date.now(),
      attachment: args.attachment // Include attachment
    });

    return requestId;
  },
});

export const approveTimeOffRequest = mutation({
  args: {
    requestId: v.id("leaveRequests"),
    approvalComments: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || ((currentEmployee as { role: string }).role !== "admin" && (currentEmployee as { role: string }).role !== "hr")) {
      throw new Error("Access denied");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request already processed");

    const requester = await ctx.db.get(request.employeeId);
    if (!requester) throw new Error("Requester not found");

    // Deduct balance
    if (request.leaveType === "paid") {
      const currentBalance = (requester as { paidLeaveBalance?: number }).paidLeaveBalance ?? 24;
      if (currentBalance < request.days) throw new Error("Insufficient Paid Leave Balance");
      await ctx.db.patch(requester._id, { paidLeaveBalance: currentBalance - request.days });
    } else if (request.leaveType === "sick") {
      const currentBalance = (requester as { sickLeaveBalance?: number }).sickLeaveBalance ?? 7;
      if (currentBalance < request.days) throw new Error("Insufficient Sick Leave Balance");
      await ctx.db.patch(requester._id, { sickLeaveBalance: currentBalance - request.days });
    }

    await ctx.db.patch(args.requestId, {
      status: "approved",
      approvedBy: currentEmployee._id,
      approvalComments: args.approvalComments
    });
  }
});

export const rejectTimeOffRequest = mutation({
  args: {
    requestId: v.id("leaveRequests"),
    approvalComments: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || (currentEmployee.role !== "admin" && currentEmployee.role !== "hr")) {
      throw new Error("Access denied");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request already processed");

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approvedBy: currentEmployee._id,
      approvalComments: args.approvalComments
    });
  }
});

