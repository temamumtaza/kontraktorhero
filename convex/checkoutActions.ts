"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

// Server-side pricing — single source of truth
const PRICING: Record<string, { price: number; name: string }> = {
    starter: { price: 99000, name: "Kontraktor Hero Starter Pack" },
    hero: { price: 149000, name: "Kontraktor Hero Membership" },
};

/**
 * PUBLIC action (no auth required).
 * 1. Validates form data
 * 2. Hashes password
 * 3. Stores registration data in pendingRegistrations
 * 4. Creates Midtrans transaction with server-side pricing
 * 5. Returns snap token to client
 *
 * NO ACCOUNT IS CREATED HERE — only after payment succeeds.
 */
export const initiateCheckout = action({
    args: {
        email: v.string(),
        password: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        phone: v.string(),
        username: v.string(),
        tier: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Validate tier & get server-side price
        const plan = PRICING[args.tier];
        if (!plan) throw new Error("Tier tidak valid.");

        // 2. Check if email already has a pending registration
        const existingPending = await ctx.runQuery(
            internal.checkout.getPendingByEmail,
            { email: args.email }
        );
        if (existingPending && existingPending.status === "pending") {
            // Clean up stale pending registration (allow re-registration)
            await ctx.runMutation(internal.checkout.deletePending, {
                id: existingPending._id,
            });
        }

        // 3. Hash password server-side
        const passwordHash = await bcrypt.hash(args.password, 10);

        // 4. Create Midtrans transaction
        const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

        if (!midtransServerKey) {
            throw new Error("Payment system not configured.");
        }

        const orderId = `KH-${Date.now()}-${args.email.split("@")[0].slice(0, 6)}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: plan.price,
            },
            item_details: [
                {
                    id: args.tier,
                    price: plan.price,
                    quantity: 1,
                    name: plan.name,
                },
            ],
            customer_details: {
                first_name: args.firstName,
                last_name: args.lastName,
                email: args.email,
                phone: args.phone,
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.kontraktorhero.com"}/checkout?status=paid&orderId=${orderId}`,
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

        // 5. Store pending registration (NO account created yet)
        await ctx.runMutation(internal.checkout.savePendingRegistration, {
            email: args.email,
            passwordHash,
            firstName: args.firstName,
            lastName: args.lastName,
            phone: args.phone,
            username: args.username,
            tier: args.tier,
            orderId,
            amount: plan.price,
        });

        return {
            token: result.token,
            redirect_url: result.redirect_url,
            orderId,
        };
    },
});
