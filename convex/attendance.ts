import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getLoggedInEmployee(ctx: any) {
  // Try to use getCurrentEmployee if already defined in api.employees
  try {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (employee) return employee;
  } catch (e) {
    // Fallback to manual check if runQuery fails or not available in this context
  }

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
    date: v.optional(v.string()), // Specific date for Admin view
    startDate: v.optional(v.string()), // Format YYYY-MM-DD
    endDate: v.optional(v.string())    // Format YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee) return [];

    const isAdminOrHR = currentEmployee.role === "admin" || currentEmployee.role === "hr";
    let records = [];

    // Case 1: Admin requesting ALL employees for a specific date
    if (isAdminOrHR && args.date && !args.employeeId) {
      records = await ctx.db
        .query("attendance")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .collect();
    }
    // Case 2: Specific Employee (Self or Admin viewing Employee)
    else {
      const targetEmployeeId = args.employeeId || currentEmployee._id;

      // Access Check
      if (!isAdminOrHR && targetEmployeeId !== currentEmployee._id) {
        throw new Error("Access denied");
      }

      if (args.startDate || args.endDate) {
        records = await ctx.db
          .query("attendance")
          .withIndex("by_employee_and_date", (q: any) => {
            let initial = q.eq("employeeId", targetEmployeeId);
            if (args.startDate) initial = initial.gte("date", args.startDate!);
            if (args.endDate) initial = initial.lte("date", args.endDate!);
            return initial;
          })
          .collect();
      } else {
        records = await ctx.db
          .query("attendance")
          .withIndex("by_employee_and_date", (q: any) => q.eq("employeeId", targetEmployeeId))
          .collect();
      }
    }

    // Enrich with employee details
    const enrichedRecords = await Promise.all(
      records.map(async (record: any) => {
        const employee: any = await ctx.db.get(record.employeeId);
        let imageUrl = null;
        if (employee && employee.profilePicture) {
          try {
            imageUrl = await ctx.storage.getUrl(employee.profilePicture);
          } catch (e) {
            console.error("Error fetching storage URL:", e);
          }
        }

        return {
          ...record,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown",
          department: employee?.department || "Unknown",
          position: employee?.position || "Unknown",
          profilePicture: employee?.profilePicture,
          profilePictureUrl: imageUrl,
          employee: employee ? {
            firstName: employee.firstName || "Unknown",
            lastName: employee.lastName || "",
            department: employee.department || "N/A",
            profilePictureUrl: imageUrl
          } : null
        };
      })
    );

    return enrichedRecords.sort((a: any, b: any) => b.date.localeCompare(a.date));
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
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("half-day"), v.literal("leave"), v.literal("on_leave")),
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

export const getMonthlyAttendanceStats = query({
  args: {
    employeeId: v.optional(v.id("employees")),
    month: v.number(), // 0-11
    year: v.number()
  },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee) throw new Error("Unauthorized");

    const targetEmployeeId = args.employeeId || currentEmployee._id;

    if (currentEmployee.role !== "admin" && currentEmployee.role !== "hr" && targetEmployeeId !== currentEmployee._id) {
      throw new Error("Access denied");
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const startDate = `${args.year}-${pad(args.month + 1)}-01`;
    const lastDay = new Date(args.year, args.month + 1, 0).getDate();
    const endDate = `${args.year}-${pad(args.month + 1)}-${pad(lastDay)}`;

    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) =>
        q.eq("employeeId", targetEmployeeId).gte("date", startDate).lte("date", endDate)
      )
      .collect();

    let present = 0;
    let absent = 0;
    let halfDays = 0;
    let leaves = 0;

    attendance.forEach((record: any) => {
      if (record.status === "present") present++;
      else if (record.status === "absent") absent++;
      else if (record.status === "half-day") halfDays++;
      else if (record.status === "leave" || record.status === "on_leave") leaves++;
    });

    const payableDays = present + leaves + (halfDays * 0.5);

    return {
      present,
      absent,
      halfDays,
      leaves,
      payableDays
    };
  },
});

export const fetchDailyAttendanceForAdmin = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee || currentEmployee.role === "employee") {
      return null;
    }

    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_date", (q: any) => q.eq("date", args.date))
      .collect();

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

export const fetchMonthlyAttendanceForEmployee = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const currentEmployee = await getLoggedInEmployee(ctx);
    if (!currentEmployee) return null;

    const startOfMonth = new Date(args.year, args.month - 1, 1);
    const endOfMonth = new Date(args.year, args.month, 0);

    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = endOfMonth.toISOString().split('T')[0];

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

