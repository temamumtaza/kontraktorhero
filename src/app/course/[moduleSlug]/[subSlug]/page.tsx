import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chapters } from "@/lib/chapters";
import ChapterContent from "../ChapterContent";

interface PageProps {
    params: Promise<{ moduleSlug: string; subSlug: string }>;
}

export function generateStaticParams() {
    const params: { moduleSlug: string; subSlug: string }[] = [];
    chapters.forEach((ch) => {
        ch.submodules.forEach((sub) => {
            params.push({ moduleSlug: ch.slug, subSlug: sub.slug });
        });
    });
    return params;
}

export default async function SubModulePage({ params }: PageProps) {
    const { moduleSlug, subSlug } = await params;

    const chapterIdx = chapters.findIndex((ch) => ch.slug === moduleSlug);
    if (chapterIdx === -1) notFound();
    const chapter = chapters[chapterIdx];

    const subIdx = chapter.submodules.findIndex((s) => s.slug === subSlug);
    if (subIdx === -1) notFound();
    const subModule = chapter.submodules[subIdx];

    // Flatten all submodules for Prev/Next navigation
    const allSubmodules = chapters.flatMap((ch) =>
        ch.submodules.map((sub) => ({
            ...sub,
            moduleSlug: ch.slug,
            moduleTitle: ch.title,
            moduleNum: ch.num,
        }))
    );

    const currentGlobalIdx = allSubmodules.findIndex(
        (s) => s.moduleSlug === moduleSlug && s.slug === subSlug
    );

    const prev = currentGlobalIdx > 0 ? allSubmodules[currentGlobalIdx - 1] : null;
    const next = currentGlobalIdx < allSubmodules.length - 1 ? allSubmodules[currentGlobalIdx + 1] : null;

    // Read content
    const filePath = path.join(process.cwd(), "src", "content", subModule.file);
    let content = "";
    try {
        content = fs.readFileSync(filePath, "utf-8");
    } catch {
        content = "# Konten belum tersedia\n\nMohon maaf, konten ini sedang dalam proses.";
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-8 pb-6 border-b border-border">
                <Link
                    href={`/course/${moduleSlug}`}
                    className="text-xs font-mono text-accent uppercase tracking-wider hover:underline mb-2 block"
                >
                    Modul {chapter.num}: {chapter.title}
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-text mt-2">
                    {subModule.title}
                </h1>
            </div>

            {/* Content */}
            <ChapterContent content={content} />

            {/* Navigation */}
            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4">
                {prev ? (
                    <Link
                        href={`/course/${prev.moduleSlug}/${prev.slug}`}
                        className="flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors text-left"
                    >
                        <span>←</span>
                        <div>
                            <p className="text-[10px] font-mono uppercase text-text-muted">
                                Sebelumnya
                            </p>
                            <p className="text-text font-medium">{prev.title}</p>
                            {prev.moduleSlug !== moduleSlug && (
                                <p className="text-[10px] text-text-muted">({prev.moduleTitle})</p>
                            )}
                        </div>
                    </Link>
                ) : (
                    <div />
                )}
                {next ? (
                    <Link
                        href={`/course/${next.moduleSlug}/${next.slug}`}
                        className="flex items-center gap-2 text-sm text-right text-text-muted hover:text-accent transition-colors"
                    >
                        <div>
                            <p className="text-[10px] font-mono uppercase text-text-muted">
                                Selanjutnya
                            </p>
                            <p className="text-text font-medium">{next.title}</p>
                            {next.moduleSlug !== moduleSlug && (
                                <p className="text-[10px] text-text-muted">({next.moduleTitle})</p>
                            )}
                        </div>
                        <span>→</span>
                    </Link>
                ) : (
                    <Link
                        href="/course"
                        className="text-sm text-accent hover:text-accent-light transition-colors"
                    >
                        ✅ Selesai Kursus
                    </Link>
                )}
            </div>
        </div>
    );
}
