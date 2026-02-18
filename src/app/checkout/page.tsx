"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Image from "next/image";
import { Loader2, CheckCircle2, Tag, X } from "lucide-react";

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
    const initialTier = searchParams.get("tier") || "hero";

    // ===== Product data from database =====
    const allProducts = useQuery(api.products.getActiveProducts) || [];
    const [selectedSlug, setSelectedSlug] = useState(initialTier);
    const selectedProduct = allProducts.find((p) => p.slug === selectedSlug) || allProducts[0];

    // Update selected when products load
    useEffect(() => {
        if (allProducts.length > 0 && !allProducts.find((p) => p.slug === selectedSlug)) {
            setSelectedSlug(allProducts[0].slug);
        }
    }, [allProducts, selectedSlug]);

    // ===== Promo code =====
    const [promoInput, setPromoInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);

    const promoValidation = useQuery(
        api.promos.validatePromo,
        appliedPromo && selectedProduct
            ? { code: appliedPromo, productSlug: selectedProduct.slug, productPrice: selectedProduct.price }
            : "skip"
    );

    const discount = promoValidation && promoValidation.valid ? promoValidation.discount || 0 : 0;
    const finalPrice = selectedProduct ? selectedProduct.price - discount : 0;

    const handleApplyPromo = () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) return;
        setPromoLoading(true);
        setPromoError("");
        setAppliedPromo(code);
        // Validation happens reactively via useQuery above
        setTimeout(() => setPromoLoading(false), 500);
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoInput("");
        setPromoError("");
    };

    // Show promo error reactively
    useEffect(() => {
        if (promoValidation && !promoValidation.valid && appliedPromo) {
            setPromoError(promoValidation.error || "Kode promo tidak valid.");
        }
    }, [promoValidation, appliedPromo]);

    // ===== Form =====
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "pending">("idle");

    const initiateCheckout = useAction(api.checkoutActions.initiateCheckout);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    // If payment already completed (from Midtrans redirect callback)
    const urlStatus = searchParams.get("status");
    useEffect(() => {
        if (urlStatus === "paid" && paymentStatus === "idle") {
            setPaymentStatus("success");
        }
    }, [urlStatus, paymentStatus]);

    // Show success screen
    if (paymentStatus === "success") {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="max-w-md w-full mx-auto p-8 text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Pembayaran Berhasil! 🎉</h1>
                    <p className="text-text-muted mb-6">
                        Akun Anda sedang diaktifkan. Silakan login dengan email dan password yang Anda daftarkan tadi.
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-accent hover:bg-accent-light text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Login ke Akun Saya
                    </button>
                    <p className="text-xs text-text-muted mt-4">
                        Proses aktivasi biasanya instan. Jika belum bisa login, tunggu 1-2 menit.
                    </p>
                </div>
            </div>
        );
    }

    // Show pending screen
    if (paymentStatus === "pending") {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="max-w-md w-full mx-auto p-8 text-center">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Menunggu Pembayaran</h1>
                    <p className="text-text-muted mb-6">
                        Pembayaran Anda sedang diproses. Akun akan otomatis aktif setelah konfirmasi.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-surface-hover hover:bg-surface-card text-white font-bold py-4 rounded-xl transition-all border border-border"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    // Loading products
    if (allProducts.length === 0 || !selectedProduct) {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await initiateCheckout({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                username: data.username,
                productSlug: selectedProduct.slug,
                promoCode: appliedPromo || undefined,
            });

            // Open Midtrans Snap popup
            if (result.token === "FREE") {
                // Free transaction - direct success
                setPaymentStatus("success");
                setIsLoading(false);
                if (result.redirect_url) {
                    router.push(result.redirect_url); // Optional: redirect to URL to be safe, but state update might be enough
                }
            } else if (typeof window !== "undefined" && (window as any).snap) {
                (window as any).snap.pay(result.token, {
                    onSuccess: function () {
                        setPaymentStatus("success");
                        setIsLoading(false);
                    },
                    onPending: function () {
                        setPaymentStatus("pending");
                        setIsLoading(false);
                    },
                    onError: function () {
                        setError("Pembayaran gagal. Silakan coba lagi.");
                        setIsLoading(false);
                    },
                    onClose: function () {
                        console.log("Customer closed the popup without finishing the payment");
                        setIsLoading(false);
                    },
                });
            } else if (result.redirect_url) {
                window.location.href = result.redirect_url;
            } else {
                setError("Sistem pembayaran belum siap. Silakan refresh dan coba lagi.");
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "";
            if (msg.includes("rate limit")) {
                setError("Terlalu banyak percobaan. Silakan tunggu beberapa menit lalu coba lagi.");
            } else if (msg.includes("already") || msg.includes("existing")) {
                setError("Email sudah terdaftar. Silakan login di halaman Akses Member.");
            } else {
                setError(msg || "Terjadi kesalahan. Silakan coba lagi.");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-dark flex flex-col md:flex-row">
            {/* Left: Summary */}
            <div className="w-full md:w-1/3 bg-surface-card p-8 border-r border-border flex flex-col justify-between">
                <div>
                    <div className="mb-8">
                        <Image src="/logo.png" alt="Kontraktor Hero" width={180} height={40} className="h-10 w-auto" />
                    </div>

                    <div className="space-y-6">
                        {/* Product Selector */}
                        <div>
                            <h3 className="text-sm text-text-muted uppercase tracking-wider mb-3">Pilih Paket</h3>
                            <div className="space-y-2">
                                {allProducts.map((p) => (
                                    <button
                                        key={p._id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedSlug(p.slug);
                                            // Reset promo validation when switching product
                                            if (appliedPromo) handleRemovePromo();
                                        }}
                                        className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden ${selectedProduct._id === p._id
                                            ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                                            : "border-border bg-surface-hover/30 hover:border-border/80"
                                            }`}
                                    >
                                        {p.badge && (
                                            <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                                {p.badge}
                                            </span>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-white text-sm pr-12">{p.name}</span>
                                                </div>
                                                <span className="text-xs text-text-muted line-through">
                                                    Rp {p.originalPrice.toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            <span className="text-lg font-bold text-accent whitespace-nowrap flex-shrink-0">
                                                Rp {p.price.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                            {selectedProduct.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Promo Code */}
                        <div>
                            <h3 className="text-sm text-text-muted uppercase tracking-wider mb-2">Kode Promo</h3>
                            {appliedPromo && promoValidation?.valid ? (
                                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-mono text-green-400 font-bold">{appliedPromo}</span>
                                        <span className="text-xs text-green-400/70">
                                            {promoValidation && "discountLabel" in promoValidation ? `-${promoValidation.discountLabel}` : ""}
                                        </span>
                                    </div>
                                    <button onClick={handleRemovePromo} className="text-green-400 hover:text-green-300">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoInput}
                                        onChange={(e) => {
                                            setPromoInput(e.target.value.toUpperCase());
                                            setPromoError("");
                                        }}
                                        placeholder="Masukkan kode"
                                        className="flex-1 bg-surface-input border border-border rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent/50"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !promoInput.trim()}
                                        className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm rounded-lg disabled:opacity-50 transition"
                                    >
                                        {promoLoading ? "..." : "Pakai"}
                                    </button>
                                </div>
                            )}
                            {promoError && <p className="text-xs text-red-400 mt-1">{promoError}</p>}
                        </div>

                        {/* Price Summary */}
                        <div className="bg-surface-hover/50 rounded-xl p-4 border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-text-muted">Harga Normal</span>
                                <span className="text-text-muted line-through">
                                    Rp {selectedProduct.originalPrice.toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-text-muted">Harga Promo</span>
                                <span className={`text-white ${discount > 0 ? "line-through text-text-muted" : "font-bold"}`}>
                                    Rp {selectedProduct.price.toLocaleString("id-ID")}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-green-400 text-sm">Diskon Promo</span>
                                    <span className="text-green-400 text-sm">-Rp {discount.toLocaleString("id-ID")}</span>
                                </div>
                            )}
                            <div className="border-t border-border pt-2 mt-2">
                                <div className="flex justify-between items-center text-accent font-bold text-lg">
                                    <span>Total Bayar</span>
                                    <span>Rp {finalPrice.toLocaleString("id-ID")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-xs text-text-muted">
                    Pembayaran aman &amp; terenkripsi via Midtrans.
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-2">Daftar &amp; Bayar</h1>
                    <p className="text-text-muted mb-8">Lengkapi data diri, lalu bayar — akun otomatis aktif setelah pembayaran berhasil.</p>

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
                                    Memproses pembayaran...
                                </>
                            ) : (
                                `Bayar Rp ${finalPrice.toLocaleString("id-ID")}`
                            )}
                        </button>
                        <p className="text-center text-xs text-text-muted mt-4">
                            Dengan mendaftar, Anda menyetujui Syarat &amp; Ketentuan Kontraktor Hero.
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
