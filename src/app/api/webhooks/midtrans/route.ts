import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const notification = await request.json();

        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;
        const grossAmount = notification.gross_amount;
        const statusCode = notification.status_code;
        const signatureKey = notification.signature_key;

        // 1. Verify Signature
        const serverKey = process.env.MIDTRANS_SERVER_KEY!;
        const hash = crypto
            .createHash("sha512")
            .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
            .digest("hex");

        if (hash !== signatureKey) {
            return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
        }

        // 2. Determine Success Status
        let isSuccess = false;
        if (transactionStatus === "capture") {
            if (fraudStatus === "challenge") {
                // TODO: Handle challenge
            } else if (fraudStatus === "accept") {
                isSuccess = true;
            }
        } else if (transactionStatus === "settlement") {
            isSuccess = true;
        } else if (
            transactionStatus === "cancel" ||
            transactionStatus === "deny" ||
            transactionStatus === "expire"
        ) {
            isSuccess = false;
        }

        // 3. Update User Status in Database
        if (isSuccess) {
            // Find user by last_transaction_id (stored during token gen)
            // Or you can store order_id in a separate 'transactions' table for better robustness.
            // For MVP, we search profiles where last_transaction_id matches.

            const { data: user, error: findError } = await supabaseAdmin
                .from("profiles")
                .select("id")
                .eq("last_transaction_id", orderId)
                .single();

            if (user) {
                const { error: updateError } = await supabaseAdmin
                    .from("profiles")
                    .update({ subscription_status: "active" })
                    .eq("id", user.id);

                if (updateError) console.error("Update Status Erorr:", updateError);
            } else {
                console.error("User not found for order:", orderId);
            }
        }

        return NextResponse.json({ message: "OK" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
