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
    <Card className="col-span-12 shadow-md border-none ring-1 ring-border overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30">
        <div className="space-y-1 w-full">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            Health Check: Indeks Efisiensi Harian
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-[200px]">
              {isLoadingMeters ? (
                <Skeleton className="h-8 w-full rounded-md" />
              ) : (
                <Select
                  value={selectedMeterId}
                  onValueChange={setSelectedMeterId}
                  disabled={isLoadingMeters}
                >
                  {/* PERBAIKAN: bg-card agar adaptif */}
                  <SelectTrigger className="text-xs bg-card border-border h-8">
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
                          <Zap className="w-3 h-3 text-amber-500" />
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
                  <SelectTrigger className="text-xs bg-card border-border h-8">
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
            <div className="w-full overflow-x-auto p-2 scrollbar-hide">
              <div className="flex gap-4 min-w-max mx-auto px-2">
                <TooltipProvider>
                  {groupedData.map((month) => (
                    <div key={month.monthName} className="flex flex-col gap-2">
                      {/* Label Bulan */}
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider h-4">
                        {month.monthName}
                      </span>

                      <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                        {/* Spacer untuk offset hari pertama */}
                        {Array.from({ length: month.offset }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="w-2.5 h-2.5" />
                        ))}

                        {/* Render Heatmap Cells */}
                        {isLoadingHeatmap || !selectedMeterId
                          ? Array.from({ length: 30 }).map((_, i) => (
                              <Skeleton
                                key={i}
                                className="w-2.5 h-2.5 rounded-[2px] bg-muted"
                              />
                            ))
                          : month.days.map((day) => (
                              <Tooltip key={day.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      // BASE SHAPE
                                      "w-2.5 h-2.5 rounded-[2px] transition-all cursor-pointer shadow-sm relative",

                                      // PERBAIKAN VISIBILITAS:
                                      // 1. Ring Inset: Memberikan garis tepi halus (10% opacity) agar kotak selalu terlihat
                                      "ring-1 ring-inset ring-black/10 dark:ring-white/20",

                                      // 2. Hover Effect: Pop-up & Ring warna Primary (Cyan)
                                      "hover:ring-2 hover:ring-primary hover:scale-125 hover:z-10",

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
                                      <p className="text-[9px] text-slate-500 font-medium">
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

            <div className="pt-4 mt-2 border-t border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-black text-green-700 dark:text-green-300">
                          {statsSummary.HEMAT}
                        </span>
                      </div>
                      <p className="text-[9px] uppercase font-bold text-green-600/70 dark:text-green-400/70 tracking-wider">
                        Sangat Efisien
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="font-black text-foreground">
                          {statsSummary.NORMAL}
                        </span>
                      </div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                        Normal
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-black text-orange-700 dark:text-orange-300">
                          {statsSummary.WARNING}
                        </span>
                      </div>
                      <p className="text-[9px] uppercase font-bold text-orange-600/70 dark:text-orange-400/70 tracking-wider">
                        Mendekati Limit
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="font-black text-red-700 dark:text-red-300">
                          {statsSummary.BOROS}
                        </span>
                      </div>
                      <p className="text-[9px] uppercase font-bold text-red-600/70 dark:text-red-400/70 tracking-wider">
                        Over Budget
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center mt-4 text-[10px] text-muted-foreground">
                {isLoadingHeatmap ? (
                  <Skeleton className="h-3 w-48 mx-auto" />
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
