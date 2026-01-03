import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitMessage = mutation({
    args: {
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        company: v.optional(v.string()),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("contactMessages", {
            ...args,
            createdAt: Date.now(),
            status: "new",
        });
        return messageId;
    },
});
