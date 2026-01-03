import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getMyLeaveRequests = query({
  args: {},
  handler: async (ctx) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    return await ctx.db
      .query("leaveRequests")
      .withIndex("by_employee", (q: any) => q.eq("employeeId", employee._id))
      .order("desc")
      .collect();
  },
});

export const getAllLeaveRequests = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    let requests;
    
    if (args.status) {
      requests = await ctx.db
        .query("leaveRequests")
        .withIndex("by_status", (q: any) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db.query("leaveRequests").order("desc").collect();
    }
    
    // Get employee details for each request
    const requestsWithEmployees = await Promise.all(
      requests.map(async (request: any) => {
        const employee = await ctx.db.get(request.employeeId);
        return { ...request, employee };
      })
    );

    return requestsWithEmployees;
  },
});

export const applyLeave = mutation({
  args: {
    leaveType: v.union(v.literal("paid"), v.literal("sick"), v.literal("unpaid"), v.literal("personal")),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    // Calculate number of days
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveId = await ctx.db.insert("leaveRequests", {
      employeeId: employee._id,
      leaveType: args.leaveType,
      startDate: args.startDate,
      endDate: args.endDate,
      days,
      reason: args.reason,
      status: "pending",
      appliedAt: Date.now()
    });

    // Create notification for HR/Admin
    const hrEmployees = await ctx.db
      .query("employees")
      .filter((q: any) => q.or(q.eq(q.field("role"), "hr"), q.eq(q.field("role"), "admin")))
      .collect();

    for (const hrEmployee of hrEmployees) {
      await ctx.db.insert("notifications", {
        recipientId: hrEmployee._id,
        title: "New Leave Request",
        message: `${employee.firstName} ${employee.lastName} has applied for ${args.leaveType} leave from ${args.startDate} to ${args.endDate}`,
        type: "leave_request",
        read: false,
        createdAt: Date.now()
      });
    }

    return leaveId;
  },
});

export const approveLeaveRequest = mutation({
  args: {
    requestId: v.id("leaveRequests"),
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    const leaveRequest = await ctx.db.get(args.requestId);
    if (!leaveRequest) throw new Error("Leave request not found");

    await ctx.db.patch(args.requestId, {
      status: "approved",
      approvedBy: currentEmployee._id,
    });

    // Create notification for employee
    const employee = await ctx.db.get(leaveRequest.employeeId);
    if (employee) {
      await ctx.db.insert("notifications", {
        recipientId: employee._id,
        title: "Leave Request Approved",
        message: `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been approved`,
        type: "leave_approved",
        read: false,
        createdAt: Date.now()
      });
    }

    return args.requestId;
  },
});

export const rejectLeaveRequest = mutation({
  args: {
    requestId: v.id("leaveRequests"),
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    const leaveRequest = await ctx.db.get(args.requestId);
    if (!leaveRequest) throw new Error("Leave request not found");

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approvedBy: currentEmployee._id,
    });

    // Create notification for employee
    const employee = await ctx.db.get(leaveRequest.employeeId);
    if (employee) {
      await ctx.db.insert("notifications", {
        recipientId: employee._id,
        title: "Leave Request Rejected",
        message: `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been rejected`,
        type: "leave_rejected",
        read: false,
        createdAt: Date.now()
      });
    }

    return args.requestId;
  },
});
