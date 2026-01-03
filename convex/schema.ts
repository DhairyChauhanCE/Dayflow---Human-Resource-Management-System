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
    // New Profile Fields
    bio: v.optional(v.string()),
    jobLove: v.optional(v.string()), // "What I love about my job"
    hobbies: v.optional(v.string()), // "My interests and hobbies"
    skills: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    // Leave Balances
    paidLeaveBalance: v.optional(v.number()), // Default 24
    sickLeaveBalance: v.optional(v.number()), // Default 7
    salaryDetails: v.optional(v.object({
      monthWage: v.number(),
      yearlyWage: v.number(),
      workingDaysPerWeek: v.number(),
      breakTimePerDay: v.string(),
      breakdown: v.object({
        basic: v.number(),
        hra: v.number(),
        standardAllowance: v.number(),
        performanceBonus: v.number(),
        lta: v.number(),
        fixedAllowance: v.number(),
        pfEmployee: v.number(),
        pfEmployer: v.number(),
        professionalTax: v.number(),
      })
    })),
    documents: v.optional(v.array(v.object({
      name: v.string(),
      fileId: v.id("_storage"),
      uploadedAt: v.string(),
    }))),
  })
    .index("by_user_id", ["userId"])
    .index("by_employee_id", ["employeeId"])
    .index("by_email", ["email"]),

  attendance: defineTable({
    employeeId: v.id("employees"),
    date: v.string(),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("half-day"),
      v.literal("leave")
    ),
    hoursWorked: v.optional(v.number()),
    remarks: v.optional(v.string()),
  })
    .index("by_employee_and_date", ["employeeId", "date"])
    .index("by_date", ["date"]),

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
    attachment: v.optional(v.id("_storage")), // Add attachment support
    appliedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  payroll: defineTable({
    employeeId: v.id("employees"),
    baseSalary: v.number(),
    allowances: v.number(),
    deductions: v.number(),
    netSalary: v.number(),
    breakdown: v.optional(v.object({
      basic: v.number(),
      hra: v.number(),
      standardAllowance: v.number(), // New
      performanceBonus: v.number(), // New
      lta: v.number(), // New
      fixedAllowance: v.number(), // New
      conveyance: v.optional(v.number()),
      special: v.optional(v.number()),
      tax: v.number(), // Income Tax
      pfEmployee: v.number(), // Employee Contribution
      pfEmployer: v.number(), // Employer Contribution
      professionalTax: v.number(), // New
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

  contactMessages: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    message: v.string(),
    createdAt: v.number(),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
  })
    .index("by_created_at", ["createdAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
