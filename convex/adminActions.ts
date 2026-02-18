"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

// ===== Admin login (requires bcrypt = Node.js runtime) =====

async function handleAdminLogin(
    ctx: any,
    args: { username: string; password: string }
): Promise<{ token: string; admin: { id: string; username: string; role: string; displayName: string | undefined } }> {
    const admin: any = await ctx.runQuery(internal.admin.getAdminByUsername, {
        username: args.username,
    });

    if (!admin || !admin.isActive) {
        throw new Error("Username atau password salah.");
    }

    const isValid = await bcrypt.compare(args.password, admin.passwordHash);
    if (!isValid) {
        throw new Error("Username atau password salah.");
    }

    const token: string = await ctx.runMutation(internal.admin.createAdminSession, {
        adminId: admin._id,
    });

    return {
        token,
        admin: {
            id: admin._id,
            username: admin.username,
            role: admin.role,
            displayName: admin.displayName,
        },
    };
}

export const adminLogin = action({
    args: {
        username: v.string(),
        password: v.string(),
    },
    handler: handleAdminLogin,
});

// ===== Create admin account (super_admin only) =====

async function handleCreateAdmin(
    ctx: any,
    args: { sessionToken: string; username: string; password: string; role: string; displayName?: string }
): Promise<string> {
    const caller: any = await ctx.runQuery(internal.admin.verifyAdminSessionInternal, {
        token: args.sessionToken,
    });
    if (!caller || caller.role !== "super_admin") {
        throw new Error("Hanya super admin yang bisa membuat akun admin.");
    }

    const existing: any = await ctx.runQuery(internal.admin.getAdminByUsername, {
        username: args.username,
    });
    if (existing) throw new Error("Username sudah dipakai.");

    const allowedRoles = ["admin", "content_editor"];
    if (!allowedRoles.includes(args.role)) {
        throw new Error("Role tidak valid. Pilih: admin atau content_editor.");
    }

    const passwordHash = await bcrypt.hash(args.password, 10);

    const id: string = await ctx.runMutation(internal.admin.insertAdmin, {
        username: args.username,
        passwordHash,
        role: args.role,
        displayName: args.displayName,
        createdBy: caller._id,
    });

    return id;
}

export const createAdmin = action({
    args: {
        sessionToken: v.string(),
        username: v.string(),
        password: v.string(),
        role: v.string(),
        displayName: v.optional(v.string()),
    },
    handler: handleCreateAdmin,
});

// ===== Admin-protected CRUD wrapper (action for session verification) =====

async function handleAdminCrud(
    ctx: any,
    args: { sessionToken: string; operation: string; data: any }
): Promise<any> {
    const admin: any = await ctx.runQuery(internal.admin.verifyAdminSessionInternal, {
        token: args.sessionToken,
    });
    if (!admin) throw new Error("Sesi admin tidak valid. Silakan login ulang.");

    const { operation, data } = args;

    switch (operation) {
        case "createProduct":
            return await ctx.runMutation(internal.products.createProduct, data);
        case "updateProduct":
            return await ctx.runMutation(internal.products.updateProduct, data);
        case "deleteProduct":
            return await ctx.runMutation(internal.products.deleteProduct, data);
        case "createPromo":
            return await ctx.runMutation(internal.promos.createPromo, data);
        case "updatePromo":
            return await ctx.runMutation(internal.promos.updatePromo, data);
        case "deletePromo":
            return await ctx.runMutation(internal.promos.deletePromo, data);
        case "updateUserTier":
            return await ctx.runMutation(internal.users.updateUserTierInternal, data);
        default:
            throw new Error("Operasi tidak dikenal.");
    }
}

export const adminCrud = action({
    args: {
        sessionToken: v.string(),
        operation: v.string(),
        data: v.any(),
    },
    handler: handleAdminCrud,
});
