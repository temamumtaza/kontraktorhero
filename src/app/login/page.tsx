"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Shield, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

// Session token stored in localStorage
const SESSION_KEY = "kh_session_token";

export function getSessionToken(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(SESSION_KEY) || undefined;
}

export function setSessionToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
}

export default function LoginPage() {
    const router = useRouter();
    const login = useAction(api.loginAction.login);
    const sessionToken = getSessionToken();
    const user = useQuery(api.users.getMe, { sessionToken });

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If already logged in with active subscription, redirect to course
    useEffect(() => {
        if (user && user.subscriptionStatus === "active") {
            router.push("/course");
        }
    }, [user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await login({
                email,
                password,
            });

            // Store session token
            setSessionToken(result.sessionToken);

            // Redirect based on subscription
            if (result.user.subscriptionStatus === "active") {
                router.push("/course");
            } else {
                router.push(`/checkout?tier=${result.user.tier || "starter"}&reason=unpaid`);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Gagal login. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking session
    if (sessionToken && user === undefined) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    // If logged in but not active subscription
    if (user && user.subscriptionStatus !== "active") {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-surface-card border border-border rounded-2xl p-8 text-center">
                    <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Selesaikan Pembayaran</h2>
                    <p className="text-text-muted mb-6">
                        Akun Anda sudah terdaftar. Silakan selesaikan pembayaran untuk mengakses materi.
                    </p>
                    <Link
                        href={`/checkout?tier=${user.tier || "starter"}`}
                        className="btn-primary w-full block"
                    >
                        Lanjutkan Pembayaran
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-surface-card border border-border rounded-2xl p-8">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Shield className="w-10 h-10 text-accent" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Masuk ke Kontraktor Hero</h1>
                    <p className="text-text-muted text-sm mt-2">Akses materi dan bonus Anda</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
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
                        className="w-full bg-accent hover:bg-accent-light text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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

                <div className="text-center mt-6">
                    <p className="text-text-muted text-sm">
                        Belum punya akun?{" "}
                        <Link href="/checkout?tier=starter" className="text-accent hover:text-accent-light font-medium">
                            Beli Akses Sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
