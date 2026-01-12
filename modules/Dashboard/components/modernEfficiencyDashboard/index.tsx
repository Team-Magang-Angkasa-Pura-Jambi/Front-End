"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from "lucide-react";

import { useModernEfficiency } from "../../hooks/useModernEfficiency";
import { ComponentLoader } from "@/common/components/ComponentLoader";
import { cn } from "@/lib/utils";

export const ModernEfficiencyDashboard = () => {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMeterId, setSelectedMeterId] = useState<string>("");

  const {
    meters,
    groupedData,
    statsSummary,
    totalDays,
    isLoading,
    isLoadingMeters,
    isLoadingHeatmap,
  } = useModernEfficiency(selectedMeterId, selectedYear);

  useEffect(() => {
    if (meters.length > 0 && !selectedMeterId) {
      setSelectedMeterId(meters[0].meter_id.toString());
    }
  }, [meters, selectedMeterId]);

  return (
    // PERBAIKAN: Gunakan bg-card dan border-border
    <Card className="ring-border bg-card col-span-12 overflow-hidden border-none shadow-md ring-1">
      <CardHeader className="border-border bg-muted/30 flex flex-row items-center justify-between border-b">
        <div className="w-full space-y-1">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
            Health Check: Indeks Efisiensi Harian
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="max-w-[200px] flex-1">
              {isLoadingMeters ? (
                <Skeleton className="h-8 w-full rounded-md" />
              ) : (
                <Select
                  value={selectedMeterId}
                  onValueChange={setSelectedMeterId}
                  disabled={isLoadingMeters}
                >
                  {/* PERBAIKAN: bg-card agar adaptif */}
                  <SelectTrigger className="bg-card border-border h-8 text-xs">
                    <SelectValue placeholder="Pilih Meteran Listrik" />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem
                        key={meter.meter_id}
                        value={meter.meter_id.toString()}
                        className="text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {/* Icon bisa tetap warnanya jika ingin spesifik, atau gunakan text-primary */}
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span>{meter.meter_code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="w-[100px]">
              {isLoadingMeters ? (
                <Skeleton className="h-8 w-full rounded-md" />
              ) : (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-card border-border h-8 text-xs">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((y) => (
                      <SelectItem
                        key={y}
                        value={y.toString()}
                        className="text-xs"
                      >
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <ComponentLoader />
        ) : (
          <>
            <div className="scrollbar-hide w-full overflow-x-auto p-2">
              <div className="mx-auto flex min-w-max gap-4 px-2">
                <TooltipProvider>
                  {groupedData.map((month) => (
                    <div key={month.monthName} className="flex flex-col gap-2">
                      {/* Label Bulan */}
                      <span className="text-muted-foreground h-4 text-[9px] font-bold tracking-wider uppercase">
                        {month.monthName}
                      </span>

                      <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                        {/* Spacer untuk offset hari pertama */}
                        {Array.from({ length: month.offset }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="h-2.5 w-2.5" />
                        ))}

                        {/* Render Heatmap Cells */}
                        {isLoadingHeatmap || !selectedMeterId
                          ? Array.from({ length: 30 }).map((_, i) => (
                              <Skeleton
                                key={i}
                                className="bg-muted h-2.5 w-2.5 rounded-[2px]"
                              />
                            ))
                          : month.days.map((day) => (
                              <Tooltip key={day.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      // BASE SHAPE
                                      "relative h-2.5 w-2.5 cursor-pointer rounded-[2px] shadow-sm transition-all",

                                      // PERBAIKAN VISIBILITAS:
                                      // 1. Ring Inset: Memberikan garis tepi halus (10% opacity) agar kotak selalu terlihat
                                      "ring-1 ring-black/10 ring-inset dark:ring-white/20",

                                      // 2. Hover Effect: Pop-up & Ring warna Primary (Cyan)
                                      "hover:ring-primary hover:z-10 hover:scale-125 hover:ring-2",

                                      // 3. Warna dari data (pastikan logic di hook menghasilkan warna yang kontras, misal bg-emerald-500 bukan bg-emerald-50)
                                      day.color
                                    )}
                                  />
                                </TooltipTrigger>

                                {/* GUNAKAN COMPONENT TOOLTIP YG SUDAH KITA STYLE SEBELUMNYA */}
                                {/* Hapus className manual (bg-popover dll) agar style 'Tech HUD' gelap otomatis terpakai */}
                                <TooltipContent side="top">
                                  <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                      {day.dateDisplay}
                                    </p>
                                    <p className="text-xs font-bold text-slate-50">
                                      {day.status}
                                    </p>
                                    {day.confidence && (
                                      <p className="text-[9px] font-medium text-slate-500">
                                        AI Confidence: {day.confidence}
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                      </div>
                    </div>
                  ))}
                </TooltipProvider>
              </div>
            </div>

            <div className="border-border mt-2 border-t pt-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {isLoadingHeatmap || !selectedMeterId ? (
                  <>
                    <Skeleton className="h-[72px] w-full rounded-xl" />
                    <Skeleton className="h-[72px] w-full rounded-xl" />
                    <Skeleton className="h-[72px] w-full rounded-xl" />
                    <Skeleton className="h-[72px] w-full rounded-xl" />
                  </>
                ) : (
                  <>
                    {/* Status Cards: Warna semantik tetap (Green/Red) tapi background disesuaikan opacity-nya */}
                    <div className="flex flex-col items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-black text-green-700 dark:text-green-300">
                          {statsSummary.HEMAT}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold tracking-wider text-green-600/70 uppercase dark:text-green-400/70">
                        Sangat Efisien
                      </p>
                    </div>

                    <div className="bg-muted border-border flex flex-col items-center justify-center rounded-xl border p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Activity className="text-muted-foreground h-4 w-4" />
                        <span className="text-foreground font-black">
                          {statsSummary.NORMAL}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                        Normal
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-black text-orange-700 dark:text-orange-300">
                          {statsSummary.WARNING}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold tracking-wider text-orange-600/70 uppercase dark:text-orange-400/70">
                        Mendekati Limit
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="font-black text-red-700 dark:text-red-300">
                          {statsSummary.BOROS}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold tracking-wider text-red-600/70 uppercase dark:text-red-400/70">
                        Over Budget
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="text-muted-foreground mt-4 text-center text-[10px]">
                {isLoadingHeatmap ? (
                  <Skeleton className="mx-auto h-3 w-48" />
                ) : (
                  <>
                    Menampilkan data untuk{" "}
                    <b className="text-foreground">
                      {totalDays - statsSummary.UNKNOWN}
                    </b>{" "}
                    hari aktif dari total {totalDays} hari di tahun{" "}
                    {selectedYear}.
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
