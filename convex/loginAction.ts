"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

/**
 * Custom login action that verifies bcrypt-hashed passwords.
 * We use bcrypt (not Scrypt) because accounts are created via
 * our webhook (createPaidUser) which uses bcrypt hashing.
 *
 * This runs in Node.js runtime for bcrypt compatibility.
 */
export const login = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Find auth account by email
        const authAccount = await ctx.runQuery(
            internal.checkout.getAuthAccountByEmail,
            { email: args.email }
        );

        if (!authAccount || !authAccount.secret) {
            throw new Error("Email atau password salah.");
        }

        // 2. Verify password against bcrypt hash
        const isValid = await bcrypt.compare(args.password, authAccount.secret);
        if (!isValid) {
            throw new Error("Email atau password salah.");
        }

        // 3. Get the full user profile
        const user = await ctx.runQuery(internal.checkout.getUserById, {
            userId: authAccount.userId,
        });

        if (!user) {
            throw new Error("Akun tidak ditemukan.");
        }

        // 4. Create a session token (simple approach)
        const sessionToken = await ctx.runMutation(
            internal.checkout.createSession,
            { userId: user._id }
        );

        return {
            sessionToken,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                tier: user.tier,
                subscriptionStatus: user.subscriptionStatus,
            },
        };
    },
});
