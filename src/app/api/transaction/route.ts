import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, email, firstName, lastName, phone, tier, amount } = body;

        // Validate required fields
        if (!userId || !email || !amount || !tier) {
            return NextResponse.json(
                { error: "Data tidak lengkap. Pastikan semua field terisi." },
                { status: 400 }
            );
        }

        // Generate unique Order ID
        const orderId = `KH-${tier.toUpperCase()}-${Date.now()}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            credit_card: {
                secure: true,
            },
            item_details: [
                {
                    id: tier,
                    price: amount,
                    quantity: 1,
                    name:
                        tier === "hero"
                            ? "Kontraktor Hero Membership"
                            : "Starter Pack Konstruksi",
                },
            ],
            customer_details: {
                first_name: firstName || "",
                last_name: lastName || "",
                email: email,
                phone: phone || "",
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL || "https://kontraktorhero.com"}/course?status=success`,
                error: `${process.env.NEXT_PUBLIC_APP_URL || "https://kontraktorhero.com"}/checkout?status=failed&tier=${tier}`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL || "https://kontraktorhero.com"}/checkout?status=pending&tier=${tier}`,
            },
        };

        // 1. Create Transaction in Midtrans
        let transaction;
        try {
            transaction = await snap.createTransaction(parameter);
        } catch (midtransError: any) {
            console.error("Midtrans API Error:", midtransError);

            // Parse Midtrans-specific errors
            const errorMessage =
                midtransError?.ApiResponse?.error_messages?.[0] ||
                midtransError?.message ||
                "Gagal terhubung ke payment gateway.";

            return NextResponse.json(
                {
                    error: `Payment Error: ${errorMessage}`,
                    details:
                        "Jika masalah berlanjut, hubungi admin di support@kontraktorhero.com",
                },
                { status: 502 }
            );
        }

        // 2. Update Profile with Transaction ID
        try {
            await supabaseAdmin
                .from("profiles")
                .update({
                    last_transaction_id: orderId,
                    tier: tier,
                })
                .eq("id", userId);
        } catch (dbError) {
            // Non-blocking: log but don't fail the transaction
            console.error("DB Update Error (non-blocking):", dbError);
        }

        return NextResponse.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        });
    } catch (error: any) {
        console.error("Transaction Route Error:", error);
        return NextResponse.json(
            {
                error: "Terjadi kesalahan internal. Silakan coba lagi.",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
