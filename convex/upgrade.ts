"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ===== Initiate Upgrade =====

export const initiateUpgrade = action({
    args: {
        userId: v.id("users"),
        origin: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<{ token: string; redirect_url: string }> => {
        // 1. Get user
        const user = await ctx.runQuery(internal.users.getUserById, { userId: args.userId });
        if (!user) throw new Error("User tidak ditemukan.");
        if (user.tier === "hero") throw new Error("Anda sudah menjadi Hero Member.");

        // 2. Get Upgrade Product (Auto-seed if missing)
        let product;
        try {
            product = await ctx.runQuery(internal.products.getProductBySlugInternal, { slug: "upgrade-hero" });
        } catch (e) {
            // Product not found, seed it
            await ctx.runMutation(internal.products.seedUpgradeProduct);
            product = await ctx.runQuery(internal.products.getProductBySlugInternal, { slug: "upgrade-hero" });
        }

        if (!product || !product.isActive) throw new Error("Produk upgrade tidak tersedia.");

        const finalPrice = product.price; // Rp 99.000
        const invoiceId = `UPG-${Date.now()}-${user.email?.split("@")[0].slice(0, 6)}`;

        // 3. Create Midtrans Transaction
        const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

        if (!midtransServerKey) throw new Error("Payment system not configured.");

        const appUrl = args.origin || process.env.NEXT_PUBLIC_APP_URL || "https://www.kontraktorhero.com";

        const parameter = {
            transaction_details: {
                order_id: invoiceId,
                gross_amount: finalPrice,
            },
            item_details: [
                {
                    id: product.slug,
                    price: finalPrice,
                    quantity: 1,
                    name: "Upgrade to Hero Member",
                },
            ],
            customer_details: {
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                phone: user.phone,
            },
            callbacks: {
                finish: `${appUrl}/course/settings?status=paid`,
            },
        };

        const midtransUrl = isProduction
            ? "https://app.midtrans.com/snap/v1/transactions"
            : "https://app.sandbox.midtrans.com/snap/v1/transactions";

        const authString = Buffer.from(`${midtransServerKey}:`).toString("base64");

        const response = await fetch(midtransUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify(parameter),
        });

        const result = await response.json();

        if (!response.ok) {
            const errorMsg = result.error_messages?.[0] || "Gagal membuat transaksi upgrade.";
            throw new Error(errorMsg);
        }

        // 4. Store Invoice
        await ctx.runMutation(internal.invoices.createInvoice, {
            invoiceId,
            userId: args.userId,
            productSlug: product.slug,
            amount: finalPrice,
            midtransToken: result.token,
            paymentUrl: result.redirect_url,
        });

        return {
            token: result.token,
            redirect_url: result.redirect_url,
        };
    },
});

export const verifyPaymentStatus = action({
    args: { invoiceId: v.string() },
    handler: async (ctx, args) => {
        const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
        if (!midtransServerKey) throw new Error("Server key missing");

        const baseUrl = isProduction
            ? `https://api.midtrans.com/v2/${args.invoiceId}/status`
            : `https://api.sandbox.midtrans.com/v2/${args.invoiceId}/status`;

        const authString = Buffer.from(`${midtransServerKey}:`).toString("base64");

        const response = await fetch(baseUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Basic ${authString}`,
            },
        });

        const data = await response.json();

        const isSuccess = (data.transaction_status === "capture" && data.fraud_status === "accept") ||
            data.transaction_status === "settlement";

        if (isSuccess) {
            await ctx.runMutation(internal.invoices.markInvoicePaid, {
                invoiceId: args.invoiceId,
            });
            return { success: true, status: data.transaction_status };
        }

        return { success: false, status: data.transaction_status };
    },
});
