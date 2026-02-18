"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import {
    Brain,
    Building2,
    Wallet,
    ShieldCheck,
    Settings,
    Rocket,
    ArrowLeft,
    Gift,
    PanelLeftClose,
    PanelLeftOpen,
    BookOpen,
    FolderOpen,
    Shield,
} from "lucide-react";

const chapterNav = [
    { slug: "bab-1", num: "01", title: "Fondasi & Mindset Bisnis", Icon: Brain },
    { slug: "bab-2", num: "02", title: "Membangun Otoritas & Kepercayaan", Icon: Building2 },
    { slug: "bab-3", num: "03", title: "Manajemen Keuangan", Icon: Wallet },
    { slug: "bab-4", num: "04", title: "Pertahanan Arus Kas", Icon: ShieldCheck },
    { slug: "bab-5", num: "05", title: "Sistem Operasional & Tim", Icon: Settings },
    { slug: "bab-6", num: "06", title: "Skalabilitas Developer", Icon: Rocket },
];

export default function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();

    const currentSlug = pathname.split("/course/")[1] || "";
    const isBonusPage = pathname === "/course/bonus";

    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col">
                {/* Top nav */}
                <header className="h-14 bg-surface-light border-b border-border flex items-center px-4 gap-3 shrink-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-text cursor-pointer"
                        title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="w-5 h-5" />
                        ) : (
                            <PanelLeftOpen className="w-5 h-5" />
                        )}
                    </button>

                    <Link href="/course" className="text-lg font-bold whitespace-nowrap flex items-center gap-2">
                        <Image
                            src="/icon.png"
                            alt="Kontraktor Hero"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                        />
                        <span>
                            <span className="text-accent">Kontraktor</span>{" "}
                            <span className="text-text hidden sm:inline">Hero</span>
                        </span>
                    </Link>

                    <div className="flex-1" />

                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Kembali</span>
                    </Link>
                </header>

                <div className="flex flex-1 overflow-hidden relative">
                    {/* Overlay for mobile when sidebar is open */}
                    {sidebarOpen && (
                        <div
                            className="md:hidden fixed inset-0 bg-black/50 z-10"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <aside
                        className={`
            fixed md:relative z-20
            bg-surface-light border-r border-border
            flex flex-col overflow-hidden
            h-[calc(100vh-3.5rem)]
            transition-all duration-300 ease-in-out
            ${sidebarOpen
                                ? "w-72 translate-x-0"
                                : "w-0 -translate-x-full md:translate-x-0 border-r-0"
                            }
          `}
                    >
                        <div className="min-w-72 flex flex-col h-full overflow-y-auto">
                            <nav className="p-4 space-y-1 flex-1">
                                {/* Kurikulum Section */}
                                <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3 px-3 flex items-center gap-1.5">
                                    <BookOpen className="w-3 h-3" /> Kurikulum
                                </p>
                                {chapterNav.map((ch) => {
                                    const isActive = currentSlug === ch.slug;
                                    return (
                                        <Link
                                            key={ch.slug}
                                            href={`/course/${ch.slug}`}
                                            onClick={() => {
                                                if (window.innerWidth < 768) setSidebarOpen(false);
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${isActive
                                                ? "bg-accent/10 text-text border border-accent/20"
                                                : "text-text-muted hover:bg-surface-hover hover:text-text"
                                                }`}
                                        >
                                            <ch.Icon
                                                className={`w-5 h-5 transition-colors ${isActive ? "text-accent" : "text-accent/60 group-hover:text-accent"
                                                    }`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] font-mono text-accent/70 uppercase">
                                                    Modul {ch.num}
                                                </span>
                                                <p className={`truncate ${isActive ? "text-text font-medium" : "group-hover:text-text"} transition-colors`}>
                                                    {ch.title}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}

                                {/* Divider */}
                                <div className="my-4 border-t border-border" />

                                {/* Bonus Section */}
                                <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3 px-3 flex items-center gap-1.5">
                                    <Gift className="w-3 h-3 text-accent" /> Bonus Member
                                </p>
                                <Link
                                    href="/course/bonus"
                                    onClick={() => {
                                        if (window.innerWidth < 768) setSidebarOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${isBonusPage
                                        ? "bg-accent/10 text-text border border-accent/20"
                                        : "text-text-muted hover:bg-surface-hover hover:text-text"
                                        }`}
                                >
                                    <FolderOpen
                                        className={`w-5 h-5 transition-colors ${isBonusPage ? "text-accent" : "text-accent/60 group-hover:text-accent"
                                            }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-mono text-accent/70 uppercase">
                                            80+ File
                                        </span>
                                        <p className={`truncate ${isBonusPage ? "text-text font-medium" : "group-hover:text-text"} transition-colors`}>
                                            Template & Dokumen
                                        </p>
                                    </div>
                                </Link>
                            </nav>

                            {/* Sidebar footer */}
                            <div className="p-4 border-t border-border">
                                <div className="px-3 py-2 text-xs text-text-muted">
                                    <span className="text-accent font-semibold">Kontraktor Hero</span>
                                    <p className="mt-0.5">© 2024 All rights reserved</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 overflow-y-auto transition-all duration-300">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
