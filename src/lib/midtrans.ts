import midtransClient from "midtrans-client";

// Midtrans Sandbox keys start with "SB-Mid-"
// Midtrans Production keys start with "Mid-"
// However, some sandbox accounts may have "Mid-" prefix too.
// We use an explicit env var to control this, defaulting to sandbox (false).
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

export const snap = new midtransClient.Snap({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export const core = new midtransClient.CoreApi({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});
