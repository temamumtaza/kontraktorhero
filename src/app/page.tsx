"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  Building2,
  Wallet,
  ShieldCheck,
  Settings,
  Rocket,
  FileSpreadsheet,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  Star,
  ArrowRight,
  ChevronDown,
  Clock,
  Users,
  Lock,
  Zap,
  Target,
  TrendingUp,
  Award,
  X as XIcon,
  Gift,
  BadgeCheck,
  ShieldAlert,
  Timer,
  Crown,
  Receipt,
  Scale,
  FolderOpen,
  Sword,
  Shield,
  Flame,
} from "lucide-react";

const modules = [
  {
    num: "01",
    title: "Fondasi & Mindset Bisnis",
    desc: "Definisi bisnis kontraktor, 5 penyebab kegagalan, transformasi mindset, career roadmap 10 tahun.",
    icon: Brain,
    price: "Rp 500.000",
  },
  {
    num: "02",
    title: "Membangun Otoritas & Kepercayaan",
    desc: "Psikologi trust, showcase project strategy, digital presence, penawaran profesional.",
    icon: Building2,
    price: "Rp 500.000",
  },
  {
    num: "03",
    title: "Manajemen Keuangan (RAB & HPP)",
    desc: "RAB modular, kalkulasi HPP, strategi margin, sistem audit proyek.",
    icon: Wallet,
    price: "Rp 750.000",
  },
  {
    num: "04",
    title: "Pertahanan Arus Kas",
    desc: "Cash flow defense, anggaran mingguan, overhead management, variasi order.",
    icon: ShieldCheck,
    price: "Rp 750.000",
  },
  {
    num: "05",
    title: "Sistem Operasional & Tim",
    desc: "Struktur tim, delegasi, SOP proyek, checklist QC, dashboard digital.",
    icon: Settings,
    price: "Rp 500.000",
  },
  {
    num: "06",
    title: "Skalabilitas Developer",
    desc: "Model Build & Sell, akuisisi lahan, diversifikasi income, roadmap 10 tahun.",
    icon: Rocket,
    price: "Rp 1.000.000",
  },
];

const bonuses = [
  { name: "Template RAB Rumah 1 & 2 Lantai", value: "Rp 497.000", icon: FileSpreadsheet, count: "4 file" },
  { name: "Template Cash Flow & Keuangan", value: "Rp 397.000", icon: Receipt, count: "6 file" },
  { name: "21 Template Invoice Profesional", value: "Rp 297.000", icon: FileText, count: "21 file" },
  { name: "Template SDM, Absensi & Timesheet", value: "Rp 497.000", icon: Users, count: "25 file" },
  { name: "27 SOP Konstruksi Lengkap", value: "Rp 1.350.000", icon: ClipboardCheck, count: "27 file" },
  { name: "Referensi AHSP 2025 (Kemen PUPR)", value: "Rp 247.000", icon: Scale, count: "10 file" },
  { name: "Dokumen Proyek (Checklist & Serah Terima)", value: "Rp 197.000", icon: Building2, count: "4 file" },
];

const faqs = [
  {
    q: "Apa saja isinya?",
    a: "6 modul lengkap: Mindset Bisnis, Otoritas & Kepercayaan, Manajemen Keuangan, Cash Flow, Operasional & Tim, Skalabilitas Developer. Plus 80+ bonus file template senilai Rp 3.4 juta (paket Hero).",
  },
  {
    q: "Formatnya apa?",
    a: "Text-based course yang bisa dibaca kapan saja, offline-friendly. Disertai tabel, diagram, studi kasus, dan template siap pakai.",
  },
  {
    q: "Siapa yang cocok ikut?",
    a: "Kontraktor pemula, tukang bangunan yang ingin naik level jadi pemilik bisnis, pemborong yang ingin scale.",
  },
  {
    q: "Kalau gak cocok bagaimana?",
    a: "Garansi 7 hari uang kembali, tanpa pertanyaan. Jika Anda merasa kursus ini tidak memberikan nilai, kami kembalikan 100% uang Anda.",
  },
  {
    q: "Apakah bisa diakses selamanya?",
    a: "Ya! Satu kali bayar, akses selamanya. Termasuk semua update konten di masa depan.",
  },
  {
    q: "Saya sudah berpengalaman, apakah tetap berguna?",
    a: "Kontraktor berpengalaman pun bisa mendapat manfaat besar dari sistem keuangan, SOP, dan strategi scaling ke developer yang tidak diajarkan di lapangan.",
  },
];

const testimonials = [
  {
    name: "Pak Dedi",
    location: "Bandung",
    text: "Dulu handle proyek 50-100 juta/bulan dengan profit tipis. Setelah terapkan sistem RAB modular, sekarang 3-4 proyek paralel dengan margin terjaga.",
    role: "Kontraktor Renovasi",
  },
  {
    name: "Mas Andi",
    location: "Surabaya",
    text: "Template kontrak dan SOP dari kursus ini menyelamatkan saya dari klien bermasalah. Sekarang proyek berjalan lebih profesional.",
    role: "Pemborong Bangunan",
  },
  {
    name: "Pak Hadi",
    location: "Semarang",
    text: "Bab tentang cash flow defense benar-benar membuka mata. Selama 5 tahun saya gak sadar bocornya di mana. Sekarang profit naik 2x.",
    role: "Kontraktor Rumah",
  },
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tick = () => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Timer className="w-4 h-4 text-white/90" />
      <span className="text-white font-mono font-bold text-sm">
        {String(timeLeft.h).padStart(2, "0")}:{String(timeLeft.m).padStart(2, "0")}:{String(timeLeft.s).padStart(2, "0")}
      </span>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-border rounded-xl overflow-hidden transition-all duration-300"
      onClick={() => setOpen(!open)}
    >
      <button className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-hover transition-colors cursor-pointer">
        <span className="font-semibold text-text pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-accent transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5 px-5" : "max-h-0"}`}
      >
        <p className="text-text-muted">{a}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [slotsLeft] = useState(47);

  const courseTotal = modules.reduce((acc, m) => {
    const num = parseInt(m.price.replace(/\D/g, ""));
    return acc + num;
  }, 0);
  const bonusTotal = bonuses.reduce((acc, b) => {
    const num = parseInt(b.value.replace(/\D/g, ""));
    return acc + num;
  }, 0);
  const grandTotal = courseTotal + bonusTotal;

  return (
    <main className="min-h-screen">
      {/* Urgency Bar */}
      <div className="bg-gradient-to-r from-red-900 to-accent-dark text-center py-2.5 px-4 text-sm">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-medium">
            KONTRAKTOR HERO LAUNCH — Harga naik dalam
          </span>
          <CountdownTimer />
          <span className="text-yellow-400 font-bold">
            Sisa {slotsLeft} slot!
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Kontraktor Hero"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span>
              <span className="text-accent">Kontraktor</span> Hero
            </span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-text-muted">
            <a href="#kurikulum" className="hover:text-white transition-colors">
              Kurikulum
            </a>
            <a href="#bonus" className="hover:text-white transition-colors">
              Bonus
            </a>
            <a href="#harga" className="hover:text-white transition-colors">
              Harga
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <Link href="/login" className="btn-primary !py-2 !px-5 text-sm">
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Akses Member
            </Link>
          </div>
          <Link
            href="/login"
            className="md:hidden btn-primary !py-2 !px-4 text-sm"
          >
            Akses Member
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6 animate-pulse-slow">
            <Flame className="w-4 h-4" />
            KONTRAKTOR HERO LAUNCH — Diskon 97% Berakhir Hari Ini
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
            Capek Kerja Keras{" "}
            <br className="hidden md:block" />
            Tapi <span className="gradient-text">Profit Tipis?</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Anda banting tulang dari subuh sampai maghrib.{" "}
            <strong className="text-text">Proyek jalan, tapi uang gak pernah numpuk.</strong>{" "}\
            Klien nego terus, tukang minta gaji duluan, material naik mendadak.{" "}
            <span className="text-red-400">merasa familiar?</span>
          </p>
          <p className="mt-4 text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
            Masalahnya bukan kerja kurang keras.{" "}
            <strong className="text-accent text-2xl">Masalahnya Anda belum punya SISTEM.</strong>
          </p>
          <div className="mt-8 p-6 bg-surface-card border border-accent/20 rounded-2xl max-w-xl mx-auto">
            <p className="text-text font-bold text-lg">
              <Shield className="w-5 h-5 text-accent inline mr-2" />
              Kontraktor Hero = Solusi Lengkap Bisnis Konstruksi
            </p>
            <p className="text-text-muted text-sm mt-2">
              6 modul kursus + 80+ template siap pakai — dari RAB, cash flow, SOP, sampai scaling jadi developer properti.
            </p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/checkout?tier=hero"
              className="w-full md:w-auto h-14 px-8 flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white font-bold text-lg rounded-xl shadow-xl shadow-accent/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sword className="w-6 h-6" />
              Ambil Senjata Anda — Rp 149.000
            </a>
            <a
              href="#curriculum"
              className="w-full md:w-auto h-14 px-8 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-hover text-white font-semibold text-lg rounded-xl border border-white/10 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              Lihat Isi Materi
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-text-muted flex-wrap">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-success" /> Akses selamanya
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-success" /> Garansi 7 hari
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-success" /> Update gratis
            </span>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <div className="bg-surface-light border-y border-border py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-16 flex-wrap text-center">
          <div>
            <p className="text-2xl font-black text-text">500+</p>
            <p className="text-xs text-text-muted mt-0.5">Kontraktor Hero Aktif</p>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div>
            <p className="text-2xl font-black text-text">4.9/5</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div>
            <p className="text-2xl font-black text-text">6 Modul</p>
            <p className="text-xs text-text-muted mt-0.5">+ 80 Bonus File</p>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div>
            <p className="text-2xl font-black text-accent">97%</p>
            <p className="text-xs text-text-muted mt-0.5">Diskon Launch</p>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">
            Setiap Kontraktor Punya{" "}
            <span className="gradient-text">Musuh Utama</span>
          </h2>
          <p className="section-subtitle text-center mx-auto">
            Tanpa sistem yang benar, masalah ini akan terus membayangi bisnis Anda.
          </p>
          <div className="grid md:grid-cols-2 gap-5 mt-12">
            {[
              "Sudah banting tulang seharian tapi profit proyek tipis banget",
              "Takut scaling karena makin besar proyek, makin chaos",
              "Klien selalu nego harga, Anda gak punya pegangan HPP yang akurat",
              "Gak punya kontrak yang jelas, sering kena 'tambah pekerjaan' tanpa tambah biaya",
              "Cash flow seret — uang klien belum turun tapi tukang sudah minta gaji",
              "Ingin punya tim tapi gak tahu cara mendelegasikan pekerjaan",
            ].map((problem, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-red-500/5 border border-red-500/10 rounded-xl"
              >
                <XIcon className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-text-muted">{problem}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-xl text-text font-semibold">
              Jika minimal 2 dari hal di atas Anda rasakan,
            </p>
            <p className="text-lg text-accent mt-2">
              maka Anda butuh <strong>sistem yang tepat</strong>, bukan kerja lebih keras.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-surface-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title">
            Perkenalkan:{" "}
            <span className="gradient-text">Kontraktor Hero</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Kursus bisnis konstruksi paling komprehensif di Indonesia. Bukan
            tips random — tapi <strong className="text-text">BLUEPRINT LENGKAP</strong> dari nol sampai jadi developer.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                Icon: Sword,
                title: "Strategi Teruji",
                desc: "Setiap taktik sudah teruji di proyek nyata, bukan teori textbook.",
              },
              {
                Icon: Shield,
                title: "Pertahanan Kokoh",
                desc: "Sistem keuangan, kontrak, dan SOP yang melindungi profit Anda.",
              },
              {
                Icon: Rocket,
                title: "Power to Scale",
                desc: "Roadmap lengkap dari kontraktor pemula hingga developer properti.",
              },
            ].map((item, i) => (
              <div key={i} className="card text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.Icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-text">{item.title}</h3>
                <p className="text-text-muted mt-2 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="kurikulum" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">
            6 Modul <span className="gradient-text">Kurikulum Komprehensif</span>
          </h2>
          <p className="section-subtitle text-center mx-auto">
            Setiap modul dirancang untuk diterapkan langsung di proyek nyata —
            sistematis dan terukur.
          </p>
          <div className="mt-12 space-y-4">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.num}
                  className="card flex items-start gap-5 group hover:glow-accent"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-accent">
                        MODUL {mod.num}
                      </span>
                      <span className="text-xs text-accent/70 font-medium">
                        Nilai {mod.price}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text mt-1">
                      {mod.title}
                    </h3>
                    <p className="text-text-muted text-sm mt-1">{mod.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm">
              Total nilai course: <span className="text-text line-through">Rp {courseTotal.toLocaleString("id-ID")}</span> →{" "}
              <span className="text-accent font-bold">Termasuk dalam paket</span>
            </p>
          </div>
        </div>
      </section>

      {/* Bonus Showcase */}
      <section id="bonus" className="py-20 px-6 bg-surface-light relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(221,107,32,0.06),transparent_60%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              BONUS EKSKLUSIF — Senilai Rp {bonusTotal.toLocaleString("id-ID")}
            </div>
            <h2 className="section-title">
              <span className="gradient-text">80+ Template & Dokumen</span> Siap Pakai
            </h2>
            <p className="section-subtitle text-center mx-auto">
              Bukan cuma kursus — Anda juga dapat seluruh koleksi template profesional yang
              bisa langsung di-deploy di proyek. <strong className="text-text">Download, isi angka, pakai.</strong>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonuses.map((b, i) => {
              const BIcon = b.icon;
              return (
                <div key={i} className="card group hover:glow-accent">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <BIcon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text text-sm">{b.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-md">
                          {b.count}
                        </span>
                        <span className="text-xs text-accent/70 font-medium">Nilai {b.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-text-muted text-sm">
              Total nilai bonus: <span className="text-text line-through">Rp {bonusTotal.toLocaleString("id-ID")}</span> →{" "}
              <span className="text-accent font-bold text-lg">GRATIS</span>{" "}
              <span className="text-text-muted">di paket Kontraktor Hero</span>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="py-20 px-6 bg-surface-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-center">
            Pilih <span className="gradient-text">Paket Kontraktor Hero</span>
          </h2>
          <p className="section-subtitle text-center mx-auto">
            Harga spesial launch — <span className="text-red-400 font-semibold">naik kapan saja tanpa pemberitahuan.</span>
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="card border-border">
              <div className="text-center">
                <span className="text-sm font-mono text-text-muted uppercase tracking-wider">
                  Starter
                </span>
                <div className="mt-3">
                  <span className="text-text-muted line-through text-lg">
                    Rp {courseTotal.toLocaleString("id-ID")}
                  </span>
                  <div className="text-4xl font-black text-text mt-1">
                    Rp 99.000
                  </div>
                  <span className="text-sm text-text-muted">
                    Sekali bayar, akses selamanya
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {modules.map((m) => (
                  <div key={m.num} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span className="text-text-muted flex-1">{m.title}</span>
                    <span className="text-xs text-accent/70">{m.price}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="w-4 h-4 text-success shrink-0" />
                  <span className="text-text-muted">Akses selamanya + update gratis</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                  <span className="text-text-muted">Garansi 7 hari uang kembali</span>
                </div>
              </div>
              <a
                href="/checkout?tier=starter"
                className="btn-secondary w-full mt-8 text-center block"
              >
                Pilih Starter
              </a>
            </div>

            {/* Hero */}
            <div className="card border-accent relative overflow-hidden glow-accent">
              <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> PALING LARIS
              </div>
              <div className="text-center">
                <span className="text-sm font-mono text-accent uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Shield className="w-4 h-4" /> Kontraktor Hero
                </span>
                <div className="mt-3">
                  <span className="text-text-muted line-through text-lg">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                  <div className="text-4xl font-black text-text mt-1">
                    Rp 149.000
                  </div>
                  <span className="text-sm text-red-400 font-semibold">
                    Hemat 97% — Hanya hari ini!
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {modules.map((m) => (
                  <div key={m.num} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span className="text-text-muted flex-1">{m.title}</span>
                    <span className="text-xs text-accent/70">{m.price}</span>
                  </div>
                ))}
                <div className="my-3 border-t border-border" />
                <p className="text-xs font-mono text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" /> 80+ File Template & Dokumen Kerja
                </p>
                {bonuses.map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <BIcon className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-text-muted flex-1">{b.name}</span>
                      <span className="text-xs text-accent/70">
                        {b.value}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="w-4 h-4 text-success shrink-0" />
                  <span className="text-text-muted">Akses selamanya + update gratis</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                  <span className="text-text-muted">Garansi 7 hari uang kembali</span>
                </div>
              </div>
              <a href="/checkout?tier=hero" className="btn-primary w-full mt-8 text-center block group">
                <Sword className="w-4 h-4 mr-2 inline" />
                Ambil Promo Ini — Rp 149.000
                <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-red-400">
                <Users className="w-3.5 h-3.5" />
                <span>Sisa {slotsLeft} slot harga promo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">
            Kata Mereka Yang Sudah <span className="gradient-text">Membuktikan</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-0.5 text-sm mb-3">
                  {[1, 2, 3, 4, 5].map(j => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-text-muted text-sm leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm">{t.name}</p>
                    <p className="text-xs text-text-muted">
                      {t.role} — {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 px-6 bg-surface-light">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text">
            Hero Guarantee — 100% Uang Kembali
          </h2>
          <p className="text-text-muted mt-3">
            Coba selama 7 hari. Jika Anda merasa kursus ini tidak memberikan
            nilai, kami kembalikan 100% uang Anda tanpa pertanyaan. <strong className="text-text">Zero risk</strong> untuk Anda.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title text-center">
            Pertanyaan <span className="gradient-text">Umum</span>
          </h2>
          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-surface-light to-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,107,32,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-text">
            Siap Jadi{" "}
            <span className="gradient-text">Kontraktor Hero?</span>
          </h2>
          <p className="text-text-muted mt-4 text-lg">
            Setiap proyek besar dimulai dari satu langkah. Mulai transformasi bisnis Anda sekarang.
          </p>
          <a href="/checkout?tier=hero" className="btn-primary text-lg mt-8 inline-flex items-center group">
            <Sword className="w-5 h-5 mr-2" />
            Ambil Promo Ini
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-400">
            <Clock className="w-4 h-4" />
            <span>Harga promo terbatas — naik kapan saja tanpa pemberitahuan</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            © 2024 Kontraktor Hero. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-text transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#" className="hover:text-text transition-colors">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </footer>
    </main >
  );
}
