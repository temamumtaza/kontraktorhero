import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
    ...authTables,
    // Override the users table to add custom fields
    users: defineTable({
        // Fields managed by Convex Auth
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.float64()),
        isAnonymous: v.optional(v.boolean()),
        // Custom fields for our app
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        phone: v.optional(v.string()),
        username: v.optional(v.string()),
        tier: v.optional(v.string()),
        subscriptionStatus: v.optional(v.string()), // "inactive" | "active"
        lastTransactionId: v.optional(v.string()),
    }).index("email", ["email"]),

    // Temporary registration data — stored before payment
    // Account is NOT created until payment succeeds
    pendingRegistrations: defineTable({
        email: v.string(),
        passwordHash: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        phone: v.string(),
        username: v.string(),
        tier: v.string(),
        orderId: v.string(),
        amount: v.number(),
        status: v.string(), // "pending" | "paid" | "expired"
    })
        .index("orderId", ["orderId"])
        .index("email", ["email"]),

    // Custom sessions for login (bcrypt-based, not Convex Auth)
    sessions: defineTable({
        userId: v.id("users"),
        token: v.string(),
        expiresAt: v.number(),
    })
        .index("token", ["token"])
        .index("userId", ["userId"]),
});

export default schema;
