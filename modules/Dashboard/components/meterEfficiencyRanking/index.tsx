"use client";
import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { downloadElementAsJpg } from "@/utils/exportImage";
import { useMeterEfficiencyRanking } from "../../hooks/useMeterEfficiencyRanking";

export const MeterEfficiencyRanking = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isexporting, setIsExporting] = useState(false);

  const {
    meters: meterData,
    isLoading,
    isError,
    topIssueMeter,
    insightMessage,
    getStatusConfig, // Diexport jika UI butuh akses manual
  } = useMeterEfficiencyRanking();

  if (isError)
    return (
      <Card className="h-full col-span-12 md:col-span-8 border-red-100 bg-red-50">
        <CardContent className="p-6 text-center text-red-600 flex flex-col items-center justify-center h-full gap-2">
          <AlertCircle />
          <p className="text-sm font-medium">
            Gagal memuat ranking efisiensi meteran
          </p>
        </CardContent>
      </Card>
    );

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadElementAsJpg(cardRef, {
        fileName: `Ranking-Efisiensi-${meterData[0]?.code || "unit"}.jpg`,
      });
    } catch (error) {
      // Optional: Munculkan toast error di sini
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card
      ref={cardRef}
      className="h-full flex flex-col shadow-md border-none ring-1 ring-slate-200"
    >
      <CardHeader className="flex-none flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Beban Konsumsi Per Meteran
        </CardTitle>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-2 text-slate-500 hover:text-blue-600"
            title="Download JPG"
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="text-[10px]">JPG</span>
          </Button>

          <Badge variant="outline" className="text-xs font-normal">
            Real-time Sync
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto min-h-0 w-full px-6 pb-6">
        <div className="space-y-6">
          {isLoading
            ? // Loading Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            : meterData.map((meter, idx) => {
                const statusCfg = getStatusConfig(meter.status);
                const isOver = meter.consumption > meter.budget;
                const percentage = Math.min(
                  (meter.consumption / meter.budget) * 100,
                  100
                );

                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {meter.code}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`flex items-center justify-end gap-1 text-sm font-black ${
                            isOver ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {meter.consumption.toLocaleString("id-ID")}{" "}
                          <span className="text-[10px] font-normal text-slate-400">
                            {meter.unit_of_measurement}
                          </span>
                          {isOver && <ArrowUpRight className="w-3 h-3" />}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Limit: {meter.budget.toLocaleString("id-ID")}{" "}
                          {meter.unit_of_measurement}
                        </p>
                      </div>
                    </div>

                    <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${statusCfg.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute top-0 right-0 h-full w-0.5 bg-slate-900 z-10 opacity-20" />
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Dynamic AI-Style Insight Footer (Ikut di dalam scroll) */}
        {!isLoading && topIssueMeter && (
          <div
            className={`mt-8 p-4 rounded-xl border ${
              topIssueMeter.consumption > topIssueMeter.budget
                ? "bg-red-50 border-red-100 text-red-800"
                : "bg-blue-50 border-blue-100 text-blue-800"
            }`}
          >
            <div className="flex gap-3 items-start">
              <TrendingUp className="w-5 h-5 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Analisis Efisiensi
                </p>
                <p className="text-xs leading-relaxed">
                  Meteran <b>{topIssueMeter.code}</b> menunjukkan anomali beban
                  tertinggi.
                  {topIssueMeter.consumption > topIssueMeter.budget
                    ? ` Melampaui budget sebesar ${(
                        (topIssueMeter.consumption / topIssueMeter.budget - 1) *
                        100
                      ).toFixed(1)}%. Disarankan audit segera.`
                    : ` Berjalan efisien di bawah batas limit. Pertahankan pola penggunaan ini.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
