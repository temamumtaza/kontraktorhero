"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { getSessionToken } from "@/app/login/page";
import { Loader2, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
    const sessionToken = getSessionToken();
    const user = useQuery(api.users.getMe, { sessionToken: sessionToken || "" });

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Pengaturan Akun</h1>
                <p className="text-text-muted">Profil pengguna Anda.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-surface-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    Profil Saya
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Nama Lengkap</label>
                        <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                    </div>
                    <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Email</label>
                        <div className="text-white font-medium">{user.email}</div>
                    </div>
                    <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Username</label>
                        <div className="text-white font-medium">{user.username}</div>
                    </div>
                    <div>
                        <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">Status Member</label>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.tier === "hero"
                                ? "bg-accent/10 text-accent border-accent/20"
                                : "bg-surface-hover text-text-muted border-border"
                            }`}>
                            {user.tier === "hero" ? "HERO MEMBER" : "STARTER MEMBER"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
