import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        passwordHash: v.optional(v.string()),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        phone: v.optional(v.string()),
        username: v.optional(v.string()),
        tier: v.optional(v.string()),
        subscriptionStatus: v.optional(v.string()),
        lastTransactionId: v.optional(v.string()),
    }).index("email", ["email"]),

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
        status: v.string(),
    })
        .index("orderId", ["orderId"])
        .index("email", ["email"]),

    sessions: defineTable({
        userId: v.id("users"),
        token: v.string(),
        expiresAt: v.number(),
    })
        .index("token", ["token"])
        .index("userId", ["userId"]),
});

export default schema;
