import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ===== Public: validate promo code =====

export const validatePromo = query({
    args: {
        code: v.string(),
        productSlug: v.string(),
        productPrice: v.number(),
    },
    handler: async (ctx, args) => {
        const code = args.code.toUpperCase().trim();

        const promo = await ctx.db
            .query("promoCodes")
            .withIndex("code", (q) => q.eq("code", code))
            .first();

        if (!promo) return { valid: false, error: "Kode promo tidak ditemukan." };
        if (!promo.isActive) return { valid: false, error: "Kode promo sudah tidak berlaku." };

        const now = Date.now();
        if (now < promo.validFrom) return { valid: false, error: "Kode promo belum aktif." };
        if (now > promo.validUntil) return { valid: false, error: "Kode promo sudah kedaluwarsa." };

        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
            return { valid: false, error: "Kode promo sudah habis kuotanya." };
        }

        if (promo.applicableProducts && promo.applicableProducts.length > 0) {
            if (!promo.applicableProducts.includes(args.productSlug)) {
                return { valid: false, error: "Kode promo tidak berlaku untuk produk ini." };
            }
        }

        if (promo.minPurchase && args.productPrice < promo.minPurchase) {
            return {
                valid: false,
                error: `Minimal pembelian Rp ${promo.minPurchase.toLocaleString("id-ID")} untuk menggunakan promo ini.`,
            };
        }

        // Calculate discount
        let discount = 0;
        if (promo.discountType === "percentage") {
            discount = Math.floor(args.productPrice * (promo.discountValue / 100));
        } else {
            discount = promo.discountValue;
        }
        discount = Math.min(discount, args.productPrice); // never exceed price

        const finalPrice = args.productPrice - discount;

        return {
            valid: true,
            discount,
            finalPrice,
            discountLabel:
                promo.discountType === "percentage"
                    ? `${promo.discountValue}%`
                    : `Rp ${promo.discountValue.toLocaleString("id-ID")}`,
        };
    },
});

// ===== Internal: server-side promo validation for checkout =====

export const validatePromoInternal = internalQuery({
    args: {
        code: v.string(),
        productSlug: v.string(),
        productPrice: v.number(),
    },
    handler: async (ctx, args) => {
        const code = args.code.toUpperCase().trim();

        const promo = await ctx.db
            .query("promoCodes")
            .withIndex("code", (q) => q.eq("code", code))
            .first();

        if (!promo || !promo.isActive) return null;

        const now = Date.now();
        if (now < promo.validFrom || now > promo.validUntil) return null;
        if (promo.maxUses && promo.usedCount >= promo.maxUses) return null;

        if (promo.applicableProducts && promo.applicableProducts.length > 0) {
            if (!promo.applicableProducts.includes(args.productSlug)) return null;
        }

        if (promo.minPurchase && args.productPrice < promo.minPurchase) return null;

        let discount = 0;
        if (promo.discountType === "percentage") {
            discount = Math.floor(args.productPrice * (promo.discountValue / 100));
        } else {
            discount = promo.discountValue;
        }
        discount = Math.min(discount, args.productPrice);

        return { promoId: promo._id, discount, finalPrice: args.productPrice - discount };
    },
});

// ===== Internal: increment usage after payment =====

export const incrementPromoUsage = internalMutation({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const promo = await ctx.db
            .query("promoCodes")
            .withIndex("code", (q) => q.eq("code", args.code.toUpperCase().trim()))
            .first();
        if (promo) {
            await ctx.db.patch(promo._id, { usedCount: promo.usedCount + 1 });
        }
    },
});

// ===== Admin queries/mutations =====

export const getAllPromos = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("promoCodes").order("desc").collect();
    },
});

export const createPromo = internalMutation({
    args: {
        code: v.string(),
        discountType: v.string(),
        discountValue: v.number(),
        minPurchase: v.optional(v.number()),
        maxUses: v.optional(v.number()),
        validFrom: v.number(),
        validUntil: v.number(),
        isActive: v.boolean(),
        applicableProducts: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const code = args.code.toUpperCase().trim();
        const existing = await ctx.db
            .query("promoCodes")
            .withIndex("code", (q) => q.eq("code", code))
            .first();
        if (existing) throw new Error(`Kode promo "${code}" sudah ada.`);

        return await ctx.db.insert("promoCodes", {
            ...args,
            code,
            usedCount: 0,
        });
    },
});

export const updatePromo = internalMutation({
    args: {
        id: v.id("promoCodes"),
        code: v.optional(v.string()),
        discountType: v.optional(v.string()),
        discountValue: v.optional(v.number()),
        minPurchase: v.optional(v.number()),
        maxUses: v.optional(v.number()),
        validFrom: v.optional(v.number()),
        validUntil: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        applicableProducts: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        if (filtered.code) filtered.code = (filtered.code as string).toUpperCase().trim();
        await ctx.db.patch(id, filtered);
    },
});

export const deletePromo = internalMutation({
    args: { id: v.id("promoCodes") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
