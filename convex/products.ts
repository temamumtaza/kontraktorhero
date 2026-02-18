import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ===== Public queries =====

export const getActiveProducts = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query("products")
            .withIndex("isActive")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        // Filter out internal upgrade products
        const publicProducts = products.filter(p => p.slug !== "upgrade-hero");

        return publicProducts.sort((a, b) => a.sortOrder - b.sortOrder);
    },
});

export const getProductBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("products")
            .withIndex("slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

// ===== Admin mutations (called via admin.ts wrappers) =====

export const createProduct = internalMutation({
    args: {
        slug: v.string(),
        name: v.string(),
        price: v.number(),
        originalPrice: v.number(),
        features: v.array(v.string()),
        badge: v.optional(v.string()),
        isActive: v.boolean(),
        sortOrder: v.number(),
    },
    handler: async (ctx, args) => {
        // Check slug uniqueness
        const existing = await ctx.db
            .query("products")
            .withIndex("slug", (q) => q.eq("slug", args.slug))
            .first();
        if (existing) throw new Error(`Product with slug "${args.slug}" already exists.`);
        return await ctx.db.insert("products", args);
    },
});

export const updateProduct = internalMutation({
    args: {
        id: v.id("products"),
        slug: v.optional(v.string()),
        name: v.optional(v.string()),
        price: v.optional(v.number()),
        originalPrice: v.optional(v.number()),
        features: v.optional(v.array(v.string())),
        badge: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        sortOrder: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        // Remove undefined fields
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filtered);
    },
});

export const deleteProduct = internalMutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ===== Internal: Get product by slug for checkout =====

export const getProductBySlugInternal = internalQuery({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const product = await ctx.db
            .query("products")
            .withIndex("slug", (q) => q.eq("slug", args.slug))
            .first();
        if (!product || !product.isActive) {
            throw new Error("Produk tidak ditemukan atau tidak aktif.");
        }
        return product;
    },
});

// ===== Seeding =====

export const seedUpgradeProduct = internalMutation({
    args: {},
    handler: async (ctx) => {
        const slug = "upgrade-hero";
        const existing = await ctx.db
            .query("products")
            .withIndex("slug", (q) => q.eq("slug", slug))
            .first();

        if (existing) {
            console.log("Upgrade product already exists.");
            return;
        }

        await ctx.db.insert("products", {
            slug,
            name: "Upgrade to Hero",
            price: 99000,
            originalPrice: 4000000,
            features: [
                "Akses Selamanya",
                "Semua Modul (1-6)",
                "80+ File Bonus",
                "Update Gratis",
            ],
            badge: "UPGRADE",
            isActive: true,
            sortOrder: 99,
        });
        console.log("Seeded 'upgrade-hero' product.");
    },
});
