"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { useAuthStore } from "@/stores/authStore";
import { motion, Variants } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Lightbulb,
  LineChart,
  LogIn,
  MessageSquare,
  MonitorCheck,
  Plane,
  PlaneTakeoff,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const internshipTeam = [
  "Insyra Inayah Putri",
  "Nyimas Azzahra Nurssyidahnafisah",
  "Yudriqul Aulia",
  "Anna Febriane Angelica",
  "Muhammad Nofriza",
  "Elfira",
];

export default function SentinelLandingPage() {
  const { user } = useAuthStore();
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-background h-screen w-full overflow-hidden">
      <ScrollArea className="h-full w-full">
        {/* Kontainer konten utama */}
        <div className="text-foreground relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
          {/* Background Blurs Aksen Brand */}
          <div className="bg-primary/5 pointer-events-none absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
          <div className="pointer-events-none absolute right-[-5%] bottom-[-10%] h-[30%] w-[30%] rounded-full bg-[#E5802D]/5 blur-[100px]" />

          <motion.div
            className="relative z-10 mx-auto w-full max-w-6xl space-y-6 pt-12 pb-12"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* =========================================
                SECTION 1: BENTO GRID UTAMA
            ========================================= */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* CELL 1: HERO & LOGIN */}
              <motion.div variants={itemVariants} className="md:col-span-2">
                <Card className="bg-card border-border group relative flex h-full flex-col justify-between overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 flex h-1.5 w-full">
                    <div className="bg-primary h-full w-1/3" />
                    <div className="h-full w-1/3 bg-[#50B848]" />
                    <div className="h-full w-1/3 bg-[#E5802D]" />
                  </div>

                  <CardHeader className="px-8 pt-8 pb-0">
                    <div className="mt-2 mb-8 flex w-full items-start justify-between">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 gap-2 px-3 py-1 font-mono text-[10px] tracking-widest uppercase"
                      >
                        <Activity className="h-3 w-3" />
                        Sistem V2.0
                      </Badge>
                      {user ? (
                        <Link href="/dashboard" passHref>
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 ring-primary/5 hover:ring-primary/10 animate-in fade-in zoom-in gap-2 font-bold shadow-lg ring-4 transition-all duration-500 hover:scale-105">
                            <LayoutDashboard className="h-4 w-4" />
                            Ke Dashboard
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth/login" passHref>
                          <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-foreground/20 ring-foreground/5 hover:ring-foreground/10 animate-in fade-in zoom-in gap-2 font-bold shadow-lg ring-4 transition-all duration-500 hover:scale-105">
                            <LogIn className="h-4 w-4" />
                            Sign In Portal
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div>
                      <h1 className="text-foreground text-4xl leading-tight font-black tracking-tighter sm:text-5xl md:text-6xl">
                        Pantau Energi <br />
                        <span className="text-primary">Secara Real-Time.</span>
                      </h1>
                      <p className="text-muted-foreground mt-4 max-w-[500px] text-sm sm:text-base">
                        Platform manajemen energi cerdas untuk memonitor, menganalisis, dan
                        mengoptimalkan konsumsi listrik serta bahan bakar dengan presisi.
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto px-8 pt-8 pb-8">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={scrollToSection}
                        variant="outline"
                        className="bg-background border-border hover:bg-accent h-11 gap-2 text-sm font-bold"
                      >
                        Pelajari Latar Belakang{" "}
                        <ArrowRight className="text-muted-foreground h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CELL 2: INFORMASI BANDARA & ANIMASI PESAWAT */}
              <motion.div variants={itemVariants}>
                <Card className="bg-primary text-primary-foreground group relative flex h-full flex-col justify-between overflow-hidden border-none shadow-md">
                  <div className="border-primary-foreground/10 absolute -top-10 -right-10 h-40 w-40 rounded-full border-[16px]" />

                  <motion.div
                    className="text-primary-foreground pointer-events-none absolute -bottom-10 -left-10"
                    animate={{
                      x: [-20, 250],
                      y: [80, -150],
                      rotate: [-15, 15],
                      scale: [0.5, 1.5],
                      opacity: [0, 0.15, 0.15, 0],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Plane className="h-32 w-32" />
                  </motion.div>

                  <CardHeader className="relative z-10 px-8 pt-8">
                    <div className="bg-background/20 mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-inner backdrop-blur-sm">
                      <PlaneTakeoff className="text-primary-foreground h-6 w-6" />
                    </div>
                    <CardTitle className="text-primary-foreground text-xl font-bold tracking-tight">
                      InJourney Airports
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80 mt-1 font-medium">
                      Kantor Cabang Bandara Sultan Thaha Jambi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 mt-auto px-8 pt-4 pb-8">
                    <p className="text-primary-foreground/90 text-sm leading-relaxed">
                      Berkomitmen pada operasional yang efisien. Sentinel hadir sebagai inisiatif
                      digitalisasi untuk mendukung pencapaian target penghematan energi.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* =========================================
                SECTION 2: MENGAPA & PANDUAN PENGGUNAAN
            ========================================= */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <motion.div variants={itemVariants}>
                <Card className="bg-card border-border h-full shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Mengapa Sentinel?</CardTitle>
                    <CardDescription>Keunggulan utama sistem</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#50B848]/10 text-[#50B848]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">Akurasi Data</h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Meninggalkan pencatatan manual, meminimalisir kesalahan.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">Efisiensi Operasional</h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Identifikasi pemborosan energi secara presisi.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E5802D]/10 text-[#E5802D]">
                        <LineChart className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">Keputusan Berbasis Data</h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Laporan analitik instan untuk manajemen.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2">
                <Card className="bg-card border-border h-full shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Cara Penggunaan</CardTitle>
                    <CardDescription>Tiga langkah mudah mengelola energi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-3">
                      <div className="relative flex flex-col gap-3">
                        <div className="bg-secondary text-foreground border-border flex h-10 w-10 items-center justify-center rounded-full border font-bold">
                          <Settings className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-bold">1. Konfigurasi</h4>
                          <p className="text-muted-foreground text-xs">
                            Admin mengatur master data meteran, tarif, dan area operasional bandara.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="bg-secondary text-foreground border-border flex h-10 w-10 items-center justify-center rounded-full border font-bold">
                          <ClipboardList className="h-5 w-5 text-[#50B848]" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-bold">2. Input Data</h4>
                          <p className="text-muted-foreground text-xs">
                            Petugas memasukkan angka stand meter secara harian atau berkala.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="bg-secondary text-foreground border-border flex h-10 w-10 items-center justify-center rounded-full border font-bold">
                          <MonitorCheck className="h-5 w-5 text-[#E5802D]" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-bold">3. Monitor & Analisis</h4>
                          <p className="text-muted-foreground text-xs">
                            Sistem memproses data menjadi grafik, tren, dan laporan otomatis.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* =========================================
                SECTION 3: LATAR BELAKANG & TUJUAN
            ========================================= */}
            <motion.div
              ref={sectionRef}
              id="latar-belakang"
              className="grid scroll-mt-24 grid-cols-1 gap-6 md:grid-cols-2"
              variants={itemVariants}
            >
              <Card className="bg-card border-border h-full shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <RefreshCw className="text-primary h-5 w-5" /> Transformasi Digital
                  </CardTitle>
                  <CardDescription>Meninggalkan proses manual yang panjang</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-border relative ml-3 space-y-6 border-l pt-2 pb-2">
                    <div className="relative pl-6">
                      <div className="bg-secondary border-border absolute top-1 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full border">
                        <MessageSquare className="text-muted-foreground h-4 w-4" />
                      </div>
                      <h4 className="text-muted-foreground text-sm font-bold line-through">
                        Masa Lalu (Manual)
                      </h4>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Teknisi melaporkan stand via WhatsApp &rarr; Staf input Excel harian &rarr;
                        Sekretaris membuat rekap pimpinan. Rawan tercecer dan lambat.
                      </p>
                    </div>
                    <div className="relative pl-6">
                      <div className="bg-primary/20 border-primary/30 absolute top-1 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full border">
                        <Zap className="text-primary h-4 w-4" />
                      </div>
                      <h4 className="text-foreground text-sm font-bold">Sekarang (Sentinel)</h4>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Input satu pintu terpusat. Sistem otomatis memproses data, menghasilkan
                        rekap, dan menyajikan metrik <em>real-time</em> tanpa rekonsiliasi manual.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border h-full shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Lightbulb className="h-5 w-5 text-[#E5802D]" /> Tujuan Keputusan
                  </CardTitle>
                  <CardDescription>Fokus pada pengelolaan energi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground mb-4 text-sm">
                    Sistem ini berfungsi sebagai instrumen{" "}
                    <strong>Decision Support System (DSS)</strong> untuk mendukung anjuran Presiden
                    terkait efisiensi.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 border-border flex flex-col gap-2 rounded-lg border p-3">
                      <LineChart className="text-primary h-5 w-5" />
                      <h4 className="text-sm font-bold">Analisis Tren</h4>
                      <p className="text-muted-foreground text-[10px]">
                        Mendeteksi anomali pemborosan sejak dini.
                      </p>
                    </div>
                    <div className="bg-secondary/50 border-border flex flex-col gap-2 rounded-lg border p-3">
                      <ShieldCheck className="h-5 w-5 text-[#50B848]" />
                      <h4 className="text-sm font-bold">Efisiensi Anggaran</h4>
                      <p className="text-muted-foreground text-[10px]">
                        Menekan biaya operasional (OPEX) bandara.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* =========================================
                SECTION 4: FOOTER & SPECIAL THANKS
            ========================================= */}
            <motion.footer variants={itemVariants} className="pt-8">
              <Card className="bg-card/60 border-border overflow-hidden backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
                    <div className="space-y-2 text-center md:text-left">
                      <div className="flex items-center justify-center gap-2 font-bold tracking-tight md:justify-start">
                        <Users className="text-primary h-4 w-4" />
                        <span>Special Thanks & Contributors</span>
                      </div>
                      <p className="text-muted-foreground max-w-md text-xs">
                        Dedikasi dan kontribusi dari <strong>Tim Magang Angkasa Pura Sultan Thaha Jambi 2025</strong> dalam pengembangan dan transformasi digital sistem Sentinel.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 md:max-w-lg md:justify-end">
                      {internshipTeam.map((member) => (
                        <Badge
                          key={member}
                          variant="secondary"
                          className="bg-secondary/80 hover:bg-secondary border-border text-foreground/90 font-medium transition-colors"
                        >
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-border text-muted-foreground mt-6 flex flex-col items-center justify-between gap-2 border-t pt-4 text-[11px] sm:flex-row">
                    <p>© 2025–2026 Sentinel V2. InJourney Airports Bandara Sultan Thaha Jambi.</p>
                    <p className="flex items-center gap-1">
                      Built with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> for Operational Efficiency
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.footer>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}