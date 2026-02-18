import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ===== Public: verify admin session =====

export const verifyAdminSession = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        const session = await ctx.db
            .query("adminSessions")
            .withIndex("token", (q) => q.eq("token", args.token!))
            .first();

        if (!session || session.expiresAt < Date.now()) return null;

        const admin = await ctx.db.get(session.adminId);
        if (!admin || !admin.isActive) return null;

        return {
            id: admin._id,
            username: admin.username,
            role: admin.role,
            displayName: admin.displayName,
        };
    },
});

// ===== Internal helpers =====

export const getAllProductsInternal = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

export const getAdminByUsername = internalQuery({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("adminUsers")
            .withIndex("username", (q) => q.eq("username", args.username))
            .first();
    },
});

export const createAdminSession = internalMutation({
    args: { adminId: v.id("adminUsers") },
    handler: async (ctx, args) => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        const expiresAt = Date.now() + 4 * 60 * 60 * 1000;

        await ctx.db.insert("adminSessions", {
            adminId: args.adminId,
            token,
            expiresAt,
        });

        return token;
    },
});

export const verifyAdminSessionInternal = internalQuery({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("adminSessions")
            .withIndex("token", (q) => q.eq("token", args.token))
            .first();

        if (!session || session.expiresAt < Date.now()) return null;

        const admin = await ctx.db.get(session.adminId);
        if (!admin || !admin.isActive) return null;

        return admin;
    },
});

export const insertAdmin = internalMutation({
    args: {
        username: v.string(),
        passwordHash: v.string(),
        role: v.string(),
        displayName: v.optional(v.string()),
        createdBy: v.optional(v.id("adminUsers")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("adminUsers", {
            ...args,
            isActive: true,
        });
    },
});

// ===== Admin data queries (session-protected) =====

export const getAllProducts = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return [];
        const session = await ctx.db
            .query("adminSessions")
            .withIndex("token", (q) => q.eq("token", args.token!))
            .first();
        if (!session || session.expiresAt < Date.now()) return [];

        return await ctx.db.query("products").order("asc").collect();
    },
});

export const getAllPromos = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return [];
        const session = await ctx.db
            .query("adminSessions")
            .withIndex("token", (q) => q.eq("token", args.token!))
            .first();
        if (!session || session.expiresAt < Date.now()) return [];

        return await ctx.db.query("promoCodes").order("desc").collect();
    },
});

export const getAllAdmins = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return [];
        const session = await ctx.db
            .query("adminSessions")
            .withIndex("token", (q) => q.eq("token", args.token!))
            .first();
        if (!session || session.expiresAt < Date.now()) return [];

        const admins = await ctx.db.query("adminUsers").collect();
        return admins.map((a) => ({
            _id: a._id,
            username: a.username,
            role: a.role,
            displayName: a.displayName,
            isActive: a.isActive,
            _creationTime: a._creationTime,
        }));
    },
});

export const getAllUsers = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return [];
        const session = await ctx.db
            .query("adminSessions")
            .withIndex("token", (q) => q.eq("token", args.token!))
            .first();
        if (!session || session.expiresAt < Date.now()) return [];

        return await ctx.db.query("users").order("desc").collect();
    },
});
