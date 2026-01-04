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

<<<<<<< HEAD
export const approveLeave = mutation({
  args: {
    leaveId: v.id("leaveRequests"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    comments: v.optional(v.string())
=======
export const approveLeaveRequest = mutation({
  args: {
    requestId: v.id("leaveRequests"),
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

<<<<<<< HEAD
    const leaveRequest = await ctx.db.get(args.leaveId);
    if (!leaveRequest) throw new Error("Leave request not found");

    await ctx.db.patch(args.leaveId, {
      status: args.status,
      approvedBy: currentEmployee._id,
      approvalComments: args.comments
=======
    const leaveRequest = await ctx.db.get(args.requestId);
    if (!leaveRequest) throw new Error("Leave request not found");

    await ctx.db.patch(args.requestId, {
      status: "approved",
      approvedBy: currentEmployee._id,
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
    });

    // Create notification for employee
    const employee = await ctx.db.get(leaveRequest.employeeId);
    if (employee) {
      await ctx.db.insert("notifications", {
        recipientId: employee._id,
<<<<<<< HEAD
        title: `Leave Request ${args.status}`,
        message: `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been ${args.status}${args.comments ? `. Comments: ${args.comments}` : ''}`,
        type: args.status === "approved" ? "leave_approved" : "leave_rejected",
=======
        title: "Leave Request Approved",
        message: `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been approved`,
        type: "leave_approved",
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
        read: false,
        createdAt: Date.now()
      });
    }

<<<<<<< HEAD
    // If approved, mark attendance as leave for those dates
    if (args.status === "approved") {
      const startDate = new Date(leaveRequest.startDate);
      const endDate = new Date(leaveRequest.endDate);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        const existing = await ctx.db
          .query("attendance")
          .withIndex("by_employee_and_date", (q: any) => 
            q.eq("employeeId", leaveRequest.employeeId).eq("date", dateStr)
          )
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, { status: "leave" });
        } else {
          await ctx.db.insert("attendance", {
            employeeId: leaveRequest.employeeId,
            date: dateStr,
            status: "leave"
          });
        }
      }
    }
=======
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
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
  },
});
