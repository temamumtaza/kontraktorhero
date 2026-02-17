import Link from "next/link";
import { chapters } from "@/lib/chapters";
import {
    Brain,
    Building2,
    Wallet,
    ShieldCheck,
    Settings,
    Rocket,
    ArrowRight,
    Gift,
    FolderOpen,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "bab-1": Brain,
    "bab-2": Building2,
    "bab-3": Wallet,
    "bab-4": ShieldCheck,
    "bab-5": Settings,
    "bab-6": Rocket,
};

export default function CourseIndex() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-text">
                Selamat Datang di{" "}
                <span className="gradient-text">Kontraktor Hero</span>
            </h1>
            <p className="text-text-muted mt-3">
                Pilih modul di bawah ini atau di sidebar untuk mulai belajar.
            </p>

            <div className="mt-8 space-y-3">
                {chapters.map((ch) => {
                    const Icon = iconMap[ch.slug] || Brain;
                    return (
                        <Link
                            key={ch.slug}
                            href={`/course/${ch.slug}`}
                            className="card flex items-center gap-5 group hover:glow-accent"
                        >
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                <Icon className="w-6 h-6 text-accent" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-mono text-accent uppercase">
                                    Modul {ch.num}
                                </span>
                                <h2 className="font-semibold text-text group-hover:text-accent transition-colors">
                                    {ch.title}
                                </h2>
                            </div>
                            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                        </Link>
                    );
                })}
            </div>

            {/* Bonus Section */}
            <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-bold text-text">Bonus Member</h2>
                </div>
                <Link
                    href="/course/bonus"
                    className="card flex items-center gap-5 group hover:glow-accent border-accent/20"
                >
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <FolderOpen className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-mono text-accent uppercase">
                            80+ File
                        </span>
                        <h2 className="font-semibold text-text group-hover:text-accent transition-colors">
                            Template & Dokumen Siap Pakai
                        </h2>
                        <p className="text-text-muted text-sm mt-1">
                            RAB, SOP, Invoice, Absensi, AHSP, dan lainnya
                        </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                </Link>
            </div>
        </div>
    );
}
