"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

/**
 * Seed initial products and super admin account.
 * Safe to run multiple times — skips if data already exists.
 */
export const seedInitialData = action({
    args: {},
    handler: async (ctx) => {
        // 1. Seed products
        const productsToSeed = [
            {
                slug: "starter",
                name: "Starter Pack",
                price: 99000,
                originalPrice: 4000000,
                features: ["6 Modul Lengkap", "Akses selamanya + update gratis", "Garansi 7 hari uang kembali"],
                isActive: true,
                sortOrder: 1,
            },
            {
                slug: "hero",
                name: "Kontraktor Hero Membership",
                price: 149000,
                originalPrice: 7482000,
                features: ["6 Modul Lengkap", "80+ Template & Dokumen Kerja", "Akses selamanya + update gratis", "Garansi 7 hari uang kembali"],
                badge: "PALING LARIS",
                isActive: true,
                sortOrder: 2,
            },
            {
                slug: "upgrade-hero",
                name: "Upgrade to Hero",
                price: 99000,
                originalPrice: 4000000,
                features: ["Akses Selamanya", "Semua Modul (1-6)", "80+ File Bonus", "Update Gratis"],
                badge: "UPGRADE",
                isActive: true,
                sortOrder: 99,
            },
        ];

        for (const p of productsToSeed) {
            const existing = await ctx.runQuery(internal.products.getProductBySlugInternal, { slug: p.slug }).catch(() => null);
            if (!existing) {
                await ctx.runMutation(internal.products.createProduct, p);
                console.log(`✅ Seeded ${p.slug}`);
            } else {
                console.log(`⏭️ ${p.slug} already exists.`);
            }
        }

        // 2. Seed super admin
        const existingAdmin: any = await ctx.runQuery(
            internal.admin.getAdminByUsername,
            { username: "Admin" }
        );

        if (!existingAdmin) {
            const passwordHash = await bcrypt.hash("Mumtaza1!", 10);
            await ctx.runMutation(internal.admin.insertAdmin, {
                username: "Admin",
                passwordHash,
                role: "super_admin",
                displayName: "Super Admin",
            });
            console.log("✅ Seeded super admin account (username: Admin).");
        } else {
            console.log("⏭️ Super admin already exists. Skipping.");
        }
    },
});
