"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from "lucide-react";

import { useModernEfficiency } from "../../hooks/useModernEfficiency";

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
    isLoading, // General loading state
    isLoadingMeters,
    isLoadingHeatmap,
  } = useModernEfficiency(selectedMeterId, selectedYear);
  useEffect(() => {
    if (meters.length > 0 && !selectedMeterId) {
      setSelectedMeterId(meters[0].meter_id.toString());
    }
  }, [meters, selectedMeterId]);
  return (
    <Card className="col-span-12 shadow-md border-none ring-1 ring-slate-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
        <div className="space-y-1 w-full">
          <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Health Check: Indeks Efisiensi Harian
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {/* Loading State for Meter Select */}
            <div className="w-[200px]">
              {isLoadingMeters ? (
                <Skeleton className="h-8 w-full rounded-md" />
              ) : (
                <Select
                  value={selectedMeterId}
                  onValueChange={setSelectedMeterId}
                  disabled={isLoadingMeters}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
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
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>{meter.meter_code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Loading State for Year Select */}
            <div className="w-[100px]">
              {isLoadingMeters ? (
                <Skeleton className="h-8 w-full rounded-md" />
              ) : (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
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

      <CardContent>
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-4 min-w-max mx-auto px-2">
            <TooltipProvider>
              {groupedData.map((month) => (
                <div key={month.monthName} className="flex flex-col gap-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider h-4">
                    {month.monthName}
                  </span>

                  <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                    {Array.from({ length: month.offset }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="w-2.5 h-2.5" />
                    ))}

                    {/* Loading State for Heatmap Cells */}
                    {isLoadingHeatmap || !selectedMeterId
                      ? Array.from({ length: 30 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="w-2.5 h-2.5 rounded-[2px]"
                          />
                        ))
                      : month.days.map((day) => (
                          <Tooltip key={day.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-2.5 h-2.5 ${day.color} rounded-[2px] transition-all hover:ring-2 hover:ring-slate-400 hover:scale-125 cursor-pointer shadow-sm`}
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="flex flex-col gap-1 p-2"
                            >
                              <p className="text-[8px] font-bold text-slate-500 uppercase">
                                {day.dateDisplay}
                              </p>
                              <p className="text-xs font-black">{day.status}</p>
                              {day.confidence && (
                                <p className="text-[9px] text-slate-400 font-medium">
                                  AI Confidence: {day.confidence}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>

        <div className="pt-3 mt-1 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Loading State for Stats Cards */}
            {isLoadingHeatmap || !selectedMeterId ? (
              <>
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-black text-green-700">
                      {statsSummary.HEMAT}
                    </span>
                  </div>
                  <p className="text-[8px] uppercase font-bold text-green-600/70 tracking-wider">
                    Hari Sangat Efisien
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span className="font-black text-slate-700">
                      {statsSummary.NORMAL}
                    </span>
                  </div>
                  <p className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">
                    Hari Normal
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-black text-orange-600">
                      {statsSummary.WARNING}
                    </span>
                  </div>
                  <p className="text-[8px] uppercase font-bold text-orange-600/70 tracking-wider">
                    Mendekati Limit
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="font-black text-red-600">
                      {statsSummary.BOROS}
                    </span>
                  </div>
                  <p className="text-[8px] uppercase font-bold text-red-600/70 tracking-wider">
                    Over Budget (Boros)
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-4 text-[8px] text-slate-400">
            {isLoadingHeatmap ? (
              <Skeleton className="h-3 w-48 mx-auto" />
            ) : (
              <>
                Menampilkan data untuk <b>{totalDays - statsSummary.UNKNOWN}</b>{" "}
                hari aktif dari total {totalDays} hari di tahun {selectedYear}.
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
