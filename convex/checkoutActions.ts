"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

/**
 * PUBLIC action: initiate checkout with DB-driven pricing and promo support.
 * 1. Validates product exists + is active in DB
 * 2. Validates promo code (if provided) server-side
 * 3. Hashes password
 * 4. Creates Midtrans transaction with server-calculated price
 * 5. Stores pending registration
 * NO ACCOUNT IS CREATED HERE — only after payment succeeds via webhook.
 */
async function handleInitiateCheckout(
    ctx: any,
    args: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        username: string;
        productSlug: string;
        promoCode?: string;
    }
): Promise<{ token: string; redirect_url: string; orderId: string; finalPrice: number; discount: number }> {
    // 1. Get product from database (single source of truth for pricing)
    const product: any = await ctx.runQuery(
        internal.products.getProductBySlugInternal,
        { slug: args.productSlug }
    );
    if (!product || !product.isActive) {
        throw new Error("Produk tidak ditemukan atau tidak aktif.");
    }

    let finalPrice = product.price;
    let discount = 0;
    let promoCodeUsed: string | undefined;

    // 2. Validate promo code if provided
    if (args.promoCode && args.promoCode.trim()) {
        const promoResult: any = await ctx.runQuery(
            internal.promos.validatePromoInternal,
            {
                code: args.promoCode,
                productSlug: args.productSlug,
                productPrice: product.price,
            }
        );

        if (promoResult) {
            finalPrice = promoResult.finalPrice;
            discount = promoResult.discount;
            promoCodeUsed = args.promoCode.toUpperCase().trim();
        }
        // If promo is invalid, silently ignore — use original price
        // (client already showed validation message via public validatePromo)
    }

    // 3. Ensure price is never negative (0 is allowed for 100% discount)
    console.log(`[CHECKOUT] Slug: ${args.productSlug}, Price: ${product.price}, Discount: ${discount}, Final: ${finalPrice}`);

    if (finalPrice < 0) {
        throw new Error(`Harga akhir tidak valid (${finalPrice}). Hubungi support.`);
    }

    // 4. Check if email already has a pending registration
    const existingPending: any = await ctx.runQuery(
        internal.checkout.getPendingByEmail,
        { email: args.email }
    );
    if (existingPending && existingPending.status === "pending") {
        await ctx.runMutation(internal.checkout.deletePending, {
            id: existingPending._id,
        });
    }

    // 5. Hash password server-side
    const passwordHash = await bcrypt.hash(args.password, 10);

    // 6. Handle Free/Paid Logic
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const orderId = `KH-${Date.now()}-${args.email.split("@")[0].slice(0, 6)}`;
    let midtransToken = "FREE";
    let redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.kontraktorhero.com"}/checkout?status=paid&orderId=${orderId}`;

    // A. FREE TRANSACTION (0 Rupiah)
    if (finalPrice === 0) {
        // Store pending first (createPaidUser expects it)
        await ctx.runMutation(internal.checkout.savePendingRegistration, {
            email: args.email,
            passwordHash,
            firstName: args.firstName,
            lastName: args.lastName,
            phone: args.phone,
            username: args.username,
            tier: args.productSlug,
            orderId,
            amount: 0,
            promoCode: promoCodeUsed,
            discountAmount: discount,
        });

        // Directly activate user
        await ctx.runMutation(internal.checkout.createPaidUser, { orderId });

        return {
            token: "FREE",
            redirect_url: redirectUrl,
            orderId,
            finalPrice,
            discount,
        };
    }

    // B. PAID TRANSACTION (Midtrans)
    if (!midtransServerKey) {
        throw new Error("Payment system not configured.");
    }

    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: finalPrice,
        },
        item_details: [
            {
                id: args.productSlug,
                price: finalPrice,
                quantity: 1,
                name: product.name + (discount > 0 ? ` (Diskon Rp ${discount.toLocaleString("id-ID")})` : ""),
            },
        ],
        customer_details: {
            first_name: args.firstName,
            last_name: args.lastName,
            email: args.email,
            phone: args.phone,
        },
        callbacks: {
            finish: redirectUrl,
        },
    };

    const baseUrl = isProduction
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const authString = Buffer.from(`${midtransServerKey}:`).toString("base64");

    const response = await fetch(baseUrl, {
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
        const errorMsg =
            result.error_messages?.[0] || "Gagal membuat transaksi pembayaran.";
        throw new Error(errorMsg);
    }

    midtransToken = result.token;
    redirectUrl = result.redirect_url;

    // 7. Store pending registration
    await ctx.runMutation(internal.checkout.savePendingRegistration, {
        email: args.email,
        passwordHash,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        username: args.username,
        tier: args.productSlug,
        orderId,
        amount: finalPrice,
        promoCode: promoCodeUsed,
        discountAmount: discount > 0 ? discount : undefined,
    });

    return {
        token: midtransToken,
        redirect_url: redirectUrl,
        orderId,
        finalPrice,
        discount,
    };
}

export const initiateCheckout = action({
    args: {
        email: v.string(),
        password: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        phone: v.string(),
        username: v.string(),
        productSlug: v.string(),
        promoCode: v.optional(v.string()),
    },
    handler: handleInitiateCheckout,
});
