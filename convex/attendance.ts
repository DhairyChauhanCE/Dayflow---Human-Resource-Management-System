import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getTodayAttendance = query({
  args: {},
  handler: async (ctx) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

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
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee) throw new Error("Unauthorized");

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

      // If filtering by date range for a specific employee, use the index if possible or filter in memory
      // Ideally we use an index, but we only have `by_employee_and_date` which supports equality on employee and range on date?
      // Convex `eq` followed by `gte`/`lte` works on compound indexes if ordered correctly.
      // Assuming `by_employee_and_date` is `['employeeId', 'date']`.

      if (args.startDate || args.endDate) {
        let q = ctx.db
          .query("attendance")
          .withIndex("by_employee_and_date", (q: any) => q.eq("employeeId", targetEmployeeId));

        if (args.startDate) q = q.filter((q: any) => q.gte(q.field("date"), args.startDate!));
        if (args.endDate) q = q.filter((q: any) => q.lte(q.field("date"), args.endDate!));
        // Note: .filter() is less efficient than index range but we need to verify schema index definition.
        // If index is [employeeId, date], we can use range operators in withIndex?
        // Actually `q.eq("employeeId", ...).gte("date", ...)` is valid in `withIndex` callback relative to index fields.

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
        return {
          ...record,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown",
          department: employee?.department || "Unknown",
          position: employee?.position || "Unknown",
          profilePicture: employee?.profilePicture
        };
      })
    );

    return enrichedRecords.sort((a: any, b: any) => b.date.localeCompare(a.date));
  },
});

export const checkIn = mutation({
  args: {},
  handler: async (ctx) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
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
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
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
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
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
    employeeId: v.optional(v.id("employees")), // Optional so default can be current
    month: v.number(), // 0-11
    year: v.number()
  },
  handler: async (ctx, args) => {
    const currentEmployee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!currentEmployee) throw new Error("Unauthorized");

    const targetEmployeeId = args.employeeId || currentEmployee._id;

    // Access Check
    if (currentEmployee.role !== "admin" && currentEmployee.role !== "hr" && targetEmployeeId !== currentEmployee._id) {
      throw new Error("Access denied");
    }

    const start = new Date(args.year, args.month, 1);
    const end = new Date(args.year, args.month + 1, 0); // Last day of month

    // Format as YYYY-MM-DD
    // Note: To avoid timezone issues, manually construct date strings if dealing with local time logic,
    // but ISO string date part works for UTC. Assuming all dates stored as YYYY-MM-DD.
    // However, JS Date(y,m,1) creates local time. toISOString() converts to UTC.
    // Better to use manual formatting:
    const pad = (n: number) => n.toString().padStart(2, '0');
    const startDate = `${args.year}-${pad(args.month + 1)}-01`;
    const lastDay = new Date(args.year, args.month + 1, 0).getDate();
    const endDate = `${args.year}-${pad(args.month + 1)}-${pad(lastDay)}`;

    // Fetch attendance between range
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q: any) =>
        q.eq("employeeId", targetEmployeeId).gte("date", startDate).lte("date", endDate)
      )
      .collect();

    // Calculate stats
    let present = 0;
    let absent = 0;
    let halfDays = 0;
    let leaves = 0;

    attendance.forEach((record: any) => {
      if (record.status === "present") present++;
      else if (record.status === "absent") absent++;
      else if (record.status === "half-day") halfDays++;
      else if (record.status === "leave") leaves++;
    });

    // Payable Days Calculation: Present + Leaves + (HalfDay * 0.5)
    const payableDays = present + leaves + (halfDays * 0.5);

    return {
      present,
      absent,
      halfDays,
      leaves,
      payableDays
    };
  }
});
