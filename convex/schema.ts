import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  employees: defineTable({
    userId: v.optional(v.id("users")),
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
    profilePicture: v.optional(v.id("_storage")),
    status: v.union(v.literal("active"), v.literal("inactive")),
    // Extended Profile Fields
    about: v.optional(v.string()),
    whatILove: v.optional(v.string()), // "What I love about my job"
    hobbies: v.optional(v.string()),   // "My interests and hobbies"
    skills: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    managerId: v.optional(v.id("employees")),

    documents: v.optional(v.array(v.object({
      name: v.string(),
      fileId: v.id("_storage"),
      uploadedAt: v.string(),
    }))),
    leaveBalances: v.optional(v.object({
      paid: v.number(),
      sick: v.number(),
      personal: v.number(),
    })),
    salaryConfiguration: v.optional(v.object({
      wageType: v.union(v.literal("fixed")),
      wageAmount: v.number(),
      components: v.array(v.object({
        id: v.string(),
        name: v.string(),
        computationType: v.union(v.literal("fixed"), v.literal("percentage"), v.literal("calculated")),
        value: v.number(),
        calculatedAmount: v.number(),
        basedOn: v.optional(v.string())
      })),
      deductions: v.object({
        pfRate: v.number(),
        professionalTax: v.number()
      })
    })),
  })
    .index("by_user_id", ["userId"])
    .index("by_employee_id", ["employeeId"])
    .index("by_email", ["email"]),

  attendance: defineTable({
    employeeId: v.id("employees"),
    date: v.string(),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    hoursWorked: v.optional(v.number()),
    overtime: v.optional(v.number()),
    breakTime: v.optional(v.number()),
    workingTime: v.optional(v.number()),
    leaveType: v.optional(v.union(v.literal("paid"), v.literal("sick"), v.literal("unpaid"), v.literal("personal"))),
    status: v.optional(v.union(v.literal("present"), v.literal("absent"), v.literal("late"), v.literal("early"), v.literal("on_leave"), v.literal("half-day"), v.literal("leave"))),
    remarks: v.optional(v.string()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_date", ["date"])
    .index("by_employee_date", ["employeeId", "date"]),

  leaveRequests: defineTable({
    employeeId: v.id("employees"),
    leaveType: v.union(
      v.literal("paid"),
      v.literal("sick"),
      v.literal("unpaid"),
      v.literal("personal")
    ),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(),
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.id("employees")),
    approvalComments: v.optional(v.string()),
    appliedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  payroll: defineTable({
    employeeId: v.id("employees"),
    baseSalary: v.number(), // This can act as the "Month Wage" total or basic, but let's keep it as is.
    allowances: v.number(),
    deductions: v.number(),
    netSalary: v.number(),

    // Configurable inputs
    monthWage: v.optional(v.number()),
    workingDaysPerWeek: v.optional(v.number()),
    breakTime: v.optional(v.number()),

    breakdown: v.optional(v.object({
      basic: v.number(), // 50% usually
      hra: v.number(),   // 50% of Basic
      standardAllowance: v.optional(v.number()),
      performanceBonus: v.optional(v.number()),
      lta: v.optional(v.number()), // Leave Travel Allowance
      fixedAllowance: v.optional(v.number()),

      // Deductions/Contributions
      pfEmployee: v.optional(v.number()),
      pfEmployer: v.optional(v.number()),
      pf: v.optional(v.number()), // Legacy PF field
      tax: v.number(), // Professional Tax

      // Legacy/Generic fields if needed
      conveyance: v.optional(v.number()),
      special: v.optional(v.number()),
    })),
    payPeriod: v.string(), // "2024-01"
    payDate: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("processed"), v.literal("paid")),
  })
    .index("by_employee", ["employeeId"])
    .index("by_pay_period", ["payPeriod"]),

  notifications: defineTable({
    recipientId: v.id("employees"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("leave_request"),
      v.literal("leave_approved"),
      v.literal("leave_rejected"),
      v.literal("payroll"),
      v.literal("general")
    ),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_read_status", ["recipientId", "read"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
