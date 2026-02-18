import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Public query: Validate session token and return user profile.
 */
export const getMe = query({
    args: { sessionToken: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.sessionToken) return null;

        const session = await ctx.db
            .query("sessions")
            .withIndex("token", (q) => q.eq("token", args.sessionToken!))
            .first();

        if (!session || session.expiresAt < Date.now()) {
            return null;
        }

        return await ctx.db.get(session.userId);
    },
});
