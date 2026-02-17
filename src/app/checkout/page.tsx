"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { PRICING } from "@/lib/pricing";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";

// Schema Validation
const formSchema = z
    .object({
        firstName: z.string().min(2, "Nama depan minimal 2 karakter"),
        lastName: z.string().min(2, "Nama belakang minimal 2 karakter"),
        phone: z.string().min(10, "Nomor HP tidak valid (min 10 digit)"),
        username: z.string().min(4, "Username minimal 4 karakter"),
        email: z.string().email("Email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"],
    });

type FormData = z.infer<typeof formSchema>;

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tier = searchParams.get("tier") === "hero" ? "hero" : "starter";

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pricing from centralized config (matches landing page)
    const plan = PRICING[tier];
    const price = plan.price;
    const originalPrice = plan.originalPrice;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: "8", // Helper for +62
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Register User to Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        username: data.username,
                        first_name: data.firstName,
                        last_name: data.lastName,
                        phone: data.phone,
                        tier: tier,
                    },
                },
            });

            if (authError) throw authError;

            if (!authData.user) throw new Error("Gagal membuat user.");

            // 2. Call Transaction API to get Snap Token
            const response = await fetch("/api/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: authData.user.id,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    tier: tier,
                    amount: price,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Gagal memproses transaksi");

            // 3. Open Midtrans Snap
            // (Assuming window.snap is loaded via script in layout or loaded dynamically)
            // For now, simpler implementation: Redirect to a payment page or open popup
            // Because we need the Snap script, we'll load it dynamically or assume layout has it.
            // Let's assume we handle the token.

            if (typeof window !== "undefined" && (window as any).snap) {
                (window as any).snap.pay(result.token, {
                    onSuccess: function (result: any) {
                        router.push("/course?status=success");
                    },
                    onPending: function (result: any) {
                        router.push("/dashboard?status=pending");
                    },
                    onError: function (result: any) {
                        setError("Pembayaran gagal.");
                    },
                    onClose: function () {
                        console.log("Customer closed the popup without finishing the payment");
                    },
                });
            } else {
                // Fallback or Error if script not loaded
                alert("Sistem pembayaran belum siap (Script Snap tidak termuat).");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-dark flex flex-col md:flex-row">
            {/* Left: Summary */}
            <div className="w-full md:w-1/3 bg-surface-card p-8 border-r border-border flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-8">
                        <Shield className="w-8 h-8 text-accent" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Kontraktor Hero
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm text-text-muted uppercase tracking-wider mb-2">Paket Pilihan</h3>
                            <div className="text-2xl font-bold text-white mb-1">
                                {plan.name}
                            </div>
                            <div className="text-text-muted text-sm">Akses selamanya + Update gratis</div>
                        </div>

                        <div className="bg-surface-hover/50 rounded-xl p-4 border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-text-muted">Harga Normal</span>
                                <span className="text-text-muted line-through">Rp {originalPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center text-accent font-bold text-lg">
                                <span>Total Bayar</span>
                                <span>Rp {price.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                                    <CheckCircle2 className="w-4 h-4 text-accent" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-xs text-text-muted">
                    Pembayaran aman & terenkripsi via Midtrans.
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-2">Buat Akun Baru</h1>
                    <p className="text-text-muted mb-8">Lengkapi data diri untuk akses materi segera.</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Identity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text">Nama Depan</label>
                                <input
                                    {...register("firstName")}
                                    className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    placeholder="John"
                                />
                                {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text">Nama Belakang</label>
                                <input
                                    {...register("lastName")}
                                    className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    placeholder="Doe"
                                />
                                {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">Nomor WhatsApp</label>
                            <div className="flex">
                                <div className="bg-surface-hover border border-border border-r-0 rounded-l-lg px-3 py-3 text-text-muted flex items-center">
                                    +62
                                </div>
                                <input
                                    {...register("phone")}
                                    type="tel"
                                    className="w-full bg-surface-input border border-border rounded-r-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    placeholder="81234567890"
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                placeholder="nama@email.com"
                            />
                            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        {/* Account */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">Username</label>
                            <input
                                {...register("username")}
                                className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                placeholder="kontraktor_sukses"
                            />
                            <p className="text-xs text-text-muted">Untuk login dan URL profil member.</p>
                            {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text">Password</label>
                                <input
                                    {...register("password")}
                                    type="password"
                                    className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                />
                                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text">Konfirmasi Password</label>
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                />
                                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent hover:bg-accent-light text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Bayar & Aktivasi Akun"
                            )}
                        </button>
                        <p className="text-center text-xs text-text-muted mt-4">
                            Dengan mendaftar, Anda menyetujui Syarat & Ketentuan Kontraktor Hero.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-surface-dark flex items-center justify-center text-white">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
