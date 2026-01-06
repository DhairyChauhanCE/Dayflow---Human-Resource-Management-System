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

export const getTimeOffBalances = query({
  args: {},
  handler: async (ctx) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    return employee.leaveBalances || {
      paid: 24,
      sick: 7,
      personal: 0
    };
  },
});

export const getTimeOffRequests = query({
  args: { employeeId: v.optional(v.id("employees")) },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee) throw new Error("Unauthorized");

    let requests;

    if (args.employeeId) {
      requests = await ctx.db
        .query("leaveRequests")
        .withIndex("by_employee", (q: any) => q.eq("employeeId", args.employeeId as any))
        .order("desc")
        .collect();
    } else if (currentEmployee.role === "employee") {
      requests = await ctx.db
        .query("leaveRequests")
        .withIndex("by_employee", (q: any) => q.eq("employeeId", currentEmployee._id))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db.query("leaveRequests").order("desc").collect();
    }

    // Get employee details for each request
    return await Promise.all(
      requests.map(async (request: any) => {
        const employee = (await ctx.db.get(request.employeeId)) as any;
        return {
          ...request,
          employee,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown"
        };
      })
    );
  },
});

async function processLeaveApproval(ctx: any, args: { leaveId: any, status: "approved" | "rejected", comments?: string }) {
  const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
  if (!currentEmployee || currentEmployee.role === "employee") {
    throw new Error("Access denied");
  }

  const leaveRequest = await ctx.db.get(args.leaveId);
  if (!leaveRequest) throw new Error("Leave request not found");

  await ctx.db.patch(args.leaveId, {
    status: args.status,
    approvedBy: currentEmployee._id,
    approvalComments: args.comments
  });

  // Update employee leave balances if approved
  if (args.status === "approved") {
    const employee = await ctx.db.get(leaveRequest.employeeId);
    if (employee && employee.leaveBalances) {
      const type = leaveRequest.leaveType as keyof typeof employee.leaveBalances;
      if (employee.leaveBalances[type] !== undefined) {
        const newBalances = { ...employee.leaveBalances };
        newBalances[type] = Math.max(0, (newBalances[type] || 0) - leaveRequest.days);
        await ctx.db.patch(employee._id, { leaveBalances: newBalances });
      }
    }
  }

  // Create notification for employee
  const employee = await ctx.db.get(leaveRequest.employeeId);
  if (employee) {
    await ctx.db.insert("notifications", {
      recipientId: employee._id,
      title: `Leave Request ${args.status}`,
      message: `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been ${args.status}${args.comments ? `. Comments: ${args.comments}` : ''}`,
      type: args.status === "approved" ? "leave_approved" : "leave_rejected",
      read: false,
      createdAt: Date.now()
    });
  }

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
}

export const approveLeave = mutation({
  args: {
    leaveId: v.id("leaveRequests"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    comments: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await processLeaveApproval(ctx, args);
  },
});

export const approveLeaveRequest = mutation({
  args: { requestId: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    return await processLeaveApproval(ctx, {
      leaveId: args.requestId,
      status: "approved"
    });
  }
});

export const rejectLeaveRequest = mutation({
  args: { requestId: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    return await processLeaveApproval(ctx, {
      leaveId: args.requestId,
      status: "rejected"
    });
  },
});

export const createTimeOffRequest = applyLeave;
export const approveTimeOffRequest = approveLeaveRequest;
export const rejectTimeOffRequest = rejectLeaveRequest;

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
