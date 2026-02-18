export interface SubChapter {
    slug: string;
    title: string;
    file: string; // The content file
}

export interface Chapter {
    slug: string;
    num: string;
    title: string;
    icon: string;
    submodules: SubChapter[];
}

export const chapters: Chapter[] = [
    {
        slug: "bab-1",
        num: "01",
        title: "Fondasi & Mindset Bisnis",
        icon: "🧠",
        submodules: [
            { slug: "pendahuluan", title: "Pendahuluan: Apa itu Kontraktor?", file: "Bab-1-Fondasi-Mindset-Bisnis.md" },
            { slug: "mindset-pengusaha", title: "Mindset Pengusaha vs Tukang", file: "Bab-1-Fondasi-Mindset-Bisnis.md" },
            { slug: "goal-setting", title: "Goal Setting & Visi", file: "Bab-1-Fondasi-Mindset-Bisnis.md" },
        ]
    },
    {
        slug: "bab-2",
        num: "02",
        title: "Membangun Otoritas & Kepercayaan",
        icon: "🏗️",
        submodules: [
            { slug: "overview", title: "Overview Otoritas", file: "Bab-2-Membangun-Otoritas-Kepercayaan.md" }
        ]
    },
    {
        slug: "bab-3",
        num: "03",
        title: "Manajemen Keuangan",
        icon: "💰",
        submodules: [
            { slug: "overview", title: "Overview Keuangan", file: "Bab-3-Manajemen-Keuangan-Arsitektur-Profit.md" }
        ]
    },
    {
        slug: "bab-4",
        num: "04",
        title: "Pertahanan Arus Kas",
        icon: "🛡️",
        submodules: [
            { slug: "overview", title: "Overview Arus Kas", file: "Bab-4-Pertahanan-Arus-Kas.md" }
        ]
    },
    {
        slug: "bab-5",
        num: "05",
        title: "Sistem Operasional & Tim",
        icon: "⚙️",
        submodules: [
            { slug: "overview", title: "Overview Operasional", file: "Bab-5-Sistem-Operasional-Tim.md" }
        ]
    },
    {
        slug: "bab-6",
        num: "06",
        title: "Skalabilitas Developer",
        icon: "🚀",
        submodules: [
            { slug: "overview", title: "Overview Skalabilitas", file: "Bab-6-Skalabilitas-Developer.md" }
        ]
    },
];
