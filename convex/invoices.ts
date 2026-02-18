import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const createInvoice = internalMutation({
    args: {
        invoiceId: v.string(),
        userId: v.id("users"),
        productSlug: v.string(),
        amount: v.number(),
        midtransToken: v.optional(v.string()),
        paymentUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("invoices", {
            ...args,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

export const markInvoicePaid = internalMutation({
    args: { invoiceId: v.string() },
    handler: async (ctx, args) => {
        const invoice = await ctx.db
            .query("invoices")
            .withIndex("invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
            .first();

        if (invoice) {
            await ctx.db.patch(invoice._id, { status: "paid" });

            // Upgrade user
            await ctx.db.patch(invoice.userId, {
                tier: "hero",
                lastTransactionId: args.invoiceId,
            });
        }
    },
});

export const getInvoiceById = internalQuery({
    args: { invoiceId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("invoices")
            .withIndex("invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
            .first();
    },
});
