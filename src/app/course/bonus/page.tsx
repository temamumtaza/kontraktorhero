"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { getSessionToken } from "@/app/login/page";
import Link from "next/link";
import {
    FileSpreadsheet,
    FileText,
    File,
    FolderOpen,
    Folder,
    Download,
    Search,
    ChevronRight,
    ArrowLeft,
    Gift,
    Receipt,
    Users,
    ClipboardList,
    Building2,
    Scale,
    Lock,
    Crown,
} from "lucide-react";
import { getAssetPath } from "@/lib/config";

type BonusFile = {
    name: string;
    path: string;
    size: string;
};

type BonusFolder = {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    files: BonusFile[];
    subfolders?: { name: string; files: BonusFile[] }[];
};

const bonusFolders: BonusFolder[] = [
    {
        id: "01",
        name: "Template RAB",
        description: "Template Rencana Anggaran Biaya untuk berbagai tipe rumah",
        icon: FileSpreadsheet,
        color: "text-emerald-400",
        files: [
            { name: "RAB Rumah 1 Lantai", path: "/bonus/01-Template-RAB/RAB-Rumah-1-Lantai.xlsx", size: "1.2 MB" },
            { name: "RAB Rumah 2 Lantai", path: "/bonus/01-Template-RAB/RAB-Rumah-2-Lantai.xlsx", size: "1.2 MB" },
            { name: "RAB Rumah 2 Lantai v2", path: "/bonus/01-Template-RAB/RAB-Rumah-2-Lantai-v2.xlsx", size: "1.3 MB" },
            { name: "Anggaran Rencana vs Aktual", path: "/bonus/01-Template-RAB/Anggaran-Rencana-vs-Aktual.xlsx", size: "37 KB" },
        ],
    },
    {
        id: "02",
        name: "Template Keuangan",
        description: "Cash flow, tagihan proyek, dan laporan penerimaan material",
        icon: Receipt,
        color: "text-blue-400",
        files: [
            { name: "Cashflow Statement with Notes", path: "/bonus/02-Template-Keuangan/Cashflow-Statement-with-Notes.xlsx", size: "160 KB" },
            { name: "Cashflow and Cash in Hand", path: "/bonus/02-Template-Keuangan/Cashflow-and-Cash-in-Hand.xlsx", size: "32 KB" },
            { name: "Cash In and Cashout Sheet", path: "/bonus/02-Template-Keuangan/Cash-In-and-Cashout-Sheet.xlsx", size: "11 KB" },
            { name: "Cashflow Statement", path: "/bonus/02-Template-Keuangan/Cashflow-Statement.xlsx", size: "30 KB" },
            { name: "Dokumen Tagihan Proyek", path: "/bonus/02-Template-Keuangan/Dokumen-Tagihan-Proyek.xlsx", size: "10 KB" },
            { name: "Laporan Penerimaan Material", path: "/bonus/02-Template-Keuangan/Laporan-Penerimaan-Material.xlsx", size: "10 KB" },
        ],
    },
    {
        id: "03",
        name: "Template Invoice",
        description: "21 template invoice profesional untuk berbagai kebutuhan",
        icon: Receipt,
        color: "text-purple-400",
        files: [
            { name: "Invoice Template 01", path: "/bonus/03-Template-Invoice/Invoice-Template-01.xlsx", size: "15 KB" },
            { name: "Invoice Template 02", path: "/bonus/03-Template-Invoice/Invoice-Template-02.xlsx", size: "16 KB" },
            { name: "Invoice Template 03", path: "/bonus/03-Template-Invoice/Invoice-Template-03.xlsx", size: "15 KB" },
            { name: "Invoice Template 04", path: "/bonus/03-Template-Invoice/Invoice-Template-04.xlsx", size: "15 KB" },
            { name: "Invoice Template 05", path: "/bonus/03-Template-Invoice/Invoice-Template-05.xlsx", size: "17 KB" },
            { name: "Invoice Template 06", path: "/bonus/03-Template-Invoice/Invoice-Template-06.xlsx", size: "17 KB" },
            { name: "Invoice Template 07", path: "/bonus/03-Template-Invoice/Invoice-Template-07.xlsx", size: "16 KB" },
            { name: "Invoice Template 08", path: "/bonus/03-Template-Invoice/Invoice-Template-08.xlsx", size: "35 KB" },
            { name: "Invoice Template 09", path: "/bonus/03-Template-Invoice/Invoice-Template-09.xlsx", size: "13 KB" },
            { name: "Invoice Template 10", path: "/bonus/03-Template-Invoice/Invoice-Template-10.xlsx", size: "12 KB" },
            { name: "Invoice Template 11", path: "/bonus/03-Template-Invoice/Invoice-Template-11.xlsx", size: "16 KB" },
            { name: "Invoice Template 12", path: "/bonus/03-Template-Invoice/Invoice-Template-12.xlsx", size: "13 KB" },
            { name: "Invoice Template 13", path: "/bonus/03-Template-Invoice/Invoice-Template-13.xlsx", size: "16 KB" },
            { name: "Invoice Template 14", path: "/bonus/03-Template-Invoice/Invoice-Template-14.xlsx", size: "13 KB" },
            { name: "Invoice Template 15", path: "/bonus/03-Template-Invoice/Invoice-Template-15.xlsx", size: "15 KB" },
            { name: "Invoice Template 16", path: "/bonus/03-Template-Invoice/Invoice-Template-16.xlsm", size: "26 KB" },
            { name: "Invoice Template 17", path: "/bonus/03-Template-Invoice/Invoice-Template-17.xlsx", size: "12 KB" },
            { name: "Invoice Sales Tax 18", path: "/bonus/03-Template-Invoice/Invoice-Sales-Tax-18.xlsx", size: "16 KB" },
            { name: "Invoice Energy Sector 19", path: "/bonus/03-Template-Invoice/Invoice-Energy-Sector-19.xlsx", size: "37 KB" },
            { name: "Invoice Classic (Word)", path: "/bonus/03-Template-Invoice/Invoice-Classic.docx", size: "117 KB" },
            { name: "Invoice Multi Page (Word)", path: "/bonus/03-Template-Invoice/Invoice-Multi-Page.docx", size: "122 KB" },
        ],
    },
    {
        id: "04",
        name: "Template SDM & Operasional",
        description: "Daftar hadir, timesheet, form order material, dan jadwal kerja",
        icon: Users,
        color: "text-cyan-400",
        files: [
            { name: "Form Order Material", path: "/bonus/04-Template-SDM/Form-Order-Material.xlsx", size: "9 KB" },
        ],
        subfolders: [
            {
                name: "Daftar Hadir",
                files: [
                    { name: "Employee Attendance Tracker Lite", path: "/bonus/04-Template-SDM/Daftar-Hadir/Employee-Attendance-Tracker-Lite.xlsx", size: "12 MB" },
                    { name: "Employee Database", path: "/bonus/04-Template-SDM/Daftar-Hadir/Employee-Database.xlsx", size: "18 MB" },
                    { name: "Employee Vacation Planner Lite", path: "/bonus/04-Template-SDM/Daftar-Hadir/Employee-Vacation-Planner-Lite.xlsx", size: "1.6 MB" },
                    { name: "Employee Vacation Tracker", path: "/bonus/04-Template-SDM/Daftar-Hadir/Employee-Vacation-Tracker.xlsx", size: "2.7 MB" },
                    { name: "Attendance Calendar (Simple)", path: "/bonus/04-Template-SDM/Daftar-Hadir/Attendance-Calendar-Simple.xls", size: "579 KB" },
                    { name: "Vacation Tracker 01", path: "/bonus/04-Template-SDM/Daftar-Hadir/Vacation-Tracker-01.xlsx", size: "57 KB" },
                    { name: "Vacation Tracker 02", path: "/bonus/04-Template-SDM/Daftar-Hadir/Vacation-Tracker-02.xlsx", size: "77 KB" },
                    { name: "Vacation Tracker 03", path: "/bonus/04-Template-SDM/Daftar-Hadir/Vacation-Tracker-03.xlsx", size: "143 KB" },
                    { name: "Vacation Tracker 04", path: "/bonus/04-Template-SDM/Daftar-Hadir/Vacation-Tracker-04.xlsx", size: "75 KB" },
                ],
            },
            {
                name: "Time Sheets",
                files: [
                    { name: "Client Services Hours & Charges", path: "/bonus/04-Template-SDM/Time-Sheets/Client-Services-Hours-Charges.xlsx", size: "19 KB" },
                    { name: "Task Checklist with Invoice", path: "/bonus/04-Template-SDM/Time-Sheets/Task-Checklist-with-Invoice.xlsx", size: "26 KB" },
                    { name: "Project Time and Revenue", path: "/bonus/04-Template-SDM/Time-Sheets/Project-Time-and-Revenue.xlsx", size: "21 KB" },
                    { name: "Hourly Salary with Overtime", path: "/bonus/04-Template-SDM/Time-Sheets/Hourly-Salary-with-Overtime.xlsx", size: "22 KB" },
                    { name: "12 Months Time Sheet", path: "/bonus/04-Template-SDM/Time-Sheets/12-Months-Time-Sheet.xlsx", size: "96 KB" },
                    { name: "Working Hours with Incentives", path: "/bonus/04-Template-SDM/Time-Sheets/Working-Hours-with-Incentives.xlsx", size: "26 KB" },
                    { name: "Paid Hours Attendance Breakup", path: "/bonus/04-Template-SDM/Time-Sheets/Paid-Hours-Attendance-Breakup.xlsx", size: "15 KB" },
                    { name: "Schedule with Pay Details", path: "/bonus/04-Template-SDM/Time-Sheets/Schedule-with-Pay-Details.xlsx", size: "40 KB" },
                    { name: "Pay Details Payment Status", path: "/bonus/04-Template-SDM/Time-Sheets/Pay-Details-Payment-Status.xlsx", size: "50 KB" },
                    { name: "Services Categories Charges", path: "/bonus/04-Template-SDM/Time-Sheets/Services-Categories-Charges.xlsx", size: "72 KB" },
                    { name: "Time In/Out Employee Signs", path: "/bonus/04-Template-SDM/Time-Sheets/Time-In-Out-Employee-Signs.xlsx", size: "12 KB" },
                    { name: "Monthly Hours and Pay", path: "/bonus/04-Template-SDM/Time-Sheets/Monthly-Hours-and-Pay.xlsx", size: "56 KB" },
                    { name: "Fortnightly Time Sheet", path: "/bonus/04-Template-SDM/Time-Sheets/Fortnightly-Time-Sheet.xlsx", size: "19 KB" },
                    { name: "Employee Work Schedule Tracker", path: "/bonus/04-Template-SDM/Time-Sheets/Employee-Work-Schedule-Tracker.xlsx", size: "16 KB" },
                    { name: "Employees Pay with Overtime", path: "/bonus/04-Template-SDM/Time-Sheets/Employees-Pay-with-Overtime.xlsx", size: "17 KB" },
                ],
            },
        ],
    },
    {
        id: "05",
        name: "SOP Konstruksi",
        description: "27 SOP lengkap untuk operasional proyek konstruksi profesional",
        icon: ClipboardList,
        color: "text-orange-400",
        files: [
            { name: "SOP Control Area Konstruksi", path: "/bonus/05-SOP-Konstruksi/SOP-Control-Area-Konstruksi.docx", size: "21 KB" },
            { name: "SOP Kas Kecil Proyek", path: "/bonus/05-SOP-Konstruksi/SOP-Kas-Kecil-Proyek.docx", size: "22 KB" },
            { name: "SOP Kebutuhan Tenaga Kerja", path: "/bonus/05-SOP-Konstruksi/SOP-Kebutuhan-Tenaga-Kerja.docx", size: "21 KB" },
            { name: "SOP Komplain & Perbaikan Rumah", path: "/bonus/05-SOP-Konstruksi/SOP-Komplain-Perbaikan-Rumah.docx", size: "22 KB" },
            { name: "SOP Laporan Pajak Konstruksi", path: "/bonus/05-SOP-Konstruksi/SOP-Laporan-Pajak-Konstruksi.docx", size: "21 KB" },
            { name: "SOP Laporan Prestasi Proyek", path: "/bonus/05-SOP-Konstruksi/SOP-Laporan-Prestasi-Proyek.docx", size: "22 KB" },
            { name: "SOP Layanan Garansi Bangunan", path: "/bonus/05-SOP-Konstruksi/SOP-Layanan-Garansi-Bangunan.docx", size: "22 KB" },
            { name: "SOP Opname Pekerjaan", path: "/bonus/05-SOP-Konstruksi/SOP-Opname-Pekerjaan.docx", size: "22 KB" },
            { name: "SOP Pemakaian Alat Proyek", path: "/bonus/05-SOP-Konstruksi/SOP-Pemakaian-Alat-Proyek.docx", size: "21 KB" },
            { name: "SOP Pembayaran Gaji Tenaga Kerja", path: "/bonus/05-SOP-Konstruksi/SOP-Pembayaran-Gaji-Tenaga-Kerja.docx", size: "20 KB" },
            { name: "SOP Pemeliharaan Alat & Mesin", path: "/bonus/05-SOP-Konstruksi/SOP-Pemeliharaan-Alat-Mesin.docx", size: "21 KB" },
            { name: "SOP Penagihan Pembayaran", path: "/bonus/05-SOP-Konstruksi/SOP-Penagihan-Pembayaran.docx", size: "21 KB" },
            { name: "SOP Penanganan Kecelakaan Kerja", path: "/bonus/05-SOP-Konstruksi/SOP-Penanganan-Kecelakaan-Kerja.docx", size: "21 KB" },
            { name: "SOP Penerimaan Material", path: "/bonus/05-SOP-Konstruksi/SOP-Penerimaan-Material.docx", size: "21 KB" },
            { name: "SOP Penghitungan Persediaan Fisik", path: "/bonus/05-SOP-Konstruksi/SOP-Penghitungan-Persediaan-Fisik.docx", size: "21 KB" },
            { name: "SOP Pengukuran Ulang Lapangan", path: "/bonus/05-SOP-Konstruksi/SOP-Pengukuran-Ulang-Lapangan.docx", size: "21 KB" },
            { name: "SOP Penyimpanan Manajemen Material", path: "/bonus/05-SOP-Konstruksi/SOP-Penyimpanan-Manajemen-Material.docx", size: "21 KB" },
            { name: "SOP Penyimpanan Alat Proyek", path: "/bonus/05-SOP-Konstruksi/SOP-Penyimpanan-Alat-Proyek.docx", size: "22 KB" },
            { name: "SOP Laporan Keuangan Konstruksi", path: "/bonus/05-SOP-Konstruksi/SOP-Laporan-Keuangan-Konstruksi.docx", size: "22 KB" },
            { name: "SOP Perbaikan Alat & Mesin", path: "/bonus/05-SOP-Konstruksi/SOP-Perbaikan-Alat-Mesin.docx", size: "21 KB" },
            { name: "SOP Perencanaan Tenaga Kerja", path: "/bonus/05-SOP-Konstruksi/SOP-Perencanaan-Tenaga-Kerja.docx", size: "21 KB" },
            { name: "SOP Permintaan Material", path: "/bonus/05-SOP-Konstruksi/SOP-Permintaan-Material.docx", size: "20 KB" },
            { name: "SOP Pengawasan Progres Bangunan", path: "/bonus/05-SOP-Konstruksi/SOP-Pengawasan-Progres-Bangunan.docx", size: "22 KB" },
            { name: "SOP Serah Terima Konsumen", path: "/bonus/05-SOP-Konstruksi/SOP-Serah-Terima-Konsumen.docx", size: "21 KB" },
            { name: "SOP Serah Terima Pekerjaan", path: "/bonus/05-SOP-Konstruksi/SOP-Serah-Terima-Pekerjaan.docx", size: "20 KB" },
            { name: "SOP Serah Terima Sementara", path: "/bonus/05-SOP-Konstruksi/SOP-Serah-Terima-Sementara.docx", size: "21 KB" },
            { name: "SOP Teknis & Spesifikasi Bangunan", path: "/bonus/05-SOP-Konstruksi/SOP-Teknis-Spesifikasi-Bangunan.docx", size: "21 KB" },
        ],
    },
    {
        id: "06",
        name: "Referensi AHSP 2025",
        description: "Analisis Harga Satuan Pekerjaan resmi dari Kementerian PUPR",
        icon: Scale,
        color: "text-yellow-400",
        files: [
            { name: "AHSP Cipta Karya 2025 (Excel)", path: "/bonus/06-Referensi-AHSP/AHSP-Cipta-Karya-2025.xlsx", size: "2.2 MB" },
        ],
        subfolders: [
            {
                name: "Dokumen PDF Regulasi",
                files: [
                    { name: "SE Dirjen Binkon No 30/2025", path: "/bonus/06-Referensi-AHSP/PDF/SE-Dirjen-Binkon-No-30-2025.pdf", size: "569 KB" },
                    { name: "Daftar Isi AHSP Bidang CK", path: "/bonus/06-Referensi-AHSP/PDF/Daftar-Isi-AHSP-Bidang-CK.pdf", size: "28 MB" },
                    { name: "Lampiran I — Pedoman Harga Satuan", path: "/bonus/06-Referensi-AHSP/PDF/Lampiran-I-Pedoman-Harga-Satuan.pdf", size: "8 MB" },
                    { name: "Lampiran II — Tabel Acuan", path: "/bonus/06-Referensi-AHSP/PDF/Lampiran-II-Tabel-Acuan.pdf", size: "4 MB" },
                    { name: "Lampiran III — Biaya SMKK", path: "/bonus/06-Referensi-AHSP/PDF/Lampiran-III-Biaya-SMKK.pdf", size: "1.7 MB" },
                    { name: "Lampiran IV — AHSP Sumber Daya Air", path: "/bonus/06-Referensi-AHSP/PDF/Lampiran-IV-AHSP-Sumber-Daya-Air.pdf", size: "74 MB" },
                    { name: "Lampiran VI — AHSP Cipta Karya", path: "/bonus/06-Referensi-AHSP/PDF/Lampiran-VI-AHSP-Cipta-Karya.pdf", size: "17 MB" },
                    { name: "Lampiran VII — Tata Cara Usulan AHSP", path: "/bonus/06-Referensi-AHSP/PDF/Lampiran-VII-Tata-Cara-Usulan-AHSP.pdf", size: "1.7 MB" },
                    { name: "Pedoman SIPASTI V3", path: "/bonus/06-Referensi-AHSP/PDF/Pedoman-SIPASTI-V3.pdf", size: "45 MB" },
                ],
            },
        ],
    },
    {
        id: "07",
        name: "Dokumen Proyek",
        description: "Checklist, serah terima, laporan insiden, dan progress",
        icon: Building2,
        color: "text-rose-400",
        files: [
            { name: "Checklist Pekerjaan Konstruksi", path: "/bonus/07-Dokumen-Proyek/Checklist-Pekerjaan-Konstruksi.xlsx", size: "10 KB" },
            { name: "Dokumen Serah Terima Proyek", path: "/bonus/07-Dokumen-Proyek/Dokumen-Serah-Terima-Proyek.docx", size: "18 KB" },
            { name: "Format Laporan Insiden", path: "/bonus/07-Dokumen-Proyek/Format-Laporan-Insiden.docx", size: "16 KB" },
            { name: "Format Laporan Progres", path: "/bonus/07-Dokumen-Proyek/Format-Laporan-Progres.docx", size: "17 KB" },
        ],
    },
];

function getFileIcon(path: string) {
    if (path.endsWith(".xlsx") || path.endsWith(".xls") || path.endsWith(".xlsm"))
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (path.endsWith(".docx") || path.endsWith(".doc"))
        return <FileText className="w-5 h-5 text-blue-400" />;
    if (path.endsWith(".pdf"))
        return <File className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-text-muted" />;
}

function getFileType(path: string) {
    if (path.endsWith(".xlsx") || path.endsWith(".xls") || path.endsWith(".xlsm")) return "Excel";
    if (path.endsWith(".docx") || path.endsWith(".doc")) return "Word";
    if (path.endsWith(".pdf")) return "PDF";
    return "File";
}

function FileRow({ file, isLocked }: { file: BonusFile; isLocked: boolean }) {
    if (isLocked) {
        return (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface/30 border border-transparent opacity-70 cursor-not-allowed relative overflow-hidden group">
                {/* Diagonal stripes overlay for blocked feel */}
                <div className="absolute inset-0 bg-[url('/stripes.png')] opacity-5 pointer-events-none" />

                <div className="shrink-0 opacity-50">{getFileIcon(file.path)}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-text-muted text-sm font-medium truncate">{file.name}</p>
                    <p className="text-text-muted/60 text-xs mt-0.5">
                        {getFileType(file.path)} · {file.size}
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-card border border-border text-text-muted text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Locked</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface/50 hover:bg-surface-hover border border-transparent hover:border-accent/20 transition-all duration-200 group">
            <div className="shrink-0">{getFileIcon(file.path)}</div>
            <div className="flex-1 min-w-0">
                <p className="text-text text-sm font-medium truncate">{file.name}</p>
                <p className="text-text-muted text-xs mt-0.5">
                    {getFileType(file.path)} · {file.size}
                </p>
            </div>
            <a
                href={getAssetPath(file.path)}
                download
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent hover:text-white transition-all duration-200 opacity-80 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
            </a>
        </div>
    );
}

export default function BonusPage() {
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSubfolders, setExpandedSubfolders] = useState<Set<string>>(new Set());

    const sessionToken = getSessionToken();
    const user = useQuery(api.users.getMe, { sessionToken });
    const isLocked = user?.tier !== "hero";

    const toggleSubfolder = (key: string) => {
        setExpandedSubfolders((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const activeData = bonusFolders.find((f) => f.id === activeFolder);

    const totalFiles = bonusFolders.reduce((acc, folder) => {
        let count = folder.files.length;
        if (folder.subfolders) {
            count += folder.subfolders.reduce((a, sf) => a + sf.files.length, 0);
        }
        return acc + count;
    }, 0);

    const searchResults = searchQuery.trim()
        ? bonusFolders.flatMap((folder) => {
            const q = searchQuery.toLowerCase();
            const matches: (BonusFile & { folderName: string })[] = [];
            folder.files.forEach((f) => {
                if (f.name.toLowerCase().includes(q)) matches.push({ ...f, folderName: folder.name });
            });
            folder.subfolders?.forEach((sf) => {
                sf.files.forEach((f) => {
                    if (f.name.toLowerCase().includes(q)) matches.push({ ...f, folderName: `${folder.name} / ${sf.name}` });
                });
            });
            return matches;
        })
        : [];

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                            <Gift className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-text">
                                Bonus <span className="gradient-text">Kontraktor Hero</span>
                            </h1>
                            <p className="text-text-muted text-sm mt-0.5">
                                {totalFiles} senjata rahasia (template & dokumen) siap pakai
                            </p>
                        </div>
                    </div>

                    {/* Locked Badge for Non-Hero */}
                    {isLocked && user && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-border text-xs font-mono text-text-muted">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Preview Mode (Starter)</span>
                        </div>
                    )}
                </div>

                {/* Upgrade Banner if Locked */}
                {isLocked && user && (
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-accent/20 to-transparent border border-accent/20 flex flex-col md:flex-row items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent text-white rounded-lg">
                                <Crown className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Upgrade ke Hero untuk Akses Penuh</h3>
                                <p className="text-xs text-text-muted">Dapatkan akses instant ke {totalFiles} template & dokumen.</p>
                            </div>
                        </div>
                        <Link href="/course/upgrade" className="w-full md:w-auto px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-bold rounded-lg transition-colors text-center shadow-lg shadow-accent/20">
                            Upgrade Sekarang
                        </Link>
                    </div>
                )}

                {/* Search */}
                <div className="relative mt-6 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Cari template, SOP, atau dokumen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface-card border border-border rounded-xl text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                    />
                </div>
            </div>

            {/* Search Results */}
            {searchQuery.trim() && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-text mb-4">
                        Hasil Pencarian{" "}
                        <span className="text-text-muted font-normal text-sm">— {searchResults.length} hasil</span>
                    </h2>
                    {searchResults.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.map((file, i) => (
                                <div key={i}>
                                    <p className="text-xs text-text-muted mb-1 ml-1">{file.folderName}</p>
                                    <FileRow file={file} isLocked={isLocked} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-muted text-sm">Tidak ada file yang cocok.</p>
                    )}
                </div>
            )}

            {!searchQuery.trim() && !activeFolder && (
                <>
                    {/* Folder Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {bonusFolders.map((folder) => {
                            const Icon = folder.icon;
                            // ... file count calc ...
                            const fileCount =
                                folder.files.length +
                                (folder.subfolders?.reduce((a, sf) => a + sf.files.length, 0) || 0);
                            return (
                                <button
                                    key={folder.id}
                                    onClick={() => setActiveFolder(folder.id)}
                                    className="card text-left group cursor-pointer hover:glow-accent"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-surface flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-6 h-6 ${folder.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-text text-sm">{folder.name}</h3>
                                            <p className="text-text-muted text-xs mt-1 line-clamp-2">{folder.description}</p>
                                            <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                                                <FolderOpen className="w-3.5 h-3.5" />
                                                <span>{fileCount} file</span>
                                                {folder.subfolders && (
                                                    <>
                                                        <span>·</span>
                                                        <span>{folder.subfolders.length} subfolder</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {isLocked ? (
                                            <Lock className="w-5 h-5 text-text-muted group-hover:text-text transition-colors shrink-0 mt-1" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent shrink-0 mt-1 transition-colors" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-8 p-6 bg-surface-card border border-border rounded-2xl">
                        <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap text-center">
                            <div>
                                <p className="text-2xl font-black text-text">{totalFiles}</p>
                                <p className="text-xs text-text-muted mt-0.5">Total File</p>
                            </div>
                            <div className="h-8 w-px bg-border hidden md:block" />
                            <div>
                                <p className="text-2xl font-black text-text">7</p>
                                <p className="text-xs text-text-muted mt-0.5">Kategori</p>
                            </div>
                            <div className="h-8 w-px bg-border hidden md:block" />
                            <div>
                                <p className="text-2xl font-black text-accent">Gratis</p>
                                <p className="text-xs text-text-muted mt-0.5">Untuk Member Hero</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Active Folder Detail */}
            {!searchQuery.trim() && activeFolder && activeData && (
                <div>
                    <button
                        onClick={() => setActiveFolder(null)}
                        className="flex items-center gap-2 text-text-muted hover:text-text transition-colors text-sm mb-6 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke semua folder
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-xl bg-surface flex items-center justify-center`}>
                            <activeData.icon className={`w-7 h-7 ${activeData.color}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text">{activeData.name}</h2>
                            <p className="text-text-muted text-sm">{activeData.description}</p>
                        </div>
                    </div>

                    {/* Root files */}
                    {activeData.files.length > 0 && (
                        <div className="space-y-2 mb-6">
                            {activeData.files.map((file, i) => (
                                <FileRow key={i} file={file} isLocked={isLocked} />
                            ))}
                        </div>
                    )}

                    {/* Subfolders */}
                    {activeData.subfolders?.map((sf, sfIdx) => {
                        const sfKey = `${activeData.id}-${sfIdx}`;
                        const isExpanded = expandedSubfolders.has(sfKey);
                        return (
                            <div key={sfIdx} className="mb-4">
                                <button
                                    onClick={() => toggleSubfolder(sfKey)}
                                    className="flex items-center gap-3 p-4 bg-surface-card border border-border rounded-xl w-full text-left hover:border-accent/30 transition-all cursor-pointer"
                                    disabled={isLocked && false} // Subfolders can still be opened to see list, just files locked
                                >
                                    {isExpanded ? (
                                        <FolderOpen className="w-5 h-5 text-accent shrink-0" />
                                    ) : (
                                        <Folder className="w-5 h-5 text-accent shrink-0" />
                                    )}
                                    <span className="font-semibold text-text text-sm flex-1">{sf.name}</span>
                                    <span className="text-text-muted text-xs">{sf.files.length} file</span>
                                    {isLocked ? (
                                        <Lock className="w-4 h-4 text-text-muted" />
                                    ) : (
                                        <ChevronRight
                                            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                        />
                                    )}
                                </button>
                                {isExpanded && (
                                    <div className="mt-2 ml-4 space-y-2 border-l-2 border-border pl-4">
                                        {sf.files.map((file, fi) => (
                                            <FileRow key={fi} file={file} isLocked={isLocked} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
