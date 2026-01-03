import { query } from "./_generated/server";
import { v } from "convex/values";

// Get aggregated attendance stats for the last 30 days
export const getAttendanceStats = query({
    args: {},
    handler: async (ctx) => {
        // In a real production app with massive data, we might want to pre-aggregate this.
        // For now, fetching recent records and aggregating in memory is fine.

        // Get last 30 days of attendance
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];

        const attendance = await ctx.db
            .query("attendance")
            .filter(q => q.gte(q.field("date"), thirtyDaysAgo))
            .collect();

        // Group by date
        const statsMap = new Map<string, { date: string, present: number, absent: number, halfDay: number, leave: number }>();

        attendance.forEach(record => {
            if (!statsMap.has(record.date)) {
                statsMap.set(record.date, { date: record.date, present: 0, absent: 0, halfDay: 0, leave: 0 });
            }
            const entry = statsMap.get(record.date)!;
            if (record.status === "present") entry.present++;
            else if (record.status === "absent") entry.absent++;
            else if (record.status === "half-day") entry.halfDay++;
            else if (record.status === "leave") entry.leave++;
        });

        // Convert to array and sort
        return Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    },
});

export const getPayrollStats = query({
    args: {},
    handler: async (ctx) => {
        // Get all payroll records to show distribution
        const payrolls = await ctx.db.query("payroll").collect();

        let totalBase = 0;
        let totalAllowances = 0;
        let totalDeductions = 0;
        let totalNet = 0;

        payrolls.forEach(p => {
            totalBase += p.baseSalary;
            totalAllowances += p.allowances;
            totalDeductions += p.deductions;
            totalNet += p.netSalary;
        });

        return {
            distribution: [
                { name: "Base Salary", value: totalBase },
                { name: "Allowances", value: totalAllowances },
                { name: "Deductions", value: totalDeductions },
            ],
            totalPaid: totalNet,
        };
    },
});
