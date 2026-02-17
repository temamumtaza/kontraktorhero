"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Shield, Loader2, LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (!data.user) throw new Error("Login gagal.");

            // Check subscription status
            const { data: profile } = await supabase
                .from("profiles")
                .select("subscription_status")
                .eq("id", data.user.id)
                .single();

            if (profile?.subscription_status === "active") {
                router.push("/course");
            } else {
                // User registered but hasn't paid.
                setError("Akun Anda belum aktif. Silakan selesaikan pembayaran terlebih dahulu.");
                // Optionally redirect to checkout
                // router.push("/checkout?tier=starter");
            }
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes("Invalid login credentials")) {
                setError("Email atau password salah.");
            } else {
                setError(err.message || "Terjadi kesalahan.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-dark flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Shield className="w-8 h-8 text-accent" />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Kontraktor Hero
                    </span>
                </div>

                {/* Card */}
                <div className="bg-surface-card border border-border rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Masuk ke Akun</h1>
                    <p className="text-text-muted text-center text-sm mb-8">
                        Akses modul kursus dan template dokumen Anda.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surface-input border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent hover:bg-accent-light text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-text-muted">
                            Belum punya akun?
                        </p>
                        <Link
                            href="/checkout?tier=hero"
                            className="inline-flex items-center gap-2 text-accent hover:text-accent-light font-medium mt-2 text-sm transition-colors"
                        >
                            Beli Akses Sekarang
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
