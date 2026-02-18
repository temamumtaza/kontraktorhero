"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { getSessionToken } from "@/app/login/page";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UpgradePage() {
    const sessionToken = getSessionToken();
    const user = useQuery(api.users.getMe, { sessionToken: sessionToken || "" });
    const initiateUpgrade = useAction(api.upgrade.initiateUpgrade);
    const upgradeProduct = useQuery(api.products.getProductBySlug, { slug: "upgrade-hero" });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const verifyPayment = useAction(api.upgrade.verifyPaymentStatus);

    // Check payment status from URL
    const status = searchParams.get("status");
    const [showSuccess, setShowSuccess] = useState(status === "paid");

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Load Midtrans Snap script
            const script = document.createElement("script");
            script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
                ? "https://app.midtrans.com/snap/snap.js"
                : "https://app.sandbox.midtrans.com/snap/snap.js";
            script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
            document.body.appendChild(script);

            return () => {
                const existingScript = document.querySelector(`script[src="${script.src}"]`);
                if (existingScript) {
                    existingScript.remove();
                }
            };
        }
    }, []);

    // Check payment status from URL or History
    useEffect(() => {
        const orderId = searchParams.get("order_id");
        if (orderId && orderId.startsWith("UPG-")) {
            verifyPayment({ invoiceId: orderId })
                .then((res) => {
                    if (res.success) {
                        setShowSuccess(true);
                        // Force reload user to get new tier
                        window.location.href = "/course/upgrade?status=paid";
                    }
                })
                .catch(console.error);
        }
    }, [searchParams, verifyPayment]);

    const handleUpgrade = async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);

        try {
            const result = await initiateUpgrade({
                userId: user._id,
                origin: window.location.origin
            });

            if (typeof window !== "undefined" && (window as any).snap) {
                (window as any).snap.pay(result.token, {
                    onSuccess: function (result: any) {
                        // Call verify immediately
                        verifyPayment({ invoiceId: result.order_id }).then(() => {
                            setShowSuccess(true);
                            setIsLoading(false);
                            router.push("/course/upgrade?status=paid");
                        });
                    },
                    onPending: function () {
                        setIsLoading(false);
                        alert("Pembayaran tertunda. Silakan selesaikan pembayaran Anda.");
                    },
                    onError: function () {
                        setError("Pembayaran gagal. Silakan coba lagi.");
                        setIsLoading(false);
                    },
                    onClose: function () {
                        setIsLoading(false);
                    },
                });
            } else {
                if (result.redirect_url) {
                    window.location.href = result.redirect_url;
                } else {
                    setError("Sistem pembayaran belum siap.");
                    setIsLoading(false);
                }
            }
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (user.tier === "hero") {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/20 rounded-full mb-6">
                    <Sparkles className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Anda adalah Hero Member! 👑</h1>
                <p className="text-text-muted max-w-lg mx-auto">
                    Terima kasih telah bergabung. Anda sudah memiliki akses penuh ke seluruh materi dan bonus eksklusif.
                </p>
                <button
                    onClick={() => router.push("/course")}
                    className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
                >
                    Kembali ke Materi
                </button>
            </div>
        );
    }

    if (upgradeProduct === undefined) {
        // Loading product
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    // fallback if product not active/found (though backend auto-seeds on action, frontend query might miss it initially until action is called?
    // Actually, backend auto-seeds on *initiateUpgrade*, so query might return null if never clicked.
    // I should probably auto-seed on query? No, query shouldn't mutate.
    // I will checking if upgradeProduct exists. If not, I can display default or "Unavailable".
    // But since I want it smooth, I'll assume 99k default if loading/missing but try to use product price.

    const priceDisplay = upgradeProduct ? `Rp ${upgradeProduct.price.toLocaleString("id-ID")}` : "Rp 99.000";
    const originalPriceDisplay = upgradeProduct?.originalPrice ? `Rp ${upgradeProduct.originalPrice.toLocaleString("id-ID")}` : "Rp 4.000.000";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Manage Tier</h1>
                <p className="text-text-muted">Upgrade keanggotaan Anda untuk akses tak terbatas.</p>
            </div>

            {/* Upgrade Section */}
            <div className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/30 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Upgrade to Hero Member 🚀</h2>
                            <p className="text-text-muted mb-4 max-w-lg">
                                Paket Starter sudah mencakup semua modul. Upgrade sekarang untuk mendapatkan <strong>80+ File Template & Dokumen Kerja</strong> siap pakai.
                            </p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-center gap-2 text-sm text-text-muted">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> 27 SOP Konstruksi Lengkap
                                </li>
                                <li className="flex items-center gap-2 text-sm text-text-muted">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> Template RAB & Cash Flow
                                </li>
                                <li className="flex items-center gap-2 text-sm text-text-muted">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> Draft Kontrak & Serah Terima
                                </li>
                                <li className="flex items-center gap-2 text-sm text-text-muted">
                                    <CheckCircle2 className="w-4 h-4 text-accent" /> 21 Template Invoice Profesional
                                </li>
                            </ul>
                        </div>
                        <div className="bg-surface-dark/50 backdrop-blur-sm p-6 rounded-xl border border-accent/20 flex flex-col items-center min-w-[240px]">
                            <span className="text-text-muted text-sm line-through mb-1">{originalPriceDisplay}</span>
                            <div className="text-3xl font-bold text-white mb-4">{priceDisplay}</div>
                            <button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="w-full bg-accent hover:bg-accent-light text-white font-bold py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade Sekarang"}
                            </button>
                            {error && (
                                <div className="mt-3 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <div>
                        <h3 className="font-bold">Pembayaran Berhasil!</h3>
                        <p className="text-sm opacity-90">Selamat! Akun Anda telah diupgrade ke Hero Member. Silakan refresh halaman jika status belum berubah.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
