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

export const checkAvailability = query({
    args: { field: v.string(), value: v.string() },
    handler: async (ctx, args) => {
        const { field, value } = args;
        if (!value) return true; // Empty is "available" until filled? Or false? Let's say true (skip check)

        if (field === "email") {
            const user = await ctx.db
                .query("users")
                .withIndex("email", (q) => q.eq("email", value))
                .first();
            return !user;
        }

        if (field === "username") {
            const user = await ctx.db
                .query("users")
                .withIndex("username", (q) => q.eq("username", value))
                .first();
            return !user;
        }

        return true;
    },
});
