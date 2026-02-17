export interface Chapter {
    slug: string;
    num: string;
    title: string;
    icon: string;
    file: string;
}

export const chapters: Chapter[] = [
    {
        slug: "bab-1",
        num: "01",
        title: "Fondasi & Mindset Bisnis",
        icon: "🧠",
        file: "Bab-1-Fondasi-Mindset-Bisnis.md",
    },
    {
        slug: "bab-2",
        num: "02",
        title: "Membangun Otoritas & Kepercayaan",
        icon: "🏗️",
        file: "Bab-2-Membangun-Otoritas-Kepercayaan.md",
    },
    {
        slug: "bab-3",
        num: "03",
        title: "Manajemen Keuangan",
        icon: "💰",
        file: "Bab-3-Manajemen-Keuangan-Arsitektur-Profit.md",
    },
    {
        slug: "bab-4",
        num: "04",
        title: "Pertahanan Arus Kas",
        icon: "🛡️",
        file: "Bab-4-Pertahanan-Arus-Kas.md",
    },
    {
        slug: "bab-5",
        num: "05",
        title: "Sistem Operasional & Tim",
        icon: "⚙️",
        file: "Bab-5-Sistem-Operasional-Tim.md",
    },
    {
        slug: "bab-6",
        num: "06",
        title: "Skalabilitas Developer",
        icon: "🚀",
        file: "Bab-6-Skalabilitas-Developer.md",
    },
];
