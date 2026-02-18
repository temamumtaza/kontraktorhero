import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ===== Pending Registration functions =====

export const getPendingByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("pendingRegistrations")
            .withIndex("email", (q) => q.eq("email", args.email))
            .first();
    },
});

export const getPendingByOrderId = internalQuery({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("pendingRegistrations")
            .withIndex("orderId", (q) => q.eq("orderId", args.orderId))
            .first();
    },
});

export const savePendingRegistration = internalMutation({
    args: {
        email: v.string(),
        passwordHash: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        phone: v.string(),
        username: v.string(),
        tier: v.string(),
        orderId: v.string(),
        amount: v.number(),
        promoCode: v.optional(v.string()),
        discountAmount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("pendingRegistrations", {
            ...args,
            status: "pending",
        });
    },
});

export const markPaid = internalMutation({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const pending = await ctx.db
            .query("pendingRegistrations")
            .withIndex("orderId", (q) => q.eq("orderId", args.orderId))
            .first();
        if (pending) {
            await ctx.db.patch(pending._id, { status: "paid" });
        }
        return pending;
    },
});

export const deletePending = internalMutation({
    args: { id: v.id("pendingRegistrations") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ===== Create user after payment =====

export const createPaidUser = internalMutation({
    args: { orderId: v.string() },
    handler: async (ctx, args) => {
        const pending = await ctx.db
            .query("pendingRegistrations")
            .withIndex("orderId", (q) => q.eq("orderId", args.orderId))
            .first();

        if (!pending) {
            console.error(`No pending registration for order ${args.orderId}`);
            return null;
        }

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", pending.email))
            .first();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                subscriptionStatus: "active",
                tier: pending.tier,
                lastTransactionId: pending.orderId,
            });
            await ctx.db.patch(pending._id, { status: "paid" });
            return existingUser._id;
        }

        // Create user with password hash stored directly
        const userId = await ctx.db.insert("users", {
            email: pending.email,
            name: `${pending.firstName} ${pending.lastName}`.trim(),
            passwordHash: pending.passwordHash,
            firstName: pending.firstName,
            lastName: pending.lastName,
            phone: pending.phone,
            username: pending.username,
            tier: pending.tier,
            subscriptionStatus: "active",
            lastTransactionId: pending.orderId,
        });

        await ctx.db.patch(pending._id, { status: "paid" });

        // Increment promo code usage if applicable
        if (pending.promoCode) {
            const promo = await ctx.db
                .query("promoCodes")
                .withIndex("code", (q) => q.eq("code", pending.promoCode!))
                .first();
            if (promo) {
                await ctx.db.patch(promo._id, { usedCount: promo.usedCount + 1 });
            }
        }

        console.log(`Created paid user ${userId} for order ${args.orderId}`);
        return userId;
    },
});

// ===== Login support functions =====

// Get user by email (for login verification)
export const getUserByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", args.email))
            .first();
    },
});

// Get user by ID
export const getUserById = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

// Create a session
export const createSession = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

        await ctx.db.insert("sessions", {
            userId: args.userId,
            token,
            expiresAt,
        });

        return token;
    },
});

// Validate a session token
export const validateSession = internalQuery({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("token", (q) => q.eq("token", args.token))
            .first();

        if (!session || session.expiresAt < Date.now()) {
            return null;
        }

        return await ctx.db.get(session.userId);
    },
});
