import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getMyNotifications = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    let query = ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q: any) => q.eq("recipientId", employee._id));

    if (args.unreadOnly) {
      query = query.filter((q: any) => q.eq(q.field("read"), false));
    }

    return await query.order("desc").take(50);
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.recipientId !== employee._id) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const employee = await ctx.runQuery(api.employees.getCurrentEmployee);
    if (!employee) throw new Error("Unauthorized");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_read_status", (q: any) => 
        q.eq("recipientId", employee._id).eq("read", false)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});
