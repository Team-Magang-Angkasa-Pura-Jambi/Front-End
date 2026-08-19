"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Activity, AlertTriangle, CheckCircle2, XCircle, Zap } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { ComponentLoader } from "@/common/components/ComponentLoader";
import { EmptyData } from "@/common/components/EmptyData";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { cn } from "@/lib/utils";
import { useMeterQuery } from "@/modules/masterData/hooks/useMeterQuery";
import { useModernEfficiency } from "../../hooks/useModernEfficiency";
import { GithubCalendarHeatmap } from "./GithubCalendarHeatmap";
import { useQuery } from "@tanstack/react-query";
import { getDashboardCardConfigApi } from "../../service/visualizations.service";

interface V2StatsSummary {
  SANGAT_EFISIEN: number;
  NORMAL: number;
  MENDEKATI_LIMIT: number;
  OVER_BUDGET: number;
  UNKNOWN: number;
}

export const ModernEfficiencyDashboard = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);

  const { useGetMeters } = useMeterQuery();
  const {
    data: metersResponse,
    isLoading: isLoadingMeters,
    isError: isErrorMeters,
    error: errorMeters,
  } = useGetMeters();

  const rawMeters = useMemo(() => metersResponse?.data?.meter || [], [metersResponse]);

  const { data: configResponse } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
    staleTime: 1000 * 60 * 5,
  });

  const heatmapConfig = (configResponse?.data?.config as any)?.yearly_heatmap;
  const widgetTitle = heatmapConfig?.title || "Health Check: Indeks Efisiensi Harian";

  const meters = useMemo(() => {
    if (heatmapConfig?.meter_ids && heatmapConfig.meter_ids.length > 0) {
      const allowedSet = new Set(heatmapConfig.meter_ids.map(Number));
      const filtered = rawMeters.filter((m) => allowedSet.has(m.meter_id));
      return filtered.length > 0 ? filtered : rawMeters;
    }
    return rawMeters;
  }, [rawMeters, heatmapConfig]);

  useEffect(() => {
    if (meters.length > 0) {
      if (heatmapConfig?.default_meter_id) {
        const found = meters.find((m) => m.meter_id === heatmapConfig.default_meter_id);
        if (found && selectedMeterId !== found.meter_id && selectedMeterId === null) {
          setSelectedMeterId(found.meter_id);
          return;
        }
      }
      if (selectedMeterId === null || !meters.some((m) => m.meter_id === selectedMeterId)) {
        setSelectedMeterId(meters[0].meter_id);
      }
    }
  }, [meters, selectedMeterId, heatmapConfig]);

  const {
    groupedData,
    statsSummary,
    totalDays,
    isLoading: isLoadingHeatmap,
    isError: isErrorHeatmap,
    error: errorHeatmap,
  } = useModernEfficiency(selectedMeterId ?? 0, selectedYear);

  const stats = statsSummary as unknown as V2StatsSummary;

  const isError = isErrorMeters || isErrorHeatmap;
  const error = errorMeters || errorHeatmap;

  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  const isInitializing = isLoadingMeters || (meters.length > 0 && selectedMeterId === null);

  return (
    <Card className="col-span-12 h-full border-none shadow-md ring-1 ring-slate-200 lg:col-span-8">
      <CardHeader className="bg-muted/30 border-border flex flex-row items-center justify-between border-b">
        <div className="w-full space-y-1">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
            {widgetTitle}
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="max-w-[200px] flex-1">
              {isInitializing ? (
                <Skeleton className="h-8 w-full rounded-md" />
              ) : (
                <Select
                  value={selectedMeterId ? String(selectedMeterId) : ""}
                  onValueChange={(val) => setSelectedMeterId(Number(val))}
                  disabled={meters.length === 0}
                >
                  <SelectTrigger className="bg-card border-border h-8 text-xs">
                    <SelectValue placeholder="Pilih Meteran" />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem
                        key={meter.meter_id}
                        value={String(meter.meter_id)}
                        className="text-xs"
                      >
                        <div className="flex items-center gap-2">
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
              {isInitializing ? (
                <Skeleton className="h-8 w-full rounded-md" />
              ) : (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-card border-border h-8 text-xs">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs">
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

      <CardContent className="space-y-6">
        {isInitializing || isLoadingHeatmap ? (
          <ComponentLoader />
        ) : !groupedData || groupedData.length === 0 ? (
          <EmptyData />
        ) : (
          <GithubCalendarHeatmap
            groupedData={groupedData}
            isLoading={isLoadingHeatmap}
            selectedMeterId={selectedMeterId ?? 0}
          />
        )}
      </CardContent>
      <CardFooter className="border-border mt-4 flex flex-col border-t pt-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Gunakan variabel 'stats' yang sudah di-override tipenya */}
          <MetricCard
            status="Sangat Efisien"
            value={stats?.SANGAT_EFISIEN ?? 0}
            icon={CheckCircle2}
            color="green"
          />
          <MetricCard status="Normal" value={stats?.NORMAL ?? 0} icon={Activity} color="slate" />
          <MetricCard
            status="Mendekati Limit"
            value={stats?.MENDEKATI_LIMIT ?? 0}
            icon={AlertTriangle}
            color="orange"
          />
          <MetricCard
            status="Over Budget"
            value={stats?.OVER_BUDGET ?? 0}
            icon={XCircle}
            color="red"
          />
        </div>

        <div className="text-muted-foreground mt-4 text-center text-[10px]">
          Menampilkan data untuk{" "}
          <b className="text-foreground">{totalDays - (stats?.UNKNOWN ?? 0)}</b> hari aktif dari
          total {totalDays} hari di tahun {selectedYear}.
        </div>
      </CardFooter>
    </Card>
  );
};

interface MetricCardProps {
  status: string;
  value: number;
  icon: React.ElementType;
  color: "green" | "slate" | "orange" | "red";
}

const MetricCard = ({ status, value, icon: Icon, color }: MetricCardProps) => {
  const colorStyles = {
    green: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
    slate: "bg-muted border-border text-foreground",
    orange: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    red: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border p-3",
        colorStyles[color]
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="font-black">{value}</span>
      </div>
      <p className="text-[9px] font-bold tracking-wider uppercase opacity-70">{status}</p>
    </div>
  );
};
