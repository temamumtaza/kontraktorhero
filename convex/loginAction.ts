"use node";

import { ActionCtx } from "./_generated/server";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

/**
 * Custom login: verifies bcrypt password against users table.
 * Runs in Node.js runtime for bcrypt compatibility.
 */
async function handleLogin(
    ctx: ActionCtx,
    args: { email: string; password: string }
): Promise<{
    sessionToken: string;
    user: {
        id: string;
        email: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        tier: string | undefined;
        subscriptionStatus: string | undefined;
    };
}> {
    // 1. Find user by email
    const user: any = await ctx.runQuery(
        internal.checkout.getUserByEmail,
        { email: args.email }
    );

    if (!user || !user.passwordHash) {
        throw new Error("Email atau password salah.");
    }

    // 2. Verify bcrypt hash
    const isValid = await bcrypt.compare(args.password, user.passwordHash);
    if (!isValid) {
        throw new Error("Email atau password salah.");
    }

    // 3. Create session
    const sessionToken: string = await ctx.runMutation(
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
}

export const login = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: handleLogin,
});
