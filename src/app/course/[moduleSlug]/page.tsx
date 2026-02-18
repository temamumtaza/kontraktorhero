import Link from "next/link";
import { notFound } from "next/navigation";
import { chapters } from "@/lib/chapters";
import { PlayCircle, CheckCircle2 } from "lucide-react";

interface PageProps {
    params: Promise<{ moduleSlug: string }>;
}

export function generateStaticParams() {
    return chapters.map((ch) => ({ moduleSlug: ch.slug }));
}

export default async function ModulePage({ params }: PageProps) {
    const { moduleSlug } = await params;
    const idx = chapters.findIndex((ch) => ch.slug === moduleSlug);
    if (idx === -1) notFound();

    const chapter = chapters[idx];

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-8">
                <span className="text-xs font-mono text-accent uppercase tracking-wider">
                    Modul {chapter.num}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-text mt-2 flex items-center gap-3">
                    <span>{chapter.icon}</span> {chapter.title}
                </h1>
                <p className="text-text-muted mt-4 text-lg">
                    Silakan pilih materi pembelajaran di bawah ini:
                </p>
            </div>

            {/* Submodules List */}
            <div className="space-y-4">
                {chapter.submodules.map((sub, i) => (
                    <Link
                        key={sub.slug}
                        href={`/course/${chapter.slug}/${sub.slug}`}
                        className="block bg-surface-card hover:bg-surface-hover border border-border rounded-xl p-6 transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                                <PlayCircle className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                                    {i + 1}. {sub.title}
                                </h3>
                                <p className="text-sm text-text-muted mt-1">
                                    Klik untuk mulai belajar
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Navigation back */}
            <div className="mt-12 pt-6 border-t border-border">
                <Link
                    href="/course"
                    className="text-sm text-text-muted hover:text-white transition-colors"
                >
                    ← Kembali ke Daftar Modul
                </Link>
            </div>
        </div>
    );
}
