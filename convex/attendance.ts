import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getLoggedInEmployee(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  return await ctx.db
    .query("employees")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .unique();
}

export const getTodayAttendance = query({
  args: {},
  handler: async (ctx) => {
    const employee = await getLoggedInEmployee(ctx);
    if (!employee) return null;

    const today = new Date().toISOString().split('T')[0];

    return await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) =>
        q.eq("employeeId", employee._id).eq("date", today)
      )
      .unique();
  },
});

export const getAttendanceHistory = query({
  args: {
    employeeId: v.optional(v.id("employees")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee) return []; // Return empty list if not authed

    const targetEmployeeId = args.employeeId || currentEmployee._id;

    // Employees can only view their own attendance
    if (currentEmployee.role === "employee" && targetEmployeeId !== currentEmployee._id) {
      throw new Error("Access denied");
    }

    const query = ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) => q.eq("employeeId", targetEmployeeId));

    const records = await query.collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      return records.filter((record: any) => {
        if (args.startDate && record.date < args.startDate) return false;
        if (args.endDate && record.date > args.endDate) return false;
        return true;
      });
    }

    return records.sort((a: any, b: any) => b.date.localeCompare(a.date));
  },
});

export const checkIn = mutation({
  args: {},
  handler: async (ctx) => {
    const employee = await getLoggedInEmployee(ctx);
    if (!employee) throw new Error("Unauthorized");

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString();

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) =>
        q.eq("employeeId", employee._id).eq("date", today)
      )
      .unique();

    if (existing) {
      if (existing.checkIn) {
        throw new Error("Already checked in today");
      }
      await ctx.db.patch(existing._id, {
        checkIn: now,
        status: "present"
      });
    } else {
      await ctx.db.insert("attendance", {
        employeeId: employee._id,
        date: today,
        checkIn: now,
        status: "present"
      });
    }
  },
});

export const checkOut = mutation({
  args: {},
  handler: async (ctx) => {
    const employee = await getLoggedInEmployee(ctx);
    if (!employee) throw new Error("Unauthorized");

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString();

    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) =>
        q.eq("employeeId", employee._id).eq("date", today)
      )
      .unique();

    if (!attendance || !attendance.checkIn) {
      throw new Error("Must check in first");
    }

    if (attendance.checkOut) {
      throw new Error("Already checked out today");
    }

    // Calculate hours worked
    const checkInTime = new Date(`${today} ${attendance.checkIn}`);
    const checkOutTime = new Date(`${today} ${now}`);
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    await ctx.db.patch(attendance._id, {
      checkOut: now,
      hoursWorked: Math.round(hoursWorked * 100) / 100
    });
  },
});

export const markAttendance = mutation({
  args: {
    employeeId: v.id("employees"),
    date: v.string(),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("half-day"), v.literal("leave")),
    remarks: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee || currentEmployee.role === "employee") {
      throw new Error("Access denied");
    }

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) =>
        q.eq("employeeId", args.employeeId).eq("date", args.date)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        remarks: args.remarks
      });
    } else {
      await ctx.db.insert("attendance", {
        employeeId: args.employeeId,
        date: args.date,
        status: args.status,
        remarks: args.remarks
      });
    }
  },
});

// Admin: Get all attendance for a specific date
export const fetchDailyAttendanceForAdmin = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee || currentEmployee.role === "employee") {
      return null; // Return null instead of throwing
    }

    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_date", (q: any) => q.eq("date", args.date))
      .collect();

    // Join with Employee details
    if (!attendanceRecords || attendanceRecords.length === 0) return [];

    const recordsWithEmployee = await Promise.all(
      attendanceRecords.map(async (record: any) => {
        try {
          const employee: any = await ctx.db.get(record.employeeId);
          let imageUrl = null;
          if (employee && employee.profilePicture) {
            imageUrl = await ctx.storage.getUrl(employee.profilePicture);
          }

          return {
            ...record,
            employee: employee ? {
              firstName: employee.firstName || "Unknown",
              lastName: employee.lastName || "",
              department: employee.department || "N/A",
              profilePictureUrl: imageUrl
            } : null
          };
        } catch (e) {
          console.error("Error fetching employee for attendance:", e);
          return { ...record, employee: null };
        }
      })
    );

    return recordsWithEmployee;
  }
});

// Employee: Get monthly attendance for themselves
export const fetchMonthlyAttendanceForEmployee = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee) return null;

    const startOfMonth = new Date(args.year, args.month - 1, 1);
    const endOfMonth = new Date(args.year, args.month, 0); // Last day of month

    // Format to YYYY-MM-DD for string comparison
    // Note: This relies on the "date" field being YYYY-MM-DD string as established
    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = endOfMonth.toISOString().split('T')[0];

    // We can't range query easily on string date without a specific index for it combined with employee
    // But we have `by_employee_and_date`.
    // Range queries on the second field of an index are generally efficient in Convex if the first is precise.
    // Let's verify index: .index("by_employee_and_date", ["employeeId", "date"])
    // Yes, q.eq("employeeId", ...).gte("date", ...).lte("date", ...) works perfectly.

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) =>
        q.eq("employeeId", currentEmployee._id)
          .gte("date", startStr)
          .lte("date", endStr)
      )
      .collect();

    return records ? records.sort((a: any, b: any) => a.date.localeCompare(b.date)) : [];
  }
});
