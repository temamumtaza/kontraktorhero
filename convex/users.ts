import { query, internalQuery, internalMutation } from "./_generated/server";
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

export const getUserById = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const updateUserTierInternal = internalMutation({
    args: { userId: v.id("users"), tier: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { tier: args.tier });
    },
});
