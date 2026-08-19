"use client";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";

import { ComponentLoader } from "@/common/components/ComponentLoader";
import { EmptyData } from "@/common/components/EmptyData";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { cn } from "@/lib/utils";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { useTrenConsump } from "../../hooks/useTrenConsump";
import { useQuery } from "@tanstack/react-query";
import { getDashboardCardConfigApi } from "../../service/visualizations.service";

// ============================================================================
// 1. TYPE DEFINITIONS & CONSTANTS
// ============================================================================

const COLORS = {
  pemakaian: "#3b82f6",
  prediksi: "#22c55e",
  target: "#a1a1aa",
  danger: "#ef4444",
};

export interface ChartDataPoint {
  name: string;
  pemakaian: number;
  target: number;
  prediksi: number;
  biayaAktual: number;
  biayaTarget: number;
}

interface EnergyTypeData {
  energy_type_id: number;
  name?: string;
  type_name?: string;
}

interface MeterData {
  meter_id: number;
  meter_code: string;
}

interface InsightData {
  type: "success" | "warning" | "danger" | "info" | "neutral" | "over_budget" | "under_budget";
  title: string;
  text: string;
}

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================

export const AnalysisChart = () => {
  const { data, filters, options, status } = useTrenConsump();
  const { chartData, insights, costInsights } = data || {};
  const { isLoading, isError, error } = status;
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const safeChartData = useMemo(() => (chartData || []) as ChartDataPoint[], [chartData]);

  const overTargetStats = useMemo(() => {
    if (safeChartData.length === 0) return { count: 0, dates: [] };
    const anomalies = safeChartData.filter((d) => (d.pemakaian ?? 0) > (d.target ?? 0));
    return {
      count: anomalies.length,
      dates: anomalies.slice(0, 3).map((d) => d.name),
    };
  }, [safeChartData]);

  const handleDownloadClick = () => {
    const selectedEnergy = options.energyTypes.find(
      (e: EnergyTypeData) => e.energy_type_id === filters.energyId
    );
    const energyName = selectedEnergy?.name || selectedEnergy?.type_name || "Energy";
    download(`trend-consumption-${energyName}.jpg`);
  };

  if (isError) return <ErrorFetchData message={error?.message} />;

  const isChartEmpty = !data || safeChartData.length === 0;

  const { data: configResponse } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
    staleTime: 1000 * 60 * 5,
  });
  const trendConfig = (configResponse?.data?.config as any)?.trend_analysis;
  const widgetTitle = trendConfig?.title || "Analisis Tren Konsumsi";

  const filteredMeters = useMemo(() => {
    const raw = options.meters || [];
    if (trendConfig?.meter_ids && trendConfig.meter_ids.length > 0) {
      const allowedSet = new Set(trendConfig.meter_ids.map(Number));
      const res = raw.filter((m: MeterData) => allowedSet.has(m.meter_id));
      return res.length > 0 ? res : raw;
    }
    return raw;
  }, [options.meters, trendConfig]);

  useEffect(() => {
    if (trendConfig?.default_energy_id && !filters.energyId) {
      filters.setEnergyId(trendConfig.default_energy_id);
    }
    if (trendConfig?.default_meter_id && !filters.selectedMeterId) {
      filters.setSelectedMeterId(String(trendConfig.default_meter_id));
    }
  }, [trendConfig, filters]);

  return (
    <Card
      ref={ref}
      className="col-span-12 h-full border-none shadow-md ring-1 ring-slate-200 lg:col-span-8"
    >
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Activity className="text-primary h-5 w-5" />
              {widgetTitle}
            </CardTitle>

            {!isLoading && overTargetStats.count > 0 && (
              <div className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                <CalendarDays className="h-3 w-3" />
                {overTargetStats.count} Hari Over Target
              </div>
            )}
          </div>

          <ChartFilters
            filters={filters}
            options={{
              ...options,
              meters: filteredMeters,
            }}
            isExporting={isExporting}
            onDownload={handleDownloadClick}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">
            <ComponentLoader />
          </div>
        ) : isChartEmpty ? (
          <div className="flex h-[350px] items-center justify-center">
            <EmptyData />
          </div>
        ) : (
          <>
            <div className="h-[290px] w-full">
              <ResponsiveContainer>
                <LineChart data={safeChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />

                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}`}
                    label={{
                      value: options.volumeUnit,
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#94a3b8", fontSize: 11 },
                      dx: -10,
                    }}
                  />

                  <Tooltip content={<CustomChartTooltip volumeUnit={options.volumeUnit} />} />
                  <Legend
                    wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }}
                    iconType="circle"
                  />

                  <Line
                    type="monotone"
                    dataKey="pemakaian"
                    name="Aktual"
                    stroke={COLORS.pemakaian}
                    strokeWidth={3}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={<AnomalyDot />}
                  />
                  <Line
                    type="monotone"
                    dataKey="prediksi"
                    name="Prediksi AI"
                    stroke={COLORS.prediksi}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="target"
                    name="Target Plan"
                    stroke={COLORS.target}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {insights && (
                <InsightCard
                  data={insights as InsightData}
                  overTargetCount={overTargetStats.count}
                  type="efficiency"
                />
              )}
              {costInsights && <InsightCard data={costInsights as InsightData} type="cost" />}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. SUB-COMPONENTS & STRICT INTERFACES
// ============================================================================

interface AnomalyDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}

const AnomalyDot = (props: AnomalyDotProps) => {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;

  const isOverTarget = (payload.pemakaian ?? 0) > (payload.target ?? 0);

  if (isOverTarget) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={COLORS.danger}
        stroke="#fff"
        strokeWidth={2}
        className="drop-shadow-sm"
      />
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="#fff" stroke={COLORS.pemakaian} strokeWidth={2} />;
};

interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  value: number;
  payload: ChartDataPoint; // Merujuk pada interface ChartDataPoint utama Anda
}

// 2. Buat interface CustomTooltipProps mandiri tanpa extends TooltipProps bawaan Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  volumeUnit: string;
}

const CustomChartTooltip = ({ active, payload, label, volumeUnit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const pemakaian = (payload.find((p) => p.dataKey === "pemakaian")?.value as number) || 0;
    const target = (payload.find((p) => p.dataKey === "target")?.value as number) || 0;
    const prediksi = (payload.find((p) => p.dataKey === "prediksi")?.value as number) || 0;

    const variance = pemakaian - target;
    const isOver = variance > 0;
    const predVariance = pemakaian - prediksi;

    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <p className="mb-2.5 border-b border-slate-100 pb-1.5 font-bold text-slate-800 dark:border-slate-800 dark:text-slate-200">
          {label}
        </p>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs" /> Pemakaian Aktual:
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {pemakaian.toLocaleString("id-ID")} {volumeUnit}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" /> Prediksi AI:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {prediksi > 0 ? `${prediksi.toLocaleString("id-ID")} ${volumeUnit}` : "-"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Target Plan:
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {target > 0 ? `${target.toLocaleString("id-ID")} ${volumeUnit}` : "Belum diatur"}
            </span>
          </div>

          {target > 0 && (
            <div
              className={cn(
                "mt-1 flex justify-between gap-4 border-t border-slate-100 pt-1.5 font-bold dark:border-slate-800",
                isOver ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              <span>Deviasi vs Target:</span>
              <span>
                {isOver ? "+" : ""}
                {variance.toFixed(1)} {volumeUnit}
              </span>
            </div>
          )}

          {prediksi > 0 && (
            <div className="flex justify-between gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span>Deviasi vs Prediksi AI:</span>
              <span className={predVariance > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                {predVariance > 0 ? "+" : ""}
                {predVariance.toFixed(1)} {volumeUnit}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface ChartFiltersProps {
  filters: {
    energyId: number | null;
    setEnergyId: (val: number) => void;
    selectedMonth: string;
    setSelectedMonth: (val: string) => void;
    selectedMeterId: string;
    setSelectedMeterId: (val: string) => void;
  };
  options: {
    energyTypes: EnergyTypeData[];
    meters: MeterData[];
    months: { value: string; label: string }[];
  };
  isExporting: boolean;
  onDownload: () => void;
}

const ChartFilters = ({ filters, options, isExporting, onDownload }: ChartFiltersProps) => (
  <div className="flex flex-wrap gap-2">
    <Select
      value={filters.energyId ? String(filters.energyId) : ""}
      onValueChange={(val) => filters.setEnergyId(Number(val))}
    >
      <SelectTrigger className="w-full sm:w-[140px]">
        <SelectValue placeholder="Tipe Energi" />
      </SelectTrigger>
      <SelectContent>
        {options.energyTypes?.map((type: EnergyTypeData) => (
          <SelectItem key={type.energy_type_id} value={String(type.energy_type_id)}>
            {type.name || type.type_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select
      value={filters.selectedMeterId}
      onValueChange={filters.setSelectedMeterId}
      disabled={!filters.energyId}
    >
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Pilih Meter" />
      </SelectTrigger>
      <SelectContent>
        {options.meters?.map((meter: MeterData) => (
          <SelectItem key={meter.meter_id} value={String(meter.meter_id)}>
            {meter.meter_code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select value={filters.selectedMonth} onValueChange={filters.setSelectedMonth}>
      <SelectTrigger className="w-full sm:w-[160px]">
        <SelectValue placeholder="Periode" />
      </SelectTrigger>
      <SelectContent>
        {options.months?.map((opt: { value: string; label: string }) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Button
      variant="outline"
      size="icon"
      onClick={onDownload}
      disabled={isExporting}
      title="Download JPG"
    >
      {isExporting ? <span className="text-[10px]">...</span> : <Download className="h-4 w-4" />}
    </Button>
  </div>
);

interface InsightCardProps {
  data: InsightData;
  overTargetCount?: number;
  type: "efficiency" | "cost";
}

const InsightCard = ({ data, overTargetCount = 0, type }: InsightCardProps) => {
  const isDanger = data.type === "danger" || data.type === "over_budget";
  const isWarning = data.type === "warning";

  const styleClasses = isDanger
    ? "border-red-200 bg-red-50 text-red-800"
    : isWarning
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  const Icon =
    type === "cost" ? Wallet : isDanger ? AlertTriangle : isWarning ? AlertCircle : CheckCircle2;

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-3 shadow-sm", styleClasses)}>
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5",
          isDanger ? "text-red-600" : isWarning ? "text-amber-600" : "text-emerald-600"
        )}
      />
      <div className="w-full">
        <div className="flex justify-between">
          <p className="text-sm font-bold">{type === "cost" ? data.title : "Efisiensi Energi"}</p>
          {type === "efficiency" && overTargetCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              {overTargetCount} Hari Warning
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed opacity-90">{data.text}</p>
      </div>
    </div>
  );
};
