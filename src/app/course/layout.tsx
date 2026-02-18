"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { clearSessionToken, getSessionToken } from "@/app/login/page";
import {
    Brain,
    Building2,
    Wallet,
    ShieldCheck,
    Settings,
    Rocket,
    Gift,
    BookOpen,
    FolderOpen,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    CreditCard,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";

// Navigation Config
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
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const currentSlug = pathname.split("/course/")[1] || "";
    const isBonusPage = pathname === "/course/bonus";

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <AuthGuard>
            <div className="min-h-screen flex bg-surface-dark">
                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar - Sticky & Collapsible */}
                <aside
                    className={`
                        fixed md:sticky top-0 z-50 h-screen
                        bg-surface-card border-r border-border
                        transition-all duration-300 ease-in-out flex flex-col
                        ${mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"}
                        ${collapsed ? "md:w-20" : "md:w-72"}
                    `}
                >
                    {/* Sidebar Header */}
                    <div className={`h-16 flex items-center px-4 border-b border-border ${collapsed ? "justify-center" : "justify-between"}`}>
                        {!collapsed && (
                            <Link href="/course" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                <Image src="/icon.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain shrink-0" />
                                <span className="font-bold text-lg text-white">
                                    <span className="text-accent">Kontraktor</span> Hero
                                </span>
                            </Link>
                        )}
                        {collapsed && (
                            <Image src="/icon.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                        )}

                        {/* Desktop Toggle Button */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
                        >
                            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden p-2 text-text-muted hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Sidebar Nav */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-surface-hover">
                        {/* Chapter Section */}
                        <div className={`text-xs font-mono text-text-muted uppercase tracking-wider mb-2 px-3 ${collapsed ? "text-center" : ""}`}>
                            {collapsed ? <BookOpen className="w-4 h-4 mx-auto" /> : "Kurikulum"}
                        </div>

                        {chapterNav.map((ch) => {
                            const isActive = currentSlug === ch.slug;
                            return (
                                <Link
                                    key={ch.slug}
                                    href={`/course/${ch.slug}`}
                                    title={collapsed ? ch.title : undefined}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                                        ${isActive ? "bg-accent/10 text-white border border-accent/20 shadow-glow-sm" : "text-text-muted hover:bg-surface-hover hover:text-white"}
                                        ${collapsed ? "justify-center" : ""}
                                    `}
                                >
                                    <ch.Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-accent" : "text-accent/60 group-hover:text-accent"}`} />

                                    {!collapsed && (
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="text-[10px] font-mono text-accent/70 uppercase leading-tight">Modul {ch.num}</div>
                                            <div className="truncate font-medium text-sm">{ch.title}</div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}

                        <div className="my-4 border-t border-border mx-2" />

                        {/* Bonus Section */}
                        <div className={`text-xs font-mono text-text-muted uppercase tracking-wider mb-2 px-3 ${collapsed ? "text-center" : ""}`}>
                            {collapsed ? <Gift className="w-4 h-4 mx-auto text-orange-400" /> : "Bonus Member"}
                        </div>

                        <Link
                            href="/course/bonus"
                            title={collapsed ? "Bonus Member" : undefined}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                                ${isBonusPage ? "bg-accent/10 text-white border border-accent/20 shadow-glow-sm" : "text-text-muted hover:bg-surface-hover hover:text-white"}
                                ${collapsed ? "justify-center" : ""}
                            `}
                        >
                            <FolderOpen className={`w-5 h-5 shrink-0 transition-colors ${isBonusPage ? "text-accent" : "text-accent/60 group-hover:text-accent"}`} />

                            {!collapsed && (
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="text-[10px] font-mono text-accent/70 uppercase leading-tight">80+ File</div>
                                    <div className="truncate font-medium text-sm">Template & Dokumen</div>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Sidebar Footer */}
                    {!collapsed && (
                        <div className="p-4 border-t border-border text-xs text-text-muted">
                            <span className="font-semibold text-accent">Kontraktor Hero</span>
                            <p className="mt-0.5 opacity-60">© 2024</p>
                        </div>
                    )}
                </aside>

                {/* Main Content Wrapper */}
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                    {/* Sticky Header */}
                    <header className="sticky top-0 z-30 h-16 bg-surface-dark/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8">
                        {/* Mobile Menu Trigger */}
                        <div className="md:hidden flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="p-2 -ml-2 text-text-muted hover:text-white"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <Link href="/course" className="flex items-center gap-2">
                                <Image src="/icon.png" alt="Logo" width={28} height={28} className="w-7 h-7 object-contain" />
                                <span className="font-bold text-white text-sm">Kontraktor Hero</span>
                            </Link>
                        </div>

                        {/* Spacer for Desktop */}
                        <div className="hidden md:block" />

                        {/* Profile Dropdown */}
                        <ProfileDropdown />
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}

// Sub-component for Profile Dropdown
function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const sessionToken = getSessionToken();
    const user = useQuery(api.users.getMe, { sessionToken });

    // Handle click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearSessionToken();
        router.push("/login");
    };

    if (!user) return null; // Or skeleton

    const displayName = user.username || user.name || user.email?.split("@")[0] || "Member";
    const initial = displayName[0].toUpperCase();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-surface-hover transition-colors border border-transparent hover:border-border group"
            >
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                        {displayName}
                    </div>
                    <div className="text-[10px] font-mono text-text-muted uppercase">
                        {user.tier === "hero" ? "Hero Member" : "Starter Member"}
                    </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-surface-card group-hover:ring-accent/50 transition-all">
                    {initial}
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-card border border-border rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden ring-1 ring-white/5">
                    <div className="px-4 py-3 border-b border-border bg-surface-hover/30">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                        <Link href="/course/settings" className="w-full text-left px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-hover flex items-center gap-2 transition-colors">
                            <User className="w-4 h-4" /> Account Settings
                        </Link>
                        <Link href="/course/upgrade" className="w-full text-left px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-hover flex items-center gap-2 transition-colors">
                            <CreditCard className="w-4 h-4" /> Manage Tier
                        </Link>
                    </div>

                    <div className="border-t border-border py-1">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
