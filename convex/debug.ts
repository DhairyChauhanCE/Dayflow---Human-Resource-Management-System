import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDoc = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        // This is just to see the structure of a problematic doc
        // We'll try common tables
        const tables = ["employees", "payroll", "attendance", "leaveRequests", "notifications"];
        for (const table of tables) {
            try {
                const doc = await (ctx.db as any).get(args.id);
                if (doc) return { table, doc };
            } catch (e) { }
        }
        return null;
    }
});

export const ping = query({
    args: {},
    handler: async () => {
        return "pong";
    },
});
