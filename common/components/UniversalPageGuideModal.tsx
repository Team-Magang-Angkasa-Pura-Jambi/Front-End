"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { BugReportModal } from "@/modules/BugReport/components/BugReportModal";
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bug,
  Calculator,
  CircleUserRound,
  ClipboardPaste,
  Clock,
  CloudSun,
  Code2,
  Copy,
  Database,
  DollarSign,
  Download,
  Edit,
  Eye,
  FilePenLine,
  Filter,
  Gauge,
  HelpCircle,
  History,
  Info,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Lightbulb,
  ListFilter,
  ListOrdered,
  Lock,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Variable,
  Wallet,
  Zap,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export interface ButtonGuideItem {
  step: number;
  name: string;
  icon: React.ElementType;
  location: string;
  description: string;
  shortcut?: string;
  badge?: string;
  impact?: string;
}

export interface WorkflowStepItem {
  stepNumber: number;
  title: string;
  instruction: string;
  recommendedAction?: string;
}

export interface PageGuideConfig {
  route: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  overview: string;
  targetUsers: string;
  workflow: WorkflowStepItem[];
  buttons: ButtonGuideItem[];
  tips: string[];
}

const PAGE_GUIDES: PageGuideConfig[] = [
  // 1. DASHBOARD
  {
    route: "/dashboard",
    title: "Dasbor Pemantauan & Analitik Energi",
    subtitle: "Pusat visualisasi real-time metrik konsumsi, estimasi biaya, dan prediksi AI",
    icon: LayoutDashboard,
    overview:
      "Modul Dasbor menyajikan ringkasan performa energi menyeluruh di fasilitas Sultan Thaha Jambi. Melalui halaman ini, manajemen dapat memantau konsumsi aktual vs target efisiensi, memproyeksikan konsumsi masa depan dengan AI ML, serta menganalisis efisiensi energi per penumpang (PAX).",
    targetUsers: "Super Admin, Management, Admin Energi, Teknisi",
    workflow: [
      {
        stepNumber: 1,
        title: "Tinjau Ringkasan Kartu KPI",
        instruction:
          "Periksa kartu ringkasan KPI di bagian atas untuk mengetahui status konsumsi dan biaya hari ini.",
        recommendedAction:
          "Cek deviasi target efisiensi (Hijau = Efisien, Merah = Melebihi Target).",
      },
      {
        stepNumber: 2,
        title: "Pilih Filter Rentang Waktu",
        instruction:
          "Pilih filter rentang waktu (Harian, Bulanan, atau Tahunan) untuk menganalisis tren konsumsi.",
        recommendedAction: "Gunakan mode Bulanan untuk evaluasi performa billing PLN / BBM.",
      },
      {
        stepNumber: 3,
        title: "Saring Meteran Spesifik",
        instruction:
          "Gunakan filter Meteran/Jenis Energi untuk mendalami konsumsi spesifik (Listrik PLN, BBM Genset, Air Bersih).",
        recommendedAction: "Pilih 'Semua Meter' untuk melihat agregasi fasilitas total.",
      },
      {
        stepNumber: 4,
        title: "Evaluasi Grafik Prediksi AI & Anomali",
        instruction:
          "Bandingkan garis Aktual vs Prediksi AI pada grafik untuk mendeteksi anomali konsumsi.",
        recommendedAction: "Waspadai titik konsumsi yang menembus batas atas Confidence Interval.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Filter Rentang Waktu (Harian / Bulanan / Tahunan)",
        icon: Clock,
        location: "Header Grafik Analisis",
        description:
          "Mengubah agregasi sumbu X dan interval perhitungan data konsumsi energi pada grafik.",
      },
      {
        step: 2,
        name: "Pilih Meteran / Jenis Energi",
        icon: Zap,
        location: "Dropdown Filter Atas",
        description:
          "Menyaring seluruh widget dan grafik agar hanya menampilkan data dari meter atau tipe energi tertentu.",
      },
      {
        step: 3,
        name: "Filter Metrik Konsumsi vs Biaya",
        icon: DollarSign,
        location: "Tab Selector Grafik",
        description:
          "Mengalihkan grafik antara satuan fisik (kWh / Liter / m³) dengan satuan moneter (Rupiah).",
      },
      {
        step: 4,
        name: "Kustomisasi Layout Dasbor",
        icon: LayoutTemplate,
        location: "Tombol Pengaturan Header",
        description:
          "Membuka modal konfigurasi untuk mengatur ulang urutan kartu, menampilkan, atau menyembunyikan widget dasbor.",
        badge: "Admin",
      },
      {
        step: 5,
        name: "Export Laporan / Visualisasi",
        icon: Download,
        location: "Header Widget",
        description: "Mengunduh data ringkasan analitik ke format spreadsheet atau gambar grafik.",
      },
    ],
    tips: [
      "Perhatikan grafik korelasi PAX: jika penumpang naik drastis namun konsumsi per PAX turun, sistem beroperasi secara efisien.",
      "Garis Confidence Interval (Batas Aman AI) menunjukkan toleransi deviasi konsumsi wajar.",
    ],
  },

  // 2. INPUT DATA
  {
    route: "/enter-data",
    title: "Input Data & Pencatatan Konsumsi",
    subtitle: "Pencatatan angka meteran harian, sounding tangki BBM, dan volume penumpang",
    icon: FilePenLine,
    overview:
      "Halaman ini digunakan oleh teknisi lapangan untuk mencatat angka pembacaan meter (*Stand Meter*) harian. Sistem dilengkapi proteksi race condition, fitur salin angka terakhir, serta rekomendasi tanggal otomatis H+1.",
    targetUsers: "Teknisi Lapangan, Admin Operasional, Super Admin",
    workflow: [
      {
        stepNumber: 1,
        title: "Pilih Kategori Energi",
        instruction:
          "Pilih kartu kategori energi yang akan diinput (Listrik PLN, Air Bersih, Bahan Bakar BBM, atau Data Penumpang PAX).",
        recommendedAction: "Klik tombol 'Catat Angka Meter' pada kartu energi terkait.",
      },
      {
        stepNumber: 2,
        title: "Pilih Meteran & Cek Tanggal",
        instruction:
          "Pilih nama meteran yang akan dicatat angkanya. Sistem secara cerdas menyetel tanggal ke Tanggal Terakhir + 1 Hari (H+1).",
        recommendedAction: "Pastikan tanggal sesuai dengan tanggal fisik pencatatan.",
      },
      {
        stepNumber: 3,
        title: "Salin & Masukkan Angka Stand Terkini",
        instruction:
          "Gunakan tombol 'Salin Stand' atau 'Salin Semua Stand Terakhir' untuk menyalin angka sebelumnya, lalu edit digit akhir yang bertambah.",
        recommendedAction:
          "Pastikan angka stand tidak lebih kecil dari stand hari sebelumnya (kecuali terjadi rollover).",
      },
      {
        stepNumber: 4,
        title: "Konfirmasi & Simpan Pembacaan",
        instruction: "Klik tombol 'Konfirmasi & Simpan Pembacaan' di bagian bawah modal.",
        recommendedAction: "Sistem otomatis menghitung konsumsi harian dan mencatat ke log audit.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Pilih Meteran",
        icon: Gauge,
        location: "Dropdown Formulir Bagian Atas",
        description: "Memilih perangkat meter fisik yang akan dicatat pembacaannya.",
      },
      {
        step: 2,
        name: "Tanggal Pencatatan (✨ Rekomendasi H+1)",
        icon: Clock,
        location: "Date Picker Formulir",
        description:
          "Memilih tanggal sesi pembacaan. Otomatis disetel ke H+1 dari tanggal log terakhir meteran.",
        badge: "Otomatis",
      },
      {
        step: 3,
        name: "Salin Semua Stand Terakhir",
        icon: Copy,
        location: "Header Seksi Angka Meteran",
        description:
          "Menyalin seluruh riwayat nilai stand terakhir ke semua baris parameter bacaan secara batch.",
        badge: "Batch",
      },
      {
        step: 4,
        name: "Salin Stand (Per Baris)",
        icon: ClipboardPaste,
        location: "Samping Input Angka Meter",
        description:
          "Menyalin nilai angka stand pembacaan sebelumnya ke baris input yang bersangkutan.",
      },
      {
        step: 5,
        name: "Tambah Parameter Bacaan",
        icon: Plus,
        location: "Bawah Daftar Input Nilai",
        description:
          "Menambahkan baris parameter bacaan tambahan jika meter memiliki multi-sensor (misal WBP & LWBP).",
      },
      {
        step: 6,
        name: "Konfirmasi & Simpan Pembacaan",
        icon: Save,
        location: "Footer Bawah Modal",
        description:
          "Memvalidasi dan menyimpan sesi pencatatan ke database dengan proteksi anti double-submission.",
        impact: "Memicu kalkulasi konsumsi harian & formula engine otomatis",
      },
    ],
    tips: [
      "Jika Anda memasukkan tanggal yang sudah ada datanya, sistem akan menolak untuk mencegah duplikasi. Gunakan menu Edit jika ingin memperbaiki.",
      "Setelah data disimpan, konsumsi harian otomatis terhitung dan tercatat di Log Audit.",
    ],
  },

  // 3. REKAP KONSUMSI
  {
    route: "/recap-data",
    title: "Riwayat & Rekapitulasi Konsumsi",
    subtitle: "Tabel rekapitulasi data agregasi konsumsi harian, bulanan, dan histori biaya",
    icon: BarChart3,
    overview:
      "Modul Rekapitulasi Konsumsi menyajikan tabel data hasil komputasi harian dari seluruh meter. Anda dapat melakukan filtering multi-kolom, membandingkan pemakaian antar-lokasi, dan mengekspor rekap laporan bulanan.",
    targetUsers: "Admin, Super Admin, Teknisi, Auditor",
    workflow: [
      {
        stepNumber: 1,
        title: "Tentukan Periode Rentang Tanggal",
        instruction: "Tentukan rentang tanggal yang ingin dianalisis (misal: 1 bulan berjalan).",
      },
      {
        stepNumber: 2,
        title: "Terapkan Filter Entitas / Meter",
        instruction: "Filter berdasarkan Jenis Energi atau Meter tertentu jika diperlukan.",
      },
      {
        stepNumber: 3,
        title: "Analisis Breakdown Konsumsi",
        instruction:
          "Klik baris data untuk melihat rincian breakdown kalkulasi (Main usage, suhu, biaya).",
      },
      {
        stepNumber: 4,
        title: "Ekspor Laporan Resmi",
        instruction:
          "Ekspor data ke file Excel untuk kebutuhan pelaporan audit atau billing penyewa.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Rentang Tanggal (Date Range Filter)",
        icon: Clock,
        location: "Toolbar Atas",
        description: "Memilih tanggal awal dan tanggal akhir rekapitulasi data.",
      },
      {
        step: 2,
        name: "Filter Jenis Energi / Meter",
        icon: Filter,
        location: "Toolbar Atas",
        description:
          "Menyaring data rekapitulasi berdasarkan kategori energi atau perangkat meter.",
      },
      {
        step: 3,
        name: "Export Excel / CSV",
        icon: Download,
        location: "Pojok Kanan Atas",
        description:
          "Mengunduh seluruh baris rekapitulasi yang terfilter ke file format Spreadsheet.",
      },
      {
        step: 4,
        name: "Hitung Ulang (Recalculate Summary)",
        icon: RotateCcw,
        location: "Menu Aksi Baris / Toolbar",
        description:
          "Memicu ulang formula engine untuk meregenerasi ringkasan harian jika ada perubahan tarif atau rumus.",
        badge: "Admin",
      },
    ],
    tips: [
      "Gunakan fitur pencarian untuk menemukan tanggal atau nama meter tertentu secara instan.",
    ],
  },

  // 4. REKAP PENCATATAN
  {
    route: "/recap-reading",
    title: "Riwayat Sesi Pembacaan Stand",
    subtitle: "Daftar entri data mentah stand meter lapangan beserta jejak petugas pencatat",
    icon: BookOpen,
    overview:
      "Modul ini menyimpan rekaman murni angka stand meter (*Reading Sessions*) yang diinput teknisi, lengkap dengan timestamp waktu pencatatan, nama petugas pencatat, catatan lapangan, dan foto bukti meter.",
    targetUsers: "Teknisi, Admin, Auditor",
    workflow: [
      {
        stepNumber: 1,
        title: "Cari Rekaman Log Pembacaan",
        instruction:
          "Gunakan filter tanggal atau kotak pencarian untuk mencari sesi input spesifik.",
      },
      {
        stepNumber: 2,
        title: "Periksa Riwayat & Bukti",
        instruction: "Klik ikon mata untuk melihat detail nilai dan foto bukti fisik meter.",
      },
      {
        stepNumber: 3,
        title: "Koreksi / Edit Pembacaan",
        instruction: "Gunakan tombol 'Edit' pada pembacaan terbaru jika ada salah catat angka.",
      },
      {
        stepNumber: 4,
        title: "Hapus Entri Duplikat / Salah",
        instruction:
          "Gunakan tombol 'Hapus' jika terjadi entri salah (hanya entri paling baru yang diizinkan untuk menjaga konsistensi).",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Cari Pembacaan / Petugas",
        icon: Search,
        location: "Search Bar Toolbar",
        description: "Mencari data berdasarkan nama meter, kode meter, catatan, atau nama petugas.",
      },
      {
        step: 2,
        name: "Lihat Bukti Foto / Detail",
        icon: Eye,
        location: "Kolom Aksi Baris",
        description: "Membuka modal detail bukti foto fisik meteran dan catatan teknisi lapangan.",
      },
      {
        step: 3,
        name: "Edit Pembacaan Stand",
        icon: Edit,
        location: "Kolom Aksi Baris",
        description: "Mengubah nilai angka stand meter yang telah dicatat sebelumnya.",
        impact: "Otomatis menghitung ulang konsumsi hari tersebut dan hari setelahnya",
      },
      {
        step: 4,
        name: "Hapus Pembacaan Stand",
        icon: Trash2,
        location: "Kolom Aksi Baris",
        description:
          "Menghapus sesi pembacaan (hanya diperbolehkan untuk entri paling akhir per meter).",
      },
    ],
    tips: [
      "Setiap perubahan atau penghapusan angka meteran akan otomatis dicatat ke Log Audit Sistem.",
    ],
  },

  // 5. DATA MASTER
  {
    route: "/data-master",
    title: "Manajemen Data Master",
    subtitle: "Konfigurasi inti meter, jenis energi, tarif harga, target efisiensi, dan lokasi",
    icon: Database,
    overview:
      "Pusat konfigurasi seluruh aset dan entitas aplikasi. Data di sini menjadi fondasi utama bagi seluruh perhitungan, visualisasi dasbor, dan laporan anggaran.",
    targetUsers: "Super Admin, Admin Energi",
    workflow: [
      {
        stepNumber: 1,
        title: "Konfigurasi Jenis Energi & Tipe Bacaan",
        instruction:
          "Pastikan master Jenis Energi dan satuan standar (kWh, m3, Liter) sudah terdaftar.",
      },
      {
        stepNumber: 2,
        title: "Daftarkan Entitas Gedung & Tenant",
        instruction:
          "Input master lokasi gedung/ruangan dan data penyewa (*Tenant*) untuk alokasi konsumsi.",
      },
      {
        stepNumber: 3,
        title: "Daftarkan Perangkat Meter",
        instruction:
          "Input data meter fisik, hubungkan dengan Template Formula, dan tentukan profil tangki jika relevan.",
      },
      {
        stepNumber: 4,
        title: "Tetapkan Skema Tarif & Target Efisiensi",
        instruction: "Tentukan Skema Harga PLN/BBM dan batas Target Efisiensi bulanan.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Tab Navigasi Kategori (Aset, Energi, Harga)",
        icon: Layers,
        location: "Sisi Kiri / Atas Halaman",
        description:
          "Berpindah antar manajemen Meter, Jenis Energi, Skema Harga, Entitas, dan Target Efisiensi.",
      },
      {
        step: 2,
        name: "Tambah Data Baru (Meter / Tarif / Target)",
        icon: Plus,
        location: "Pojok Kanan Header",
        description: "Membuka formulir modal untuk mendaftarkan entitas master data baru.",
      },
      {
        step: 3,
        name: "Riwayat Audit Log",
        icon: History,
        location: "Header Seksi / Toolbar",
        description:
          "Membuka riwayat log audit pembuatan, pengeditan, dan penghapusan data master.",
        badge: "Audit",
      },
      {
        step: 4,
        name: "Edit Data Master",
        icon: Edit,
        location: "Kolom Aksi Setiap Baris",
        description:
          "Memperbarui konfigurasi parameter, nama meter, kapasitas tangki, atau tarif harga.",
      },
      {
        step: 5,
        name: "Hapus Data Master",
        icon: Trash2,
        location: "Kolom Aksi Setiap Baris",
        description: "Menghapus data master (dilindungi validasi dependensi transaksi database).",
      },
    ],
    tips: [
      "Pastikan kode meter unik dan mudah dikenali oleh teknisi lapangan.",
      "Profil tangki wajib diisi jika meter digunakan untuk bahan bakar solar atau tangki air.",
    ],
  },

  // 6. FORMULA & KALKULASI ENGINE
  {
    route: "/calculation-templates",
    title: "Formula & Kalkulasi Engine",
    subtitle: "Studio perancangan rumus matematika, stand selisih, dan profiling tangki BBM/Air",
    icon: Calculator,
    overview:
      "Studio pembuat formula matematika mandiri Sentinel V2. Di sini Anda dapat merancang formula komputasi tingkat lanjut menggunakan variabel telemetri sensor (H0/H1), spesifikasi meter/tangki (multiplier, rollover, diameter, kapasitas), dan angka konstanta.",
    targetUsers: "Super Admin, Engineer Energi, System Integrator",
    workflow: [
      {
        stepNumber: 1,
        title: "Buka Studio Formula",
        instruction:
          "Klik tombol 'Buat Formula Baru' untuk membuka Studio Pembuat Rumus Layar Penuh 2 Kolom.",
      },
      {
        stepNumber: 2,
        title: "Gunakan Preset Cepat / Ketik Rumus",
        instruction:
          "Pilih preset standar industri (Stand Selisih, Rollover, Tangki Silinder, Tangki Persegi) untuk memuat rumus siap pakai.",
      },
      {
        stepNumber: 3,
        title: "Daftarkan & Sisipkan Variabel",
        instruction:
          "Tambah variabel baru di panel kiri jika diperlukan, lalu klik '+ NAMA_VARIABEL' untuk menyisipkan ke rumus.",
      },
      {
        stepNumber: 4,
        title: "Uji Coba di Sandbox Simulator",
        instruction:
          "Masukkan angka simulasi pada Sandbox Tester untuk memvalidasi kebenaran hasil evaluasi rumus secara real-time.",
      },
      {
        stepNumber: 5,
        title: "Simpan & Aktifkan Formula",
        instruction:
          "Klik 'Simpan Formula' di pojok kanan atas untuk menyimpan dan menghubungkan ke meteran.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Buat Formula Baru",
        icon: Plus,
        location: "Pojok Kanan Header",
        description: "Membuka studio perancangan formula layar penuh (Studio Canvas 2 Kolom).",
        badge: "Studio",
      },
      {
        step: 2,
        name: "Preset Rumus Industri (Sekali Klik)",
        icon: Sparkles,
        location: "Panel Editor Studio",
        description:
          "Memuat formula siap pakai: Stand Selisih Multiplier, Rollover, Tangki Silinder, Tangki Kotak, dan Rasio Kapasitas.",
        badge: "Rekomendasi",
      },
      {
        step: 3,
        name: "Daftarkan Variabel Baru",
        icon: Variable,
        location: "Panel Kiri Studio",
        description:
          "Mendaftarkan variabel sensor telemetry (H0/H1), spesifikasi fisik tangki/multiplier, atau konstanta statis.",
      },
      {
        step: 4,
        name: "+ [NAMA_VARIABEL] (Sisipkan ke Rumus)",
        icon: Code2,
        location: "Daftar Variabel Aktif",
        description:
          "Menyisipkan nama variabel langsung ke kursor teks ekspresi formula matematika.",
      },
      {
        step: 5,
        name: "Jalankan Simulasi (Sandbox Tester)",
        icon: Play,
        location: "Panel Simulator Bawah",
        description:
          "Mengeksekusi ekspresi matematika dengan angka percontohan untuk memverifikasi kebenaran logika rumus.",
      },
      {
        step: 6,
        name: "Simpan Formula",
        icon: Save,
        location: "Pojok Kanan Atas Studio",
        description: "Menyimpan seluruh konfigurasi sub-rumus dan variabel ke database.",
      },
    ],
    tips: [
      "Gunakan operator standar matematika: +, -, *, /, ^ (pangkat), serta kurung buka-tutup ( ).",
      "Fungsi matematika yang didukung: min(), max(), pow(), dan ternary (a >= b ? x : y).",
    ],
  },

  // 7. ANGGARAN
  {
    route: "/budget",
    title: "Manajemen Anggaran & Finansial",
    subtitle: "Pengaturan plafon anggaran tahunan dan alokasi biaya energi bulanan",
    icon: Wallet,
    overview:
      "Modul Anggaran memungkinkan manajemen menetapkan target biaya energi tahunan dan mendistribusikannya ke masing-masing bulan. Sistem memantau realisasi pengeluaran harian terhadap pagu anggaran untuk mencegah pemborosan biaya.",
    targetUsers: "Super Admin, Finance Manager, Admin Energi",
    workflow: [
      {
        stepNumber: 1,
        title: "Buat Pagu Anggaran Tahunan",
        instruction:
          "Klik 'Tambah Anggaran Tahunan' untuk menetapkan total biaya energi per jenis energi.",
      },
      {
        stepNumber: 2,
        title: "Distribusikan Alokasi Bulanan",
        instruction:
          "Gunakan tombol 'Atur Alokasi Bulanan' dan klik 'Bagi Rata Otomatis' atau atur kuota per bulan.",
      },
      {
        stepNumber: 3,
        title: "Pantau Realisasi Biaya",
        instruction:
          "Tinjau status deviasi pengeluaran aktual terhadap alokasi bulanan (Aman, Waspada, Over Budget).",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Tambah Anggaran Tahunan",
        icon: Plus,
        location: "Pojok Kanan Header",
        description: "Membuat plafon anggaran total tahunan untuk jenis energi tertentu.",
      },
      {
        step: 2,
        name: "Atur Alokasi Bulanan",
        icon: SlidersHorizontal,
        location: "Kartu Anggaran",
        description: "Membuka modal pembagian alokasi dana ke 12 bulan kalender.",
      },
      {
        step: 3,
        name: "Bagi Rata Otomatis (Distribute Evenly)",
        icon: Sparkles,
        location: "Modal Alokasi Bulanan",
        description:
          "Membagi total anggaran tahunan secara merata (dibagi 12 bulan) dalam satu klik.",
      },
      {
        step: 4,
        name: "Filter Tahun Anggaran",
        icon: Clock,
        location: "Toolbar Filter",
        description: "Memilih tahun anggaran fiskal yang ingin ditinjau.",
      },
    ],
    tips: [
      "Indikator status akan berubah menjadi 'Waspada' jika realisasi mencapai 85% dari alokasi bulanan.",
    ],
  },

  // 8. KONFIGURASI TATA LETAK DASBOR
  {
    route: "/dashboard-config",
    title: "Konfigurasi Tata Letak Dasbor",
    subtitle: "Kustomisasi urutan kartu, visibilitas widget, dan personalisasi visual",
    icon: LayoutTemplate,
    overview:
      "Modul untuk mengatur tata letak komponen widget pada halaman Dasbor utama. SuperAdmin dan Admin dapat menyusun urutan kartu ringkasan, mengaktifkan atau menonaktifkan grafik analitik, dan mereset ke tata letak default.",
    targetUsers: "Super Admin, Admin",
    workflow: [
      {
        stepNumber: 1,
        title: "Tinjau Daftar Widget Aktif",
        instruction: "Periksa daftar kartu KPI dan grafik yang saat ini tampil di Dasbor utama.",
      },
      {
        stepNumber: 2,
        title: "Ubah Urutan / Drag & Drop",
        instruction:
          "Geser kartu ke atas atau ke bawah untuk menentukan posisi prioritas tampilan.",
      },
      {
        stepNumber: 3,
        title: "Sembunyikan / Tampilkan Widget",
        instruction:
          "Gunakan sakelar tombol visibilitas untuk menyembunyikan grafik yang tidak diperlukan.",
      },
      {
        stepNumber: 4,
        title: "Simpan Tata Letak",
        instruction:
          "Klik 'Simpan Konfigurasi Tata Letak' untuk menerapkan perubahan ke seluruh pengguna.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Toggle Visibilitas Widget (Switch)",
        icon: Eye,
        location: "Kartu Setiap Widget",
        description: "Mengaktifkan atau menyembunyikan komponen widget dari halaman Dasbor.",
      },
      {
        step: 2,
        name: "Geser Urutan (Reorder)",
        icon: SlidersHorizontal,
        location: "Handle Drag Kartu",
        description: "Mengubah urutan posisi tampilan kartu pada grid Dasbor.",
      },
      {
        step: 3,
        name: "Reset ke Tata Letak Default",
        icon: RotateCcw,
        location: "Pojok Kanan Toolbar",
        description:
          "Mengembalikan seluruh posisi dan visibilitas kartu ke susunan standar pabrik.",
      },
      {
        step: 4,
        name: "Simpan Susunan Layout",
        icon: Save,
        location: "Pojok Kanan Header",
        description: "Menyimpan preferensi konfigurasi tata letak ke database.",
      },
    ],
    tips: [
      "Letakkan kartu KPI utama di baris paling atas agar metrik penting langsung terlihat saat membuka Dasbor.",
    ],
  },

  // 9. KONFIGURASI GLOBAL SISTEM & MAINTENANCE
  {
    route: "/system-config",
    title: "Konfigurasi Global Sistem & Maintenance",
    subtitle:
      "Pengaturan profil environment (Dev/Prod), kunci UploadThing, dan sinkronisasi paket data",
    icon: SlidersHorizontal,
    overview:
      "Pusat kendali pengaturan tingkat sistem Sentinel V2. Mengelola profil lingkungan aktif (Development vs Production), endpoint API Backend & Machine Learning, kunci otentikasi UploadThing, telemetri cuaca bandara, serta fitur ekspor-impor paket data master untuk pemeliharaan server.",
    targetUsers: "Super Admin, System Administrator",
    workflow: [
      {
        stepNumber: 1,
        title: "Pilih Lingkungan Aktif (Dev / Prod)",
        instruction:
          "Tentukan apakah sistem saat ini berjalan pada mode Development lokal atau Production live.",
      },
      {
        stepNumber: 2,
        title: "Konfigurasi & Uji Endpoint",
        instruction:
          "Periksa URL Backend dan ML Service, lalu klik tombol 'Uji Koneksi' untuk memastikan server merespons.",
      },
      {
        stepNumber: 3,
        title: "Atur Kunci UploadThing & Cuaca",
        instruction:
          "Lengkapi UploadThing App ID, Secret Key, Token Base64, dan OpenWeather API Key mengikuti panduan di bawah field.",
      },
      {
        stepNumber: 4,
        title: "Gunakan Ekspor / Impor Paket untuk Maintenance",
        instruction:
          "Gunakan tombol 'Ekspor Paket' untuk backup data master, atau 'Impor Paket' untuk menyinkronkan data antar-lingkungan.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Ekspor Paket (JSON)",
        icon: Download,
        location: "Header Kanan Atas",
        description:
          "Mengunduh paket utuh seluruh data master, tangki, rumus, dan tarif ke file sentinel_master_package_*.json.",
        badge: "Backup",
      },
      {
        step: 2,
        name: "Impor Paket (Dev ↔ Prod)",
        icon: ArrowDownUp,
        location: "Header Kanan Atas",
        description:
          "Membuka modal untuk mengunggah dan menyinkronkan paket data master antar-environment.",
        badge: "Sync",
      },
      {
        step: 3,
        name: "Pilih Lingkungan Aktif (Radio Switcher)",
        icon: Radio,
        location: "Tab Profil Dev & Prod",
        description:
          "Mengalihkan profil target API antara Development (Port 8080/8000) dan Production HTTPS.",
      },
      {
        step: 4,
        name: "Uji Koneksi ML (Test Endpoint)",
        icon: Activity,
        location: "Kartu Profil Endpoints",
        description: "Mengirim request ping health-check ke microservice Machine Learning FastAPI.",
      },
      {
        step: 5,
        name: "Uji Koneksi Cuaca & Ambil Suhu",
        icon: CloudSun,
        location: "Tab Cuaca Bandara",
        description:
          "Memverifikasi validitas OpenWeather API Key dan mengambil temperatur udara terkini.",
      },
      {
        step: 6,
        name: "Simpan Konfigurasi",
        icon: Save,
        location: "Header Kanan Atas",
        description: "Menyimpan seluruh konfigurasi global ke database dan fallback config file.",
      },
    ],
    tips: [
      "Gunakan mode 'Merge & Upsert' saat impor agar data master yang sudah ada diperbarui tanpa menghapus data lain.",
      "Gunakan tombol reveal (ikon mata) untuk memeriksa token rahasia sebelum disimpan.",
    ],
  },

  // 10. SERVER MONITORING
  {
    route: "/server-monitoring",
    title: "Monitoring Server & Diagnostik Dev",
    subtitle:
      "Pemantauan health server real-time, console log circular buffer, dan query inspector",
    icon: Activity,
    overview:
      "Modul pemantauan server standar industri Sentinel V2. Menampilkan metrik kesehatan sistem (CPU, RAM Heap, Uptime, Database Pool), konsol log interaktif, serta inspector untuk men-debug request, response payload, dan error stack trace.",
    targetUsers: "Super Admin, Developer, System Administrator",
    workflow: [
      {
        stepNumber: 1,
        title: "Pantau Kartu Health Metrik",
        instruction:
          "Periksa status CPU, RAM Heap Memory, dan koneksi Database di baris kartu teratas.",
      },
      {
        stepNumber: 2,
        title: "Terapkan Filter Level Log",
        instruction:
          "Filter log konsol berdasarkan tingkat keparahan (ERROR, WARN, HTTP, DB, INFO).",
      },
      {
        stepNumber: 3,
        title: "Inspeksi Detail Request / Error",
        instruction:
          "Klik pada baris log untuk membuka Dev Debug Inspector Modal (Request, Response, Error Stack).",
      },
      {
        stepNumber: 4,
        title: "Salin Payload untuk Debugging",
        instruction:
          "Gunakan tombol Salin URL, Salin Body, atau Salin Stack Trace untuk pelaporan perbaikan.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Filter Level Log (ERROR / WARN / HTTP / DB / INFO)",
        icon: Filter,
        location: "Toolbar Console Log",
        description:
          "Menyaring konsol agar hanya menampilkan log dengan tingkat keparahan atau kategori tertentu.",
      },
      {
        step: 2,
        name: "Interval Auto-Refresh (1s / 3s / 5s / 10s)",
        icon: Clock,
        location: "Toolbar Console Log",
        description:
          "Mengatur frekuensi polling pembaruan data memori circular buffer server secara otomatis.",
      },
      {
        step: 3,
        name: "Klik Baris Log (Buka Inspector Modal)",
        icon: Eye,
        location: "Setiap Baris Log di Console",
        description:
          "Membuka modal detail inspektur untuk melihat Request Body, Headers, Response JSON, dan Error Stack Trace.",
        badge: "Inspector",
      },
      {
        step: 4,
        name: "Salin Payload / Stack Trace / URL",
        icon: Copy,
        location: "Di dalam Inspector Modal",
        description:
          "Menyalin data JSON request, response, atau error stack trace ke clipboard untuk analisis bug.",
      },
    ],
    tips: [
      "Log database query (DB) mencatat seluruh query mutasi yang dieksekusi Prisma ORM.",
      "Ukuran modal inspector ekstra luas memastikan query panjang dan JSON bertingkat tidak terpotong.",
    ],
  },

  // 11. LOG AUDIT SISTEM
  {
    route: "/audit-logs",
    title: "Log Audit Sistem & Jejak Keamanan",
    subtitle:
      "Pencatatan riwayat perubahan data (Create, Update, Delete) dan perbandingan JSON Diff",
    icon: ShieldCheck,
    overview:
      "Modul Audit Trail Sentinel V2 mencatat setiap perubahan data penting (pencatatan meter, formula, tarif, user) lengkap dengan identitas pengguna, IP address, waktu, serta modal perbandingan visual nilai sebelum dan sesudah diubah (*Side-by-Side Diff*).",
    targetUsers: "Super Admin, Auditor Kepatuhan, IT Security",
    workflow: [
      {
        stepNumber: 1,
        title: "Pilih Filter Entitas Data",
        instruction:
          "Saring tabel audit berdasarkan entitas model (ReadingSession, Meter, CalculationTemplate).",
      },
      {
        stepNumber: 2,
        title: "Pilih Filter Aksi & Tanggal",
        instruction: "Tentukan jenis aksi (CREATE, UPDATE, DELETE) dan rentang tanggal peristiwa.",
      },
      {
        stepNumber: 3,
        title: "Buka Side-by-Side Diff Inspector",
        instruction:
          "Klik tombol 'Lihat Diff / Detail Nilai' pada baris audit untuk membandingkan nilai lama vs baru.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Filter Entitas Data",
        icon: Database,
        location: "Toolbar Filter Atas",
        description:
          "Menyaring tabel audit berdasarkan model database (ReadingSession, Meter, PriceScheme, dll.).",
      },
      {
        step: 2,
        name: "Filter Aksi (CREATE / UPDATE / DELETE)",
        icon: SlidersHorizontal,
        location: "Toolbar Filter Atas",
        description: "Menyaring log berdasarkan jenis manipulasi data yang dilakukan.",
      },
      {
        step: 3,
        name: "Lihat Diff / Detail Nilai",
        icon: Eye,
        location: "Kolom Aksi Setiap Baris Audit",
        description:
          "Membuka modal perbandingan visual berdampingan (Side-by-Side Diff Inspector) untuk melihat perubahan data rinci.",
        badge: "Diff Inspector",
      },
      {
        step: 4,
        name: "Salin Nilai JSON (Old / New Values)",
        icon: Copy,
        location: "Di dalam Diff Inspector Modal",
        description: "Menyalin payload JSON nilai lama atau nilai baru ke clipboard.",
      },
    ],
    tips: [
      "Garis teks berwarna hijau pada diff menandakan penambahan nilai baru, sedangkan warna merah menandakan nilai yang diganti/dihapus.",
    ],
  },

  // 12. PENGADUAN BUG & DEVELOPER LOG
  {
    route: "/bug-reports",
    title: "Laporan Bug & Pengaduan Developer",
    subtitle: "Pusat penanganan bug, pelacakan kendala teknis, dan catatan resolusi tim pengembang",
    icon: Bug,
    overview:
      "Modul pelacakan bug terintegrasi Sentinel V2. Memungkinkan teknisi dan pengguna mengirimkan laporan error lengkap dengan tangkapan layar UploadThing, metadata browser, dan kode console error, sementara SuperAdmin dapat mengubah status dan memberikan solusi developer.",
    targetUsers: "Super Admin, Developer, Seluruh Pengguna",
    workflow: [
      {
        stepNumber: 1,
        title: "Tinjau Ringkasan Kartu Masalah",
        instruction:
          "Pantau jumlah laporan Baru (OPEN), Sedang Dikerjakan (IN_PROGRESS), dan Selesai (RESOLVED).",
      },
      {
        stepNumber: 2,
        title: "Filter & Cari Laporan Spesifik",
        instruction:
          "Gunakan filter tingkat keparahan (Critical, High, Medium, Low) atau kotak pencarian.",
      },
      {
        stepNumber: 3,
        title: "Inspeksi Detail & Error Stack",
        instruction:
          "Klik 'Inspeksi & Tanggapi' untuk melihat tangkapan layar, halaman kejadian, dan stack trace error.",
      },
      {
        stepNumber: 4,
        title: "Perbarui Status & Berikan Catatan Solusi",
        instruction:
          "Ubah status laporan dan tuliskan tindak lanjut developer, lalu klik 'Simpan Status & Tanggapan'.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Filter Status & Urgensi",
        icon: Filter,
        location: "Toolbar Filter",
        description:
          "Menyaring daftar laporan berdasarkan status penyelesaian atau tingkat keparahan bug.",
      },
      {
        step: 2,
        name: "Inspeksi & Tanggapi",
        icon: Eye,
        location: "Kolom Aksi Setiap Laporan",
        description:
          "Membuka modal detail inspektur untuk melihat bukti screenshot, hardware info, dan merespons laporan.",
        badge: "Inspector",
      },
      {
        step: 3,
        name: "Salin Error Stack / JSON",
        icon: Copy,
        location: "Di dalam Inspector Modal",
        description:
          "Menyalin kode trace error atau metadata peramban ke clipboard untuk analisis kode.",
      },
      {
        step: 4,
        name: "Simpan Status & Tanggapan Developer",
        icon: Save,
        location: "Footer Modal Inspektur",
        description:
          "Menyimpan pembaruan status bug dan pesan solusi yang dapat dibaca oleh pengguna.",
      },
      {
        step: 5,
        name: "Hapus Laporan",
        icon: Trash2,
        location: "Kolom Aksi Baris",
        description: "Menghapus entri laporan bug dari sistem.",
      },
    ],
    tips: [
      "Setiap pengaduan yang dikirim otomatis dicatat ke Server Logger untuk pemantauan developer secara real-time.",
    ],
  },

  // 13. MANAJEMEN PENGGUNA
  {
    route: "/user-management",
    title: "Manajemen Pengguna & Hak Akses Role",
    subtitle: "Pendaftaran akun, penetapan peran (Super Admin/Admin/Teknisi), dan status akses",
    icon: Users,
    overview:
      "Modul untuk mengelola identitas pengguna, hak akses Role-Based Access Control (RBAC), reset kata sandi, serta aktivasi atau penonaktifan akun staf operasional.",
    targetUsers: "Super Admin",
    workflow: [
      {
        stepNumber: 1,
        title: "Daftarkan Pengguna Baru",
        instruction:
          "Klik tombol 'Tambah Pengguna' dan lengkapi username, email, nama lengkap, dan password awal.",
      },
      {
        stepNumber: 2,
        title: "Tetapkan Peran (Role)",
        instruction:
          "Pilih peran yang sesuai (SUPER_ADMIN, ADMIN, atau TECHNICIAN) sesuai wewenang operasional.",
      },
      {
        stepNumber: 3,
        title: "Kelola Status Akun",
        instruction:
          "Gunakan tombol edit untuk mengubah data atau menonaktifkan akun staf yang telah mutasi.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Tambah Pengguna Baru",
        icon: UserPlus,
        location: "Pojok Kanan Header",
        description: "Membuka formulir modal pendaftaran akun pengguna baru.",
      },
      {
        step: 2,
        name: "Edit Akun & Peran",
        icon: Edit,
        location: "Kolom Aksi Baris",
        description:
          "Memperbarui nama, email, hak akses peran (*Role*), atau status keaktifan akun.",
      },
      {
        step: 3,
        name: "Reset Password",
        icon: KeyRound,
        location: "Kolom Aksi Baris",
        description: "Mengatur ulang kata sandi pengguna ke kata sandi baru.",
      },
      {
        step: 4,
        name: "Hapus Akun",
        icon: Trash2,
        location: "Kolom Aksi Baris",
        description: "Menghapus akun pengguna dari database.",
      },
    ],
    tips: [
      "Peran SUPER_ADMIN memiliki akses penuh ke seluruh modul sistem termasuk konfigurasi server dan user management.",
    ],
  },

  // 14. PENGATURAN PROFIL
  {
    route: "/profile",
    title: "Pengaturan Akun & Profil Pengguna",
    subtitle: "Pengelolaan identitas akun, foto profil, dan pembaruan kata sandi pribadi",
    icon: CircleUserRound,
    overview:
      "Halaman profil pribadi setiap pengguna. Anda dapat memperbarui informasi nama lengkap, email, mengunggah foto profil menggunakan UploadThing, serta mengganti kata sandi login.",
    targetUsers: "Seluruh Pengguna",
    workflow: [
      {
        stepNumber: 1,
        title: "Perbarui Informasi Pribadi",
        instruction: "Ubah nama lengkap atau email kontak pada formulir profil.",
      },
      {
        stepNumber: 2,
        title: "Unggah Foto Profil",
        instruction: "Gunakan dropzone UploadThing untuk memilih foto profil baru Anda.",
      },
      {
        stepNumber: 3,
        title: "Ganti Kata Sandi Berkala",
        instruction: "Masukkan kata sandi lama dan kata sandi baru untuk menjaga keamanan akun.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Unggah Foto Profil (UploadThing)",
        icon: Upload,
        location: "Kartu Avatar Profil",
        description: "Memilih dan mengunggah foto profil baru ke penyimpanan awan UploadThing.",
      },
      {
        step: 2,
        name: "Simpan Perubahan Profil",
        icon: Save,
        location: "Bawah Formulir Biodata",
        description: "Menyimpan pembaruan nama lengkap dan informasi profil.",
      },
      {
        step: 3,
        name: "Perbarui Kata Sandi",
        icon: Lock,
        location: "Bawah Formulir Keamanan",
        description: "Memvalidasi kata sandi lama dan menyimpan kata sandi baru.",
      },
    ],
    tips: [
      "Gunakan kombinasi kata sandi yang kuat (huruf besar, angka, dan simbol) untuk mengamankan akun.",
    ],
  },

  // 15. FAQ & PUSAT BANTUAN
  {
    route: "/faq",
    title: "Pusat Bantuan & FAQ",
    subtitle: "Dokumentasi komprehensif panduan operasional dan tanya-jawab seluruh modul",
    icon: HelpCircle,
    overview:
      "Halaman panduan dan dokumentasi resmi seluruh fitur Sentinel V2. Pengguna dapat mencari jawaban teknis, mempelajari alur kerja, dan memahami rumus komputasi energi.",
    targetUsers: "Seluruh Pengguna (Teknisi, Admin, Super Admin)",
    workflow: [
      {
        stepNumber: 1,
        title: "Cari Topik Bantuan",
        instruction:
          "Ketik kata kunci pada Search Bar untuk mencari pertanyaan atau topik spesifik.",
      },
      {
        stepNumber: 2,
        title: "Filter Kategori Modul",
        instruction: "Klik tab kategori untuk memilah pertanyaan per modul sistem.",
      },
      {
        stepNumber: 3,
        title: "Buka Penjelasan & Akses Pintas",
        instruction:
          "Buka accordion jawaban dan klik tautan tombol untuk langsung menuju menu terkait.",
      },
    ],
    buttons: [
      {
        step: 1,
        name: "Search Bar Bantuan",
        icon: Search,
        location: "Hero Banner Atas",
        description:
          "Mencari topik bantuan secara instan berdasarkan judul, penjelasan, atau tagar.",
      },
      {
        step: 2,
        name: "Filter Kategori Modul",
        icon: Layers,
        location: "Pills Toolbar",
        description: "Menyaring daftar pertanyaan berdasarkan modul Sentinel V2.",
      },
      {
        step: 3,
        name: "Buka / Tutup Accordion Pertanyaan",
        icon: HelpCircle,
        location: "Daftar FAQ",
        description: "Membuka isi jawaban dan rincian penjelasan topik.",
      },
      {
        step: 4,
        name: "Tautan Langsung Modul (Buka Menu Terkait)",
        icon: ArrowRight,
        location: "Footer Setiap Jawaban FAQ",
        description:
          "Tombol pintas untuk langsung bernavigasi ke halaman modul yang sedang dibahas.",
      },
    ],
    tips: [
      "Gunakan tombol pintas panduan '💡 Panduan Menu' di sudut kanan bawah pada setiap halaman untuk panduan kontekstual instan.",
    ],
  },
];

export const UniversalPageGuideModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchButtonQuery, setSearchButtonQuery] = useState("");
  const pathname = usePathname();

  // Temukan panduan yang paling presisi dengan route saat ini (Sorted by longest route match)
  const currentGuide = useMemo(() => {
    if (!pathname) return PAGE_GUIDES[0];
    if (pathname === "/")
      return PAGE_GUIDES.find((g) => g.route === "/dashboard") || PAGE_GUIDES[0];

    // Sort by longest route first so /dashboard-config matches before /dashboard
    const sortedGuides = [...PAGE_GUIDES].sort((a, b) => b.route.length - a.route.length);
    const matched = sortedGuides.find((g) => pathname.startsWith(g.route));

    return matched || PAGE_GUIDES[0];
  }, [pathname]);

  // Shortcut keyboard: Tekan '?' (Shift + /) untuk membuka panduan halaman ini
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredButtons = useMemo(() => {
    if (!currentGuide) return [];
    if (!searchButtonQuery.trim()) return currentGuide.buttons;

    const q = searchButtonQuery.toLowerCase().trim();
    return currentGuide.buttons.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.badge && b.badge.toLowerCase().includes(q))
    );
  }, [currentGuide, searchButtonQuery]);

  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const CurrentIcon = currentGuide?.icon || HelpCircle;

  return (
    <>
      {/* FLOATING TRIGGER BUTTONS DOCK (STANDAR SENTINEL STYLE) */}
      <div className="fixed right-5 bottom-5 z-40 flex items-center gap-2">
        {/* Tombol Laporkan Bug ke Developer */}
        <Button
          type="button"
          onClick={() => setIsBugModalOpen(true)}
          className="h-10 gap-1.5 rounded-full border border-red-400/40 bg-red-600 px-3.5 text-xs font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700"
          title="Laporkan Bug / Error ke Developer"
        >
          <Bug className="h-4 w-4 text-white" />
          <span className="hidden font-semibold md:inline">Lapor Bug</span>
        </Button>

        {/* Tombol Panduan Menu Ini */}
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-card text-foreground hover:bg-muted border-border/80 h-10 gap-2 rounded-full border px-4 text-xs font-bold shadow-lg transition-all hover:scale-105"
          title="Buka Panduan & Urutan Tombol Menu Ini (Tekan '?')"
        >
          <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          <Lightbulb className="text-primary h-4 w-4" />
          <span className="hidden font-semibold sm:inline">Panduan Menu</span>
          <Badge
            variant="outline"
            className="bg-muted/60 border-border px-1.5 py-0 font-mono text-[10px]"
          >
            ?
          </Badge>
        </Button>
      </div>

      {/* BUG REPORT MODAL */}
      <BugReportModal open={isBugModalOpen} onOpenChange={setIsBugModalOpen} />

      {/* UNIVERSAL PAGE GUIDE MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          maxWidth="4xl"
          className="bg-card text-card-foreground border-border/60 flex max-h-[92vh] w-[96vw] flex-col overflow-hidden p-6 sm:max-w-5xl"
        >
          {/* Header */}
          <DialogHeader className="border-border/50 shrink-0 border-b pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="bg-primary/10 text-primary border-primary/20 shrink-0 rounded-2xl border p-2.5">
                  <CurrentIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/30 font-mono text-[10px]"
                    >
                      ROUTE: {pathname}
                    </Badge>
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold">
                      Panduan Interaktif
                    </Badge>
                  </div>
                  <DialogTitle className="text-foreground mt-0.5 text-lg font-bold">
                    {currentGuide.title}
                  </DialogTitle>
                </div>
              </div>

              <div className="hidden text-right text-xs sm:block">
                <span className="text-muted-foreground block">
                  Akses Pengguna:{" "}
                  <strong className="text-foreground">{currentGuide.targetUsers}</strong>
                </span>
                <span className="text-muted-foreground text-[11px] italic">
                  Tekan{" "}
                  <kbd className="bg-muted border-border/60 rounded border px-1.5 py-0.5 font-mono">
                    ESC
                  </kbd>{" "}
                  untuk menutup
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Body with Tabs */}
          <div className="max-h-[calc(92vh-120px)] flex-1 overflow-y-auto pt-2 pr-2 text-xs">
            <Tabs defaultValue="workflow" className="w-full space-y-4">
              <TabsList className="bg-muted/60 grid h-10 w-full grid-cols-3 rounded-xl p-1">
                <TabsTrigger
                  value="workflow"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 text-xs font-bold data-[state=active]:shadow-xs"
                >
                  <ListOrdered className="text-primary h-3.5 w-3.5" />
                  Alur Langkah Penggunaan (SOP)
                </TabsTrigger>
                <TabsTrigger
                  value="buttons"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 text-xs font-bold data-[state=active]:shadow-xs"
                >
                  <Zap className="text-primary h-3.5 w-3.5" />
                  Peta Tombol & Urutan Klik ({currentGuide.buttons.length})
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 text-xs font-bold data-[state=active]:shadow-xs"
                >
                  <Info className="text-primary h-3.5 w-3.5" />
                  Ringkasan & Tips Efisiensi
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: ALUR KERJA DENGAN NOMOR LANGKAH JELAS */}
              <TabsContent value="workflow" className="space-y-3 pt-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-foreground flex items-center gap-2 text-xs font-bold">
                      <ListFilter className="text-primary h-4 w-4" />
                      Urutan Langkah demi Langkah:
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      Total {currentGuide.workflow.length} Tahapan
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentGuide.workflow.map((item) => (
                      <div
                        key={item.stepNumber}
                        className="border-border/60 bg-card hover:border-primary/40 space-y-2 rounded-2xl border p-4 shadow-xs transition-all"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Step Number Badge */}
                          <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-xs">
                            {item.stepNumber}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-mono text-[10px] font-bold tracking-wider uppercase">
                                LANGKAH #{item.stepNumber}
                              </span>
                            </div>
                            <h4 className="text-foreground text-sm font-bold">{item.title}</h4>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              {item.instruction}
                            </p>

                            {item.recommendedAction && (
                              <div className="bg-primary/5 border-primary/20 text-primary mt-2 flex items-center gap-2 rounded-lg border p-2 text-[11px] font-medium">
                                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                                <span>Rekomendasi: {item.recommendedAction}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: PETA TOMBOL & URUTAN KLIK */}
              <TabsContent value="buttons" className="space-y-3 pt-1">
                {/* Search Bar Tombol */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 h-3.5 w-3.5" />
                    <Input
                      value={searchButtonQuery}
                      onChange={(e) => setSearchButtonQuery(e.target.value)}
                      placeholder="Cari nama tombol atau fungsi di halaman ini..."
                      className="bg-background border-border/60 h-8 pl-8 text-xs"
                    />
                  </div>
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    Menampilkan {filteredButtons.length} tombol
                  </span>
                </div>

                {/* Grid Daftar Tombol dengan Nomor Urut */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {filteredButtons.map((btn, bIdx) => {
                    const BtnIcon = btn.icon;

                    return (
                      <div
                        key={bIdx}
                        className="border-border/60 bg-card hover:border-primary/50 flex flex-col justify-between space-y-2.5 rounded-2xl border p-4 shadow-xs transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                              {/* Step Badge */}
                              <div className="bg-primary/10 text-primary border-primary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[11px] font-black">
                                {btn.step || bIdx + 1}
                              </div>

                              <div className="bg-muted text-foreground border-border/40 shrink-0 rounded-lg border p-1.5">
                                <BtnIcon className="h-4 w-4" />
                              </div>

                              <span className="text-foreground truncate text-xs leading-snug font-bold">
                                {btn.name}
                              </span>
                            </div>

                            {btn.badge && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 px-1.5 py-0 text-[9px] font-bold"
                              >
                                {btn.badge}
                              </Badge>
                            )}
                          </div>

                          <p className="text-muted-foreground pl-8 text-[11px] leading-relaxed">
                            {btn.description}
                          </p>

                          {btn.impact && (
                            <div className="ml-8 flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 p-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              <Sparkles className="h-3 w-3 shrink-0" />
                              <span>{btn.impact}</span>
                            </div>
                          )}
                        </div>

                        <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t pt-2 pl-8 font-mono text-[10px]">
                          <span>📍 Lokasi: {btn.location}</span>
                          {btn.shortcut && (
                            <span className="bg-muted border-border/60 rounded border px-1.5 py-0.5 font-bold">
                              {btn.shortcut}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 3: RINGKASAN & TIPS */}
              <TabsContent value="overview" className="space-y-3 pt-1">
                <div className="border-border/60 bg-card space-y-2.5 rounded-2xl border p-4 shadow-xs">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <Info className="text-primary h-4 w-4" />
                    Penjelasan Modul:
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {currentGuide.overview}
                  </p>
                </div>

                {currentGuide.tips && currentGuide.tips.length > 0 && (
                  <div className="border-primary/20 bg-primary/5 space-y-2 rounded-2xl border p-4">
                    <span className="text-primary flex items-center gap-1.5 text-xs font-bold">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      Tips & Best Practices Operasional:
                    </span>
                    <ul className="text-muted-foreground list-disc space-y-1.5 pl-4 text-[11px]">
                      {currentGuide.tips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
