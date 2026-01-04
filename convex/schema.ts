import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
    }).index("email", ["email"]),

    employees: defineTable({
        userId: v.optional(v.string()), // Can be linked to users._id
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
        status: v.string(), // "active", "inactive"
        profilePicture: v.optional(v.id("_storage")),
        bio: v.optional(v.string()),
        jobLove: v.optional(v.string()),
        hobbies: v.optional(v.string()),
        skills: v.optional(v.array(v.string())),
        certifications: v.optional(v.array(v.string())),
        salaryDetails: v.optional(v.any()), // Permissive for existing data
        leaveBalances: v.optional(v.object({
            paid: v.number(),
            sick: v.number(),
            personal: v.number(),
        })),
    })
        .index("by_user_id", ["userId"])
        .index("by_employee_id", ["employeeId"]),

    attendance: defineTable({
        employeeId: v.id("employees"),
        date: v.string(), // YYYY-MM-DD
        checkIn: v.optional(v.string()),
        checkOut: v.optional(v.string()),
        status: v.string(), // "present", "absent", "half-day", "leave", "on_leave"
        remarks: v.optional(v.string()),
        hoursWorked: v.optional(v.number()),
        leaveType: v.optional(v.string()),
    })
        .index("by_employee_and_date", ["employeeId", "date"])
        .index("by_date", ["date"]),

    payroll: defineTable({
        employeeId: v.id("employees"),
        baseSalary: v.optional(v.number()),
        allowances: v.optional(v.number()),
        deductions: v.optional(v.number()),
        netSalary: v.optional(v.number()),
        payPeriod: v.string(), // e.g., "2024-03"
        payDate: v.optional(v.string()),
        status: v.string(), // "draft", "processed", "paid"
        monthWage: v.optional(v.number()),
        workingDaysPerWeek: v.optional(v.number()),
        breakTime: v.optional(v.number()),
        breakdown: v.optional(v.any()), // Permissive for existing data
    })
        .index("by_employee", ["employeeId"])
        .index("by_pay_period", ["payPeriod"]),

    leaveRequests: defineTable({
        employeeId: v.id("employees"),
        leaveType: v.string(), // "paid", "sick", "unpaid", "personal"
        startDate: v.string(),
        endDate: v.string(),
        days: v.number(),
        reason: v.string(),
        status: v.string(), // "pending", "approved", "rejected"
        appliedAt: v.number(),
        approvedBy: v.optional(v.id("employees")),
        approvalComments: v.optional(v.string()),
    })
        .index("by_employee", ["employeeId"])
        .index("by_status", ["status"]),

    notifications: defineTable({
        recipientId: v.id("employees"),
        title: v.string(),
        message: v.string(),
        type: v.string(),
        read: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_recipient", ["recipientId"])
        .index("by_read_status", ["recipientId", "read"]),

    contactMessages: defineTable({
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        company: v.optional(v.string()),
        message: v.string(),
        createdAt: v.number(),
        status: v.string(), // "new", "read", "archived"
    }),
});