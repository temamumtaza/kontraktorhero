import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chapters } from "@/lib/chapters";
import ChapterContent from "./ChapterContent";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
    return chapters.map((ch) => ({ slug: ch.slug }));
}

export default async function ChapterPage({ params }: PageProps) {
    const { slug } = await params;
    const idx = chapters.findIndex((ch) => ch.slug === slug);
    if (idx === -1) notFound();

    const chapter = chapters[idx];
    const prev = idx > 0 ? chapters[idx - 1] : null;
    const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

    const filePath = path.join(process.cwd(), "src", "content", chapter.file);
    let content = "";
    try {
        content = fs.readFileSync(filePath, "utf-8");
    } catch {
        content = "# Konten belum tersedia\n\nMohon maaf, konten bab ini sedang dalam proses.";
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Mobile chapter selector */}
            <div className="md:hidden mb-6">
                <select
                    className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-sm text-text"
                    defaultValue={slug}
                >
                    {chapters.map((ch) => (
                        <option key={ch.slug} value={ch.slug}>
                            {ch.icon} Modul {ch.num}: {ch.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Chapter header */}
            <div className="mb-8 pb-6 border-b border-border">
                <span className="text-xs font-mono text-accent uppercase tracking-wider">
                    Modul {chapter.num} dari {chapters.length}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-text mt-2 flex items-center gap-3">
                    <span>{chapter.icon}</span> {chapter.title}
                </h1>
                {/* Progress bar */}
                <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{
                            width: `${((idx + 1) / chapters.length) * 100}%`,
                        }}
                    />
                </div>
                <p className="text-xs text-text-muted mt-2">
                    {idx + 1} dari {chapters.length} modul
                </p>
            </div>

            {/* Content */}
            <ChapterContent content={content} />

            {/* Navigation */}
            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4">
                {prev ? (
                    <Link
                        href={`/course/${prev.slug}`}
                        className="flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
                    >
                        <span>←</span>
                        <div>
                            <p className="text-[10px] font-mono uppercase text-text-muted">
                                Sebelumnya
                            </p>
                            <p className="text-text">{prev.title}</p>
                        </div>
                    </Link>
                ) : (
                    <div />
                )}
                {next ? (
                    <Link
                        href={`/course/${next.slug}`}
                        className="flex items-center gap-2 text-sm text-right text-text-muted hover:text-accent transition-colors"
                    >
                        <div>
                            <p className="text-[10px] font-mono uppercase text-text-muted">
                                Selanjutnya
                            </p>
                            <p className="text-text">{next.title}</p>
                        </div>
                        <span>→</span>
                    </Link>
                ) : (
                    <Link
                        href="/course"
                        className="text-sm text-accent hover:text-accent-light transition-colors"
                    >
                        ✅ Selesai — Kembali ke daftar modul
                    </Link>
                )}
            </div>
        </div>
    );
}
