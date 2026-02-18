import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
    // ===== User tables =====
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
    }).index("email", ["email"]).index("username", ["username"]),

    sessions: defineTable({
        userId: v.id("users"),
        token: v.string(),
        expiresAt: v.number(),
    })
        .index("token", ["token"])
        .index("userId", ["userId"]),

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
        promoCode: v.optional(v.string()),
        discountAmount: v.optional(v.number()),
    })
        .index("orderId", ["orderId"])
        .index("email", ["email"]),

    // ===== Invoices for Upgrades =====
    invoices: defineTable({
        invoiceId: v.string(),
        userId: v.id("users"),
        productSlug: v.string(),
        amount: v.number(),
        status: v.string(), // "pending", "paid", "expired"
        midtransToken: v.optional(v.string()),
        paymentUrl: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("invoiceId", ["invoiceId"])
        .index("userId", ["userId"]),

    // ===== Product catalog =====
    products: defineTable({
        slug: v.string(),
        name: v.string(),
        price: v.number(),
        originalPrice: v.number(),
        features: v.array(v.string()),
        badge: v.optional(v.string()),
        isActive: v.boolean(),
        sortOrder: v.number(),
    })
        .index("slug", ["slug"])
        .index("isActive", ["isActive"]),

    // ===== Promo codes =====
    promoCodes: defineTable({
        code: v.string(),
        discountType: v.string(), // "percentage" | "fixed"
        discountValue: v.number(),
        minPurchase: v.optional(v.number()),
        maxUses: v.optional(v.number()),
        usedCount: v.number(),
        validFrom: v.number(),
        validUntil: v.number(),
        isActive: v.boolean(),
        applicableProducts: v.optional(v.array(v.string())),
    }).index("code", ["code"]),

    // ===== Admin accounts =====
    adminUsers: defineTable({
        username: v.string(),
        passwordHash: v.string(),
        role: v.string(), // "super_admin" | "admin" | "content_editor"
        displayName: v.optional(v.string()),
        createdBy: v.optional(v.id("adminUsers")),
        isActive: v.boolean(),
    }).index("username", ["username"]),

    adminSessions: defineTable({
        adminId: v.id("adminUsers"),
        token: v.string(),
        expiresAt: v.number(),
    })
        .index("token", ["token"])
        .index("adminId", ["adminId"]),
});

export default schema;
