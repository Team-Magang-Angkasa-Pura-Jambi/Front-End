"use client";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Lightbulb,
  AlertCircle,
  Activity,
  Download,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Button } from "@/common/components/ui/button";

import { useTrenConsump } from "../../hooks/useTrenConsump";
import { ComponentLoader } from "@/common/components/ComponentLoader";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { useDownloadImage } from "../../hooks/useDownloadImage";

const COLORS = {
  pemakaian: "#3b82f6",
  prediksi: "#22c55e",
  target: "#a1a1aa",
  danger: "#ef4444",
};

// --- 1. DEFINISI TIPE DATA ---
// Mendefinisikan bentuk data asli satu titik di chart
interface ChartDataPoint {
  name: string;
  pemakaian: number;
  target: number;
  prediksi: number;
  // Field lain jika ada (misal: actual_cost, dll)
  [key: string]: string | number;
}

// Props yang diterima oleh Custom Dot Recharts
interface CustomizedDotProps {
  cx?: number;
  cy?: number;
  stroke?: string;
  payload?: ChartDataPoint; // Menggunakan tipe data spesifik, bukan any
  value?: number;
}

// --- 2. KOMPONEN CUSTOM DOT ---
const CustomizedDot = (props: CustomizedDotProps) => {
  const { cx, cy, payload } = props;

  // Pastikan cx, cy, dan payload ada sebelum render
  if (typeof cx !== "number" || typeof cy !== "number" || !payload) {
    return null;
  }

  // Gunakan Nullish Coalescing (??) untuk menghindari error jika data undefined
  const isOverTarget = (payload.pemakaian ?? 0) > (payload.target ?? 0);

  if (isOverTarget) {
    return (
      <svg
        x={cx - 6}
        y={cy - 6}
        width={12}
        height={12}
        fill="red"
        viewBox="0 0 1024 1024"
      >
        <circle
          cx="512"
          cy="512"
          r="512"
          fill={COLORS.danger}
          stroke="white"
          strokeWidth="50"
        />
      </svg>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      stroke={COLORS.pemakaian}
      strokeWidth={2}
      fill="white"
    />
  );
};

export const AnalysisChart = () => {
  const { data, filters, options, status } = useTrenConsump();

  const { chartData, insights, costInsights } = data;
  const { isLoading, isError, error } = status;

  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  // Memastikan chartData dianggap sebagai array ChartDataPoint
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeChartData = (chartData as unknown as ChartDataPoint[]) || [];

  const overTargetStats = useMemo(() => {
    if (safeChartData.length === 0) return { count: 0, dates: [] };

    const anomalies = safeChartData.filter((d) => d.pemakaian > d.target);

    return {
      count: anomalies.length,
      dates: anomalies.slice(0, 3).map((d) => d.name),
    };
  }, [safeChartData]);

  const handleDownloadClick = () => {
    download(`trent-consumption-${filters.typeEnergy}.jpg`);
  };

  if (isLoading) return <ComponentLoader />;
  if (isError) return <ErrorFetchData message={error?.message} />;
  if (!data || safeChartData.length === 0) return <EmptyData />;

  const getInsightStyle = (type: string) => {
    switch (type) {
      case "danger":
      case "over_budget":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "success":
      case "under_budget":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      default:
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "danger":
      case "over_budget":
        return <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />;
      case "success":
      case "under_budget":
        return <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />;
      default:
        return <Lightbulb className="mt-0.5 h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Card
      ref={ref}
      className="col-span-12 border-none shadow-md ring-1 ring-slate-200 lg:col-span-8"
    >
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Activity className="text-primary h-5 w-5" />
              Analisis Tren & Biaya
            </CardTitle>

            {overTargetStats.count > 0 && (
              <div className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                <CalendarDays className="h-3 w-3" />
                {overTargetStats.count} Hari Over Target
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.typeEnergy}
              onValueChange={filters.setTypeEnergy}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Tipe Energi" />
              </SelectTrigger>
              <SelectContent>
                {options.energyTypes.map((type) => (
                  <SelectItem key={type.energy_type_id} value={type.type_name}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.selectedMeterId}
              onValueChange={filters.setSelectedMeterId}
              disabled={!filters.typeEnergy}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Pilih Meter" />
              </SelectTrigger>
              <SelectContent>
                {options.meters.map((meter) => (
                  <SelectItem
                    key={meter.meter_id}
                    value={String(meter.meter_id)}
                  >
                    {meter.meter_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.selectedMonth}
              onValueChange={filters.setSelectedMonth}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                {options.months.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleDownloadClick}
              disabled={isExporting || isLoading}
              title="Download JPG"
            >
              {isExporting ? (
                <span className="text-[10px]">...</span>
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={safeChartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => `${val} ${options.volumeUnit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                // --- FIXED TYPESCRIPT FORMATTER ---
                formatter={(
                  value,
                  name,
                  item // Definisi item spesifik
                ) => {
                  const unit = options.volumeUnit;
                  const valNum = Number(value); // Pastikan number

                  // Akses payload dengan aman karena sudah di-type
                  const pemakaian = item.payload.pemakaian ?? 0;
                  const target = item.payload.target ?? 0;

                  if (name === "Aktual" && pemakaian > target) {
                    return [`${valNum} ${unit} (OVER)`, name];
                  }
                  return [`${valNum} ${unit}`, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />

              <Line
                type="monotone"
                dataKey="pemakaian"
                name="Aktual"
                stroke={COLORS.pemakaian}
                strokeWidth={2}
                dot={<CustomizedDot />}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="prediksi"
                name="Prediksi"
                stroke={COLORS.prediksi}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke={COLORS.target}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {insights && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-3 shadow-sm ${getInsightStyle(
                insights.type
              )}`}
            >
              {getInsightIcon(insights.type)}
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-sm font-bold">Efisiensi Energi</p>
                  {overTargetStats.count > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      {overTargetStats.count} Hari Warning
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  {insights.text}
                </p>
              </div>
            </div>
          )}

          {costInsights && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-3 shadow-sm ${getInsightStyle(
                costInsights.type
              )}`}
            >
              <div className="mt-0.5">
                <Wallet
                  className={`h-5 w-5 ${costInsights.type === "over_budget" ? "text-red-600" : "text-emerald-600"}`}
                />
              </div>
              <div>
                <p className="text-sm font-bold">{costInsights.title}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  {costInsights.text}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
