import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Midtrans Webhook Handler
 * Verifies payment signature and creates user account.
 */
http.route({
    path: "/midtrans-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();
            const {
                order_id,
                status_code,
                gross_amount,
                signature_key,
                transaction_status,
                fraud_status,
            } = body;

            const serverKey = process.env.MIDTRANS_SERVER_KEY;
            if (!serverKey) {
                return new Response(
                    JSON.stringify({ error: "Server key not configured" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }

            // Verify Midtrans signature (SHA-512)
            const signaturePayload = `${order_id}${status_code}${gross_amount}${serverKey}`;
            const encoder = new TextEncoder();
            const data = encoder.encode(signaturePayload);
            const hashBuffer = await crypto.subtle.digest("SHA-512", data);

            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const expectedSignature = hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");

            if (signature_key !== expectedSignature) {
                console.error("Invalid Midtrans signature");
                return new Response(
                    JSON.stringify({ error: "Invalid signature" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }

            const isSuccess =
                (transaction_status === "capture" && fraud_status === "accept") ||
                transaction_status === "settlement";

            if (isSuccess) {
                // Check if it's an Upgrade (UPG- prefix) or New Registration (KH- prefix)
                if (order_id.startsWith("UPG-")) {
                    await ctx.runMutation(internal.invoices.markInvoicePaid, {
                        invoiceId: order_id,
                    });
                    console.log(`Upgrade SUCCESS for invoice ${order_id}`);
                    return new Response(
                        JSON.stringify({ success: true, type: "upgrade" }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }

                // New Registration
                const userId = await ctx.runMutation(
                    internal.checkout.createPaidUser,
                    { orderId: order_id }
                );

                console.log(
                    `Payment SUCCESS for order ${order_id} → user ${userId}`
                );
                return new Response(
                    JSON.stringify({ success: true, type: "registration" }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            }

            console.log(
                `Payment status: ${transaction_status} for order ${order_id}`
            );
            return new Response(
                JSON.stringify({ success: false, status: transaction_status }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } catch (error: any) {
            console.error("Webhook error:", error);
            return new Response(
                JSON.stringify({ error: error.message || "Internal error" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
    }),
});

export default http;
