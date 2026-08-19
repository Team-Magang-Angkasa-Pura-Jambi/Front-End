"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/common/components/ui/accordion";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Calculator,
  ChevronRight,
  Database,
  FilePenLine,
  HelpCircle,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

interface FAQItem {
  id: string;
  category: string;
  categoryIcon: React.ElementType;
  categoryLabel: string;
  question: string;
  answer: React.ReactNode;
  tags: string[];
  linkHref?: string;
  linkLabel?: string;
}

const FAQ_DATA: FAQItem[] = [
  // 1. DASBOR & ANALISIS ENERGI
  {
    id: "dash-1",
    category: "dashboard",
    categoryIcon: LayoutDashboard,
    categoryLabel: "Dasbor & Analitik",
    question: "Bagaimana cara membaca metrik dan KPI utama di Dasbor?",
    tags: ["dashboard", "kpi", "konsumsi", "biaya"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Dasbor Sentinel V2 menampilkan data konsumsi energi terpusat dalam periode harian,
          bulanan, hingga tahunan. Kartu ringkasan teratas menampilkan:
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <strong className="text-foreground">Total Konsumsi Aktual:</strong> Akumulasi pemakaian
            seluruh perangkat meter (kWh listrik, m³ air/gas, atau Liter BBM).
          </li>
          <li>
            <strong className="text-foreground">Estimasi Biaya:</strong> Hasil perkalian konsumsi
            dengan skema tarif harga master data yang aktif pada periode tersebut.
          </li>
          <li>
            <strong className="text-foreground">Status Deviasi Target Efisiensi:</strong> Indikator
            apakah konsumsi saat ini berada di bawah (efisien) atau melebihi batas target KPI yang
            ditetapkan.
          </li>
        </ul>
      </div>
    ),
    linkHref: "/dashboard",
    linkLabel: "Buka Dasbor",
  },
  {
    id: "dash-2",
    category: "dashboard",
    categoryIcon: LayoutDashboard,
    categoryLabel: "Dasbor & Analitik",
    question: "Bagaimana cara kerja Prediksi AI/ML dan deteksi anomali konsumsi?",
    tags: ["ai", "ml", "prediksi", "anomali", "machine learning"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Sentinel V2 terhubung dengan mikroservis Machine Learning (FastAPI) yang menjalankan model
          time-series forecasting (seperti XGBoost / ARIMA / Prophet).
        </p>
        <div className="bg-muted/40 border-border/60 space-y-1 rounded-xl border p-3">
          <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
            <BrainCircuit className="text-primary h-4 w-4" /> Fitur AI Sentinel:
          </span>
          <p>
            1. <strong>Prediksi Hari Esok:</strong> Memproyeksikan konsumsi energi berdasarkan data
            historis, pola hari kerja/akhir pekan, dan variabel suhu cuaca harian.
          </p>
          <p>
            2. <strong>Rentang Keyakinan (Confidence Interval):</strong> Menampilkan batas aman atas
            dan batas aman bawah untuk mendeteksi potensi pemborosan atau kebocoran pipa/kabel.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "dash-3",
    category: "dashboard",
    categoryIcon: LayoutDashboard,
    categoryLabel: "Dasbor & Analitik",
    question: "Bagaimana korelasi konsumsi energi dihitung dengan jumlah penumpang (PAX)?",
    tags: ["pax", "korelasi", "penumpang", "efisiensi spesifik"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Pada fasilitas publik (seperti bandara, terminal, atau mall), konsumsi energi berkorelasi
          langsung dengan volume penumpang/pengunjung (PAX). Sentinel V2 menghitung metrik:
        </p>
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-indigo-300">
          Konsumsi Spesifik = Total Konsumsi (kWh) / Total Penumpang (PAX)
        </div>
        <p>
          Metrik ini memastikan efisiensi diukur secara adil: kenaikan konsumsi energi saat lonjakan
          penumpang tidak langsung dianggap pemborosan jika rasio per PAX tetap stabil.
        </p>
      </div>
    ),
  },

  // 2. INPUT DATA & PENCATATAN KONSUMSI
  {
    id: "input-1",
    category: "enter-data",
    categoryIcon: FilePenLine,
    categoryLabel: "Input Data Konsumsi",
    question: "Bagaimana cara melakukan input angka meteran dan menggunakan fitur Salin Stand?",
    tags: ["input data", "enter data", "salin stand", "stand meter", "h+1"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>Alur pencatatan angka meteran harian pada menu Input Data:</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            Buka menu <strong>Input Data</strong> lalu pilih jenis energi (Listrik, Air, Gas, BBM).
          </li>
          <li>
            Pilih <strong>Meteran</strong> yang akan dicatat angkanya.
          </li>
          <li>
            Sistem secara otomatis mendeteksi riwayat terakhir dan merekomendasikan tanggal{" "}
            <strong className="text-primary">H+1 (Hari Berikutnya)</strong>.
          </li>
          <li>
            Gunakan tombol <strong className="text-foreground">"Salin Stand"</strong> untuk menyalin
            angka meteran sebelumnya secara cepat, lalu edit beberapa digit angka terakhir yang
            bertambah.
          </li>
          <li>
            Klik <strong>"Konfirmasi & Simpan Pembacaan"</strong>.
          </li>
        </ol>
      </div>
    ),
    linkHref: "/enter-data",
    linkLabel: "Buka Menu Input Data",
  },
  {
    id: "input-2",
    category: "enter-data",
    categoryIcon: FilePenLine,
    categoryLabel: "Input Data Konsumsi",
    question: "Bagaimana Sentinel V2 mencegah kesalahan input ganda (Race Condition)?",
    tags: ["race condition", "duplikasi", "keamanan data", "validasi"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Untuk menjamin integritas data audit dan mencegah pencatatan ganda oleh dua teknisi
          bersamaan:
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <strong className="text-foreground">Database Transaction Lock:</strong> Backend secara
            otomatis menolak jika sudah ada pembacaan untuk meteran yang sama pada rentang 24 jam
            tanggal yang dipilih.
          </li>
          <li>
            <strong className="text-foreground">Frontend Submission Guard:</strong> Tombol simpan
            langsung terkunci (*disabled*) saat proses pengiriman berlangsung guna mencegah *double
            click*.
          </li>
        </ul>
      </div>
    ),
  },

  // 3. FORMULA & KALKULASI ENGINE
  {
    id: "calc-1",
    category: "calculation",
    categoryIcon: Calculator,
    categoryLabel: "Formula & Kalkulasi",
    question: "Apa itu Formula & Kalkulasi Engine dan bagaimana cara kerjanya?",
    tags: ["formula", "kalkulasi", "rumus", "komputasi", "stand selisih"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          <strong>Formula & Kalkulasi Engine</strong> adalah mesin komputasi matematika otomatis
          Sentinel V2 yang memproses data angka meter mentah menjadi nilai konsumsi bersih (*Net
          Consumption*) dan ringkasan harian.
        </p>
        <p>
          Setiap kali teknisi menyimpan angka meter, mesin formula mengevaluasi ekspresi matematika
          yang terhubung pada meteran tersebut secara *real-time* dan otomatis memicu kalkulasi
          ulang bila ada revisi data H-1.
        </p>
      </div>
    ),
    linkHref: "/calculation-templates",
    linkLabel: "Buka Formula Studio",
  },
  {
    id: "calc-2",
    category: "calculation",
    categoryIcon: Calculator,
    categoryLabel: "Formula & Kalkulasi",
    question: "Apa saja variabel yang dapat digunakan dalam perancangan rumus?",
    tags: ["variabel", "reading", "spec", "constant", "multiplier", "tangki"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>Anda dapat menggabungkan 3 kategori variabel dalam studio rumus:</p>
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
          <div className="border-border/60 bg-muted/20 rounded-lg border p-2.5">
            <span className="text-foreground block font-bold">⚡ Parameter Sensor</span>
            <span className="text-[11px]">
              Nilai bacaan sensor (WBP, LWBP, Tinggi Cairan) pada waktu H-0 (Terkini) atau H-1
              (Kemarin).
            </span>
          </div>
          <div className="border-border/60 bg-muted/20 rounded-lg border p-2.5">
            <span className="text-foreground block font-bold">📟 Spesifikasi Fisik</span>
            <span className="text-[11px]">
              Faktor kali (<code className="text-primary">multiplier</code>), batas putaran (
              <code className="text-primary">rollover_limit</code>), dimensi tangki (diameter,
              panjang, lebar, tinggi).
            </span>
          </div>
          <div className="border-border/60 bg-muted/20 rounded-lg border p-2.5">
            <span className="text-foreground block font-bold">🔢 Konstanta Numerik</span>
            <span className="text-[11px]">
              Angka statis tetap seperti nilai <code className="text-primary">PI = 3.14159</code>,
              faktor pembagi volume 1000, dll.
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "calc-3",
    category: "calculation",
    categoryIcon: Calculator,
    categoryLabel: "Formula & Kalkulasi",
    question: "Bagaimana cara menghitung volume dan pemakaian BBM pada tangki silinder & kotak?",
    tags: ["tangki", "sounding", "bbm", "solar", "silinder", "persegi", "liter"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>Sentinel V2 menyediakan preset siap pakai untuk profiling tangki sounding:</p>
        <div className="space-y-2 font-mono text-[11px]">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-emerald-300">
            <strong>Tangki Silinder Tegak:</strong>
            <p className="mt-0.5 text-slate-400">
              PI * ((DIAMETER / 2) ^ 2) * (TINGGI_PREV - TINGGI_NOW) / 1000
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-blue-300">
            <strong>Tangki Kotak Persegi:</strong>
            <p className="mt-0.5 text-slate-400">
              (PANJANG * LEBAR * (TINGGI_PREV - TINGGI_NOW)) / 1000
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-amber-300">
            <strong>Rasio Persentase Kapasitas:</strong>
            <p className="mt-0.5 text-slate-400">
              ((TINGGI_PREV - TINGGI_NOW) / HEIGHT_MAX) * CAPACITY
            </p>
          </div>
        </div>
      </div>
    ),
  },

  // 4. DATA MASTER & KONFIGURASI
  {
    id: "master-1",
    category: "data-master",
    categoryIcon: Database,
    categoryLabel: "Data Master",
    question: "Bagaimana cara menghubungkan meteran baru dengan template kalkulasi?",
    tags: ["data master", "meter", "tambah meter", "template formula"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Pada menu <strong>Data Master &gt; Meter</strong>, saat Anda membuat atau mengedit data
          meter:
        </p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>Isi nama meter, kode meter unik, lokasi, dan jenis energi.</li>
          <li>
            Pilih <strong>Template Kalkulasi</strong> pada dropdown untuk menentukan formula
            perhitungan yang digunakan meter tersebut.
          </li>
          <li>
            Jika meter berupa tangki BBM/Air, aktifkan <strong>Profil Tangki</strong> dan masukkan
            dimensi fisik (kapasitas liter, tinggi max, diameter, atau panjang/lebar).
          </li>
        </ol>
      </div>
    ),
    linkHref: "/data-master",
    linkLabel: "Buka Data Master",
  },
  {
    id: "master-2",
    category: "data-master",
    categoryIcon: Database,
    categoryLabel: "Data Master",
    question: "Bagaimana cara mengatur skema tarif harga energi (Price Scheme)?",
    tags: ["skema harga", "tarif", "pln", "biaya energi", "rupiah"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Skema harga dikelola di menu <strong>Data Master &gt; Skema Harga</strong>. Anda dapat
          mendefinisikan tarif flat (misal: Rp/Liter BBM atau Rp/m³ Air) maupun tarif bertingkat
          seperti <em>Waktu Beban Puncak (WBP)</em> dan <em>Luar Waktu Beban Puncak (LWBP)</em> PLN
          lengkap dengan tanggal masa berlaku skema tarif.
        </p>
      </div>
    ),
  },

  // 5. ANGGARAN & FINANSIAL
  {
    id: "budget-1",
    category: "budget",
    categoryIcon: Wallet,
    categoryLabel: "Anggaran & Finansial",
    question: "Bagaimana sistem memonitor penggunaan anggaran energi tahunan?",
    tags: ["anggaran", "budget", "finansial", "alokasi bulanan", "over budget"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Pada modul <strong>Anggaran</strong>, Administrator menetapkan pagu anggaran tahunan per
          jenis energi dan mendistribusikannya ke 12 bulan (Alokasi Bulanan).
        </p>
        <p>
          Sistem secara otomatis membandingkan akumulasi biaya harian aktual dari seluruh pencatatan
          meter dengan kuota anggaran bulanan dan memberikan status visual (<em>Aman</em>,{" "}
          <em>Waspada</em>, atau <em>Over Budget</em>).
        </p>
      </div>
    ),
    linkHref: "/budget",
    linkLabel: "Buka Manajemen Anggaran",
  },

  // 6. MONITORING SERVER & LOGS
  {
    id: "mon-1",
    category: "monitoring",
    categoryIcon: Activity,
    categoryLabel: "Monitoring Server",
    question: "Informasi apa saja yang dipantau pada halaman Monitoring Server?",
    tags: ["monitoring", "server", "cpu", "ram", "uptime", "debug", "circular buffer"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Halaman <strong>Monitoring Server (/server-monitoring)</strong> dirancang untuk standar
          industri pemantauan operasional server *real-time*:
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <strong className="text-foreground">System Health Metrics:</strong> Uptime server,
            konsumsi memori RAM (Heap Used / Heap Total / RSS), persentase CPU Load, dan status
            koneksi Database PostgreSQL.
          </li>
          <li>
            <strong className="text-foreground">Console Log & Circular Buffer:</strong> Menampung
            rekaman log HTTP, query database, warning, dan error sistem dengan interval auto-refresh
            hingga 1 detik.
          </li>
          <li>
            <strong className="text-foreground">Dev Debug Inspector Modal:</strong> Memeriksa detail
            request payload, query parameter, headers, response body, serta error stack trace
            lengkap.
          </li>
        </ul>
      </div>
    ),
    linkHref: "/server-monitoring",
    linkLabel: "Buka Monitoring Server",
  },

  // 7. AUDIT LOG SISTEM & KEAMANAN
  {
    id: "audit-1",
    category: "audit",
    categoryIcon: ShieldCheck,
    categoryLabel: "Audit Log & Keamanan",
    question: "Apa saja aktivitas yang dicatat dalam Log Audit Sistem?",
    tags: ["audit log", "jejak audit", "riwayat", "keamanan", "diff", "user tracking"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Untuk memenuhi standar kepatuhan audit perusahaan, Sentinel V2 merekam setiap mutasi data
          krusial:
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            Pencatatan angka meter baru (<code className="text-primary">ReadingSession</code>)
            beserta seluruh nilai detail parameter.
          </li>
          <li>
            Pembuatan dan modifikasi formula rumus (
            <code className="text-primary">CalculationTemplate</code>).
          </li>
          <li>Perubahan master data meter, tarif harga, target efisiensi, dan akun pengguna.</li>
          <li>
            Informasi waktu tepat (*timestamp*), ID user pembuat, alamat IP, dan User Agent
            perangkat.
          </li>
        </ul>
      </div>
    ),
    linkHref: "/audit-logs",
    linkLabel: "Buka Log Audit Sistem",
  },
  {
    id: "audit-2",
    category: "audit",
    categoryIcon: ShieldCheck,
    categoryLabel: "Audit Log & Keamanan",
    question: "Bagaimana cara melihat riwayat perubahan data (Old vs New Values Diff)?",
    tags: ["diff", "inspektur audit", "old values", "new values", "json diff"],
    answer: (
      <div className="text-muted-foreground space-y-2 text-xs leading-relaxed">
        <p>
          Pada halaman <strong>Log Audit Sistem</strong> maupun tombol <strong>"Riwayat"</strong> di
          setiap menu Data Master:
        </p>
        <p>
          Klik tombol <strong>"Lihat Diff / Detail Nilai"</strong> untuk membuka modal inspektur
          perbandingan visual berdampingan (*Side-by-Side Inspector*). Kolom kiri menampilkan data
          sebelum diubah (merah) dan kolom kanan menampilkan data setelah diubah (hijau).
        </p>
      </div>
    ),
  },
];

const CATEGORIES = [
  { key: "ALL", label: "Semua Kategori", icon: Sparkles },
  { key: "dashboard", label: "Dasbor & Analitik", icon: LayoutDashboard },
  { key: "enter-data", label: "Input Data", icon: FilePenLine },
  { key: "calculation", label: "Formula & Kalkulasi", icon: Calculator },
  { key: "data-master", label: "Data Master", icon: Database },
  { key: "budget", label: "Anggaran", icon: Wallet },
  { key: "monitoring", label: "Monitoring Server", icon: Activity },
  { key: "audit", label: "Log Audit Sistem", icon: ShieldCheck },
];

export const FAQPage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;

      const query = searchKeyword.toLowerCase().trim();
      if (!query) return matchCategory;

      const matchQuestion = item.question.toLowerCase().includes(query);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
      const matchCategoryLabel = item.categoryLabel.toLowerCase().includes(query);

      return matchCategory && (matchQuestion || matchTags || matchCategoryLabel);
    });
  }, [searchKeyword, selectedCategory]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* HEADER SECTION DENGAN HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-border/60 from-card via-card to-primary/5 relative overflow-hidden rounded-3xl border bg-linear-to-br p-8 shadow-sm"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-bold">
            💡 Pusat Bantuan & Dokumentasi Sistem
          </Badge>

          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            Frequently Asked Questions (FAQ)
          </h1>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Panduan komprehensif seluruh modul Sentinel V2: mulai dari pencatatan stand meter,
            perancangan formula komputasi, analitik AI, hingga pemantauan server industri.
          </p>

          {/* SEARCH BAR */}
          <div className="relative pt-2">
            <Search className="text-muted-foreground absolute top-5 left-3.5 h-5 w-5" />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari pertanyaan, rumus tangki, rollover, AI prediksi, audit..."
              className="bg-background/90 border-border/70 h-12 rounded-xl pl-11 text-sm font-medium shadow-sm"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="text-muted-foreground hover:text-foreground absolute top-5 right-3.5 text-xs font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Decorative Background Tech Glow */}
        <div className="bg-primary/10 pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full blur-3xl" />
      </motion.div>

      {/* CATEGORY FILTER PILLS */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.key;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.label}</span>
              {cat.key !== "ALL" && (
                <span
                  className={cn(
                    "py-0.2 rounded-full px-1.5 font-mono text-[10px]",
                    isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {FAQ_DATA.filter((i) => i.category === cat.key).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FAQ ACCORDION CONTAINER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Menampilkan {filteredFAQs.length} Topik Bantuan
          </span>
          {searchKeyword && (
            <span className="text-primary text-xs font-medium">
              Hasil pencarian: "{searchKeyword}"
            </span>
          )}
        </div>

        {filteredFAQs.length === 0 ? (
          <Card className="border-border/80 bg-card text-muted-foreground space-y-3 rounded-2xl border-dashed p-12 text-center">
            <HelpCircle className="text-primary mx-auto h-10 w-10 opacity-40" />
            <div className="space-y-1">
              <h4 className="text-foreground text-base font-bold">Tidak Ada Topik yang Cocok</h4>
              <p className="text-xs">
                Coba gunakan kata kunci pencarian yang lain atau pilih kategori "Semua Kategori".
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearchKeyword("");
                setSelectedCategory("ALL");
              }}
            >
              Reset Filter
            </Button>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {filteredFAQs.map((faq) => {
              const CategoryIcon = faq.categoryIcon;

              return (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-border/60 bg-card hover:border-primary/40 data-[state=open]:border-primary/50 rounded-2xl border px-5 shadow-xs transition-all data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="gap-4 py-4 text-left hover:no-underline">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div className="bg-primary/10 text-primary border-primary/20 mt-0.5 shrink-0 rounded-xl border p-2">
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-primary text-[10px] font-bold tracking-wide uppercase">
                            {faq.categoryLabel}
                          </span>
                        </div>
                        <h3 className="text-foreground text-sm leading-snug font-bold">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="border-border/40 space-y-4 border-t pt-2 pb-5">
                    <div className="pl-11">{faq.answer}</div>

                    {/* Tags & Quick Action Link */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pl-11">
                      <div className="flex flex-wrap gap-1.5">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted/60 text-muted-foreground border-border/50 rounded-md border px-2 py-0.5 text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {faq.linkHref && faq.linkLabel && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10 h-7 gap-1.5 text-xs font-semibold"
                        >
                          <Link href={faq.linkHref}>
                            {faq.linkLabel} <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* QUICK SHORTCUTS CARD GRID */}
      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card hover:border-primary/40 rounded-2xl p-5 transition-all">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-0 pb-2">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Studio Formula Rumus</CardTitle>
              <CardDescription className="text-xs">
                Rancang formula matematika & tangki
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border/60 w-full gap-1 text-xs font-bold"
            >
              <Link href="/calculation-templates">
                Buka Formula Studio <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card hover:border-primary/40 rounded-2xl p-5 transition-all">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-0 pb-2">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Monitoring & Debugger</CardTitle>
              <CardDescription className="text-xs">Console log & query inspector</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border/60 w-full gap-1 text-xs font-bold"
            >
              <Link href="/server-monitoring">
                Buka Monitoring <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card hover:border-primary/40 rounded-2xl p-5 transition-all">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-0 pb-2">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Log Audit Sistem</CardTitle>
              <CardDescription className="text-xs">Lacak mutasi & rekaman data</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border/60 w-full gap-1 text-xs font-bold"
            >
              <Link href="/audit-logs">
                Buka Log Audit <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
