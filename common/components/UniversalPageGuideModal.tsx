"use client";

import { Badge } from "@/common/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { BugReportModal } from "@/modules/BugReport/components/BugReportModal";
import {
  HelpCircle,
  Info,
  Lightbulb,
  ListFilter,
  ListOrdered,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { PageGuidesService } from "@/modules/GuideManagement/services/pageGuides.service";

export const UniversalPageGuideModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchButtonQuery, setSearchButtonQuery] = useState("");
  const pathname = usePathname();

  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        const data = await PageGuidesService.getAll();
        setGuides(data);
      } catch (err) {
        console.error("Failed to load guides:", err);
      }
    };
    loadGuides();
  }, []);

  // Temukan panduan yang paling presisi dengan route saat ini (Sorted by longest route match)
  const currentGuide = useMemo(() => {
    if (guides.length === 0) return null;
    if (!pathname) return guides[0];
    if (pathname === "/")
      return guides.find((g) => g.route === "/dashboard") || guides[0];

    // Sort by longest route first so /dashboard-config matches before /dashboard
    const sortedGuides = [...guides].sort((a, b) => b.route.length - a.route.length);
    const matched = sortedGuides.find((g) => pathname.startsWith(g.route));

    return matched || guides[0];
  }, [pathname, guides]);

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

    // Custom events from FloatingActionGroup
    const handleOpenGuide = () => setIsOpen(true);
    const handleOpenBug = () => setIsBugModalOpen(true);
    window.addEventListener("open-page-guide", handleOpenGuide);
    window.addEventListener("open-bug-report", handleOpenBug);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-page-guide", handleOpenGuide);
      window.removeEventListener("open-bug-report", handleOpenBug);
    };
  }, []);

  const filteredButtons = useMemo(() => {
    if (!currentGuide) return [];
    if (!searchButtonQuery.trim()) return currentGuide.buttons;

    const q = searchButtonQuery.toLowerCase().trim();
    return currentGuide.buttons.filter(
      (b: any) =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.badge && b.badge.toLowerCase().includes(q))
    );
  }, [currentGuide, searchButtonQuery]);

  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const CurrentIcon = currentGuide?.icon_name ? (LucideIcons as any)[currentGuide.icon_name] || HelpCircle : HelpCircle;

  if (!currentGuide) {
    return (
      <BugReportModal open={isBugModalOpen} onOpenChange={setIsBugModalOpen} />
    );
  }

  return (
    <>

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
                  <strong className="text-foreground">{currentGuide.target_users}</strong>
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
                    {currentGuide.workflow.map((item: any) => (
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
                  {filteredButtons.map((btn: any, bIdx: number) => {
                    const BtnIcon = (LucideIcons as any)[btn.icon] || LucideIcons.Info;

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
                          <span>ðŸ“ Lokasi: {btn.location}</span>
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
                      {currentGuide.tips.map((tip: any, tIdx: number) => (
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

