"use client";

import {
  ActivitySquare,
  Calendar,
  CalendarDays,
  Download,
  Droplets,
  Fuel,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";

import { EmptyData } from "@/common/components/EmptyData";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { useQuery } from "@tanstack/react-query";
import { getDashboardCardConfigApi } from "../../service/visualizations.service";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { MONTH_CONFIG } from "../../constants";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import {
  DailyPaxData,
  UnifiedEnergyData,
  useEnergyPaxCorrelation,
} from "../../hooks/useEnergyPaxCorrelation";

export const EnergyPaxCorrelationCard = () => {
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState<string>("energy");

  const {
    year,
    setYear,
    month,
    setMonth,
    data: energyData,
    paxData,
    isLoading,
    isError,
    error,
  } = useEnergyPaxCorrelation();

  const { data: configResponse } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
    staleTime: 1000 * 60 * 5,
  });

  const paxConfig = (configResponse?.data?.config as any)?.pax_correlation;
  const widgetTitle = paxConfig?.title || "Korelasi Beban Operasional";

  const handleDownloadClick = () => {
    download(`Korelasi-${activeTab}-${year}-${month}.jpg`);
  };

  if (isError) return <ErrorFetchData message={error?.message} />;

  const isEnergyEmpty = !energyData || energyData.length === 0;
  const isPaxEmpty = !paxData || paxData.length === 0;

  return (
    <Card ref={ref} className="w-full overflow-hidden border-none shadow-lg ring-1 ring-slate-200">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <ActivitySquare className="h-5 w-5 text-indigo-500" />
              {widgetTitle}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Analisis validasi konsumsi energi berdasarkan kepadatan area.
            </p>
          </div>

          <DashboardFilters
            month={month}
            year={year}
            onMonthChange={setMonth}
            onValueYearChange={setYear}
            isExporting={isExporting}
            isLoading={isLoading}
            onDownload={handleDownloadClick}
          />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <Tabs
            defaultValue="energy"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <TabsList className="grid h-10 w-full grid-cols-2 sm:w-[400px]">
                <TabsTrigger value="energy" className="text-xs font-semibold sm:text-sm">
                  <Zap className="mr-2 h-4 w-4" />
                  Volume Energi
                </TabsTrigger>
                <TabsTrigger value="pax" className="text-xs font-semibold sm:text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  Kepadatan Pax
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: ENERGI */}
            <TabsContent
              value="energy"
              className="mt-0 focus-visible:ring-0 focus-visible:outline-none"
            >
              <div className="flex flex-col gap-6">
                {isEnergyEmpty ? <EmptyData /> : <EnergyBarChart data={energyData} />}

                {/* Insight hanya tampil di tab energi karena datanya relevan ke perbandingan */}
                <div className="border-t border-slate-100 pt-6">
                  <CorrelationInsightBox energyData={energyData} />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: PENUMPANG */}
            <TabsContent
              value="pax"
              className="mt-0 focus-visible:ring-0 focus-visible:outline-none"
            >
              <div className="flex flex-col gap-6">
                {isPaxEmpty ? <EmptyData /> : <PaxAreaChart data={paxData} />}

                <div className="mt-2 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                  <p className="text-xs leading-relaxed font-medium text-orange-900">
                    <strong>Catatan Pola Penumpang:</strong> Grafik ini menampilkan rata-rata
                    kepadatan area per hari. Lonjakan yang selaras dengan kenaikan volume di tab{" "}
                    <b>Volume Energi</b> menandakan bahwa operasional berjalan sesuai rasio beban
                    yang wajar.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

const EnergyBarChart = ({ data }: { data: UnifiedEnergyData[] }) => (
  <div className="h-[320px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="category"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(val) => formatCurrencySmart(val).val}
        />
        <Tooltip cursor={{ fill: "#f8fafc" }} content={<EnergyTooltip />} />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }} />
        <Bar
          dataKey="weekdayValue"
          name="Rata-rata Hari Kerja"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          barSize={45}
        />
        <Bar
          dataKey="holidayValue"
          name="Rata-rata Hari Libur"
          fill="#f43f5e"
          radius={[4, 4, 0, 0]}
          barSize={45}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const PaxAreaChart = ({ data }: { data: DailyPaxData[] }) => (
  <div className="h-[320px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPax" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 11 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(val) => formatCurrencySmart(val).val}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          formatter={(val: number | undefined) => [
            (val ?? 0).toLocaleString("id-ID"),
            "Jumlah Penumpang (Pax)",
          ]}
        />
        <Area
          type="monotone"
          stroke="#f97316"
          dataKey="avgPax"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorPax)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

interface FilterProps {
  month: string;
  year: string;
  onMonthChange: (v: string) => void;
  onValueYearChange: (v: string) => void;
  isExporting: boolean;
  isLoading: boolean;
  onDownload: () => void;
}

const DashboardFilters = ({
  month,
  year,
  onMonthChange,
  onValueYearChange,
  isExporting,
  isLoading,
  onDownload,
}: FilterProps) => {
  const currentMonth = month || new Date().getMonth().toString();
  const currentYear = year || new Date().getFullYear().toString();

  return (
    <div className="flex w-full flex-wrap gap-2 xl:w-auto">
      {/* 
         UX Tip: Jika isLoading, nonaktifkan filter agar user 
         tidak melakukan spam request saat data sedang loading.
      */}
      <Select value={currentMonth} onValueChange={onMonthChange} disabled={isLoading}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <CalendarDays className="mr-2 h-3 w-3 text-slate-500" />
          <SelectValue placeholder="Pilih Bulan" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_CONFIG.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentYear} onValueChange={onValueYearChange} disabled={isLoading}>
        <SelectTrigger className="w-full sm:w-[120px]">
          <Calendar className="mr-2 h-3 w-3 text-slate-500" />
          <SelectValue placeholder="Pilih Tahun" />
        </SelectTrigger>
        <SelectContent>
          {["2024", "2025", "2026"].map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onDownload}
        disabled={isExporting || isLoading}
        className="bg-white hover:bg-slate-50"
        title="Download Data"
      >
        {isExporting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        ) : (
          <Download className="h-4 w-4 text-slate-600" />
        )}
      </Button>
    </div>
  );
};

interface EnergyTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface EnergyTooltipPayloadItem {
  name: string;
  value: number;
  fill: string;
  payload: UnifiedEnergyData;
}
const EnergyTooltip = ({ active, payload, label }: EnergyTooltipProps) => {
  if (active && payload && payload.length) {
    const safePayload = payload as EnergyTooltipPayloadItem[];

    return (
      <div className="z-50 min-w-[160px] rounded-xl border-none bg-white p-3 text-xs shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <p className="mb-2 border-b border-slate-100 pb-1 font-bold text-slate-700">{label}</p>
        <div className="flex flex-col gap-1.5">
          {safePayload.map((entry, i) => {
            const val = Number(entry.value) || 0;
            const unit = entry.payload.unit || "";
            return (
              <div key={i} className="flex justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                  {entry.name}:
                </span>
                <span className="font-semibold text-slate-700">
                  {val.toLocaleString("id-ID")} {unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const CorrelationInsightBox = ({ energyData }: { energyData: UnifiedEnergyData[] }) => {
  if (!energyData || energyData.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
        <p className="text-xs leading-relaxed font-medium text-indigo-900">
          <strong>Panduan Analisis:</strong> Jika konsumsi energi di Hari Libur melonjak tinggi,
          silakan periksa tab <b>Kepadatan Pax</b>. Lonjakan energi dianggap{" "}
          <b>wajar dan efisien</b> jika diiringi oleh kepadatan penumpang di hari Sabtu/Minggu. Jika
          energi naik namun tren penumpang sepi, maka indikasi <b>pemborosan operasional</b> sedang
          terjadi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {energyData.map((item) => {
          const valW = Number(item.weekdayValue) || 0;
          const valH = Number(item.holidayValue) || 0;
          const diff = valW === 0 ? 0 : ((valH - valW) / valW) * 100;
          const isHigher = diff > 0;

          return (
            <div
              key={item.category}
              className="flex flex-col justify-between rounded-xl border border-slate-100 p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600">
                  {item.category === "Electricity" && <Zap className="h-4 w-4 text-amber-500" />}
                  {item.category === "Water" && <Droplets className="h-4 w-4 text-blue-500" />}
                  {item.category === "Fuel" && <Fuel className="h-4 w-4 text-red-500" />}
                  <span className="text-[11px] font-bold tracking-wider uppercase">
                    {item.category}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={isHigher ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}
                >
                  {isHigher ? "Naik Saat Libur" : "Turun Saat Libur"}
                </Badge>
              </div>
              <div className="mt-1 flex items-end justify-between">
                <span
                  className={`text-2xl font-black ${isHigher ? "text-red-600" : "text-emerald-600"}`}
                >
                  {Math.abs(diff).toFixed(1)}%
                </span>
                {item.unit && (
                  <span className="mb-1 text-[11px] font-semibold text-slate-400">
                    Satu: {item.unit}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-[150px] rounded-md" />
      <Skeleton className="h-10 w-[150px] rounded-md" />
    </div>
    <Skeleton className="h-[320px] w-full rounded-xl" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Skeleton className="h-[100px] w-full rounded-xl" />
      <Skeleton className="h-[100px] w-full rounded-xl" />
      <Skeleton className="h-[100px] w-full rounded-xl" />
    </div>
  </div>
);
