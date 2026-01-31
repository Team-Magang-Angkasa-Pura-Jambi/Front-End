"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Badge } from "@/common/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Zap,
  Droplets,
  Fuel,
  Calendar,
  CalendarDays,
  Download,
  AlertTriangle,
} from "lucide-react";

import { MONTH_CONFIG } from "../../constants";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { Button } from "@/common/components/ui/button";
import { useUnifiedEnergyComparison } from "../../hooks/useUnifiedEnergyComparison";

export const UnifiedEnergyComparisonChart = () => {
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const handleDownloadClick = () => {
    download(`Unified-Energy-Comparison-${isCost ? "cost" : "consump"}.jpg`);
  };

  const {
    view,
    setView,
    year,
    setYear,
    month,
    setMonth,
    data,
    isLoading,
    isError,
    error,
    isCost,
  } = useUnifiedEnergyComparison();

  return (
    <Card
      ref={ref}
      className="w-full border-none shadow-lg ring-1 ring-slate-200"
    >
      <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-slate-50 pb-4 xl:flex-row xl:items-center">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Zap className="h-4 w-4 text-blue-500" />
            Analisis Konsumsi & Biaya: Workday vs Holiday
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Perbandingan efisiensi operasional bulanan.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 xl:w-auto">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[130px]">
              <CalendarDays className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_CONFIG.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <Calendar className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Tabs
            value={view}
            onValueChange={(val) => setView(val as "consumption" | "cost")}
          >
            <TabsList className="grid h-9 w-[160px] grid-cols-2">
              <TabsTrigger value="consumption" className="text-xs">
                Volume
              </TabsTrigger>
              <TabsTrigger value="cost" className="text-xs">
                Biaya
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDownloadClick}
            disabled={isExporting || isLoading}
            title="Download JPG"
          >
            {isExporting ? (
              <span className="animate-pulse text-[10px]">...</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="min-h-[400px] pt-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex h-[300px] w-full flex-col items-center justify-center space-y-4">
              <Skeleton className="bg-background h-[280px] w-full rounded-xl" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <ErrorFetchData message={error?.message} />
        ) : !data || data.length === 0 ? (
          <EmptyData
            title="Tidak Ada Data Perbandingan"
            description="Belum ada data konsumsi yang tercatat untuk periode ini."
          />
        ) : (
          <>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barGap={8}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />

                  {/* === PERBAIKAN Y-AXIS === */}
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    width={50} // Lebarkan sedikit agar label muat
                    // Gunakan formatCurrencySmart agar angka ribuan/jutaan terbaca ringkas
                    tickFormatter={(val) => formatCurrencySmart(val).val}
                  />

                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      zIndex: 100, // Pastikan tooltip di atas
                    }}
                    // === PERBAIKAN TOOLTIP FORMATTER ===
                    formatter={(
                      value: number | undefined,
                      name: string | undefined,
                      entry
                    ) => {
                      const val = Number(value) || 0;
                      // Tentukan Label
                      const label =
                        name === "weekdayValue" ? "Hari Kerja" : "Hari Libur";

                      // Tentukan Format Angka
                      if (isCost) {
                        // Jika Mode Biaya -> Format Rupiah Lengkap (Rp 1.500.000)
                        return [formatCurrencySmart(val).full, label];
                      } else {
                        // Jika Mode Volume -> Format Angka + Unit
                        // Ambil unit dari payload data yang sedang di-hover
                        const unit = entry.payload.unit || "";
                        // Format angka ribuan Indonesia
                        const formattedNumber = val.toLocaleString("id-ID", {
                          maximumFractionDigits: 2,
                        });
                        return [`${formattedNumber} ${unit}`, label];
                      }
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                  <Bar
                    dataKey="weekdayValue"
                    name="Rata-rata Hari Kerja"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    dataKey="holidayValue"
                    name="Rata-rata Hari Libur"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* === SUMMARY CARDS === */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {data.map((item) => {
                const valWeekday = Number(item.weekdayValue) || 0;
                const valHoliday = Number(item.holidayValue) || 0;

                const diff =
                  valWeekday === 0
                    ? 0
                    : ((valHoliday - valWeekday) / valWeekday) * 100;
                const isHigher = diff > 0;

                return (
                  <div
                    key={item.category}
                    className="group flex flex-col justify-between rounded-xl border border-slate-100 p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-2 text-slate-500 transition-colors group-hover:text-slate-800">
                      {item.category === "Electricity" && (
                        <Zap className="h-4 w-4 text-amber-500" />
                      )}
                      {item.category === "Water" && (
                        <Droplets className="h-4 w-4 text-blue-500" />
                      )}
                      {item.category === "Fuel" && (
                        <Fuel className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs font-bold tracking-wider uppercase">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-2xl font-black ${
                          isHigher ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {Math.abs(diff).toFixed(1)}%
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          isHigher
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }
                      >
                        {isHigher ? "Naik" : "Turun"}
                      </Badge>
                    </div>

                    <p className="mt-3 flex items-start gap-1.5 border-t pt-3 text-[11px] leading-snug text-slate-500">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 opacity-70" />
                      {isHigher ? (
                        <span>
                          Konsumsi meningkat saat libur.
                          {!isCost && (
                            <span className="ml-1 block font-semibold">
                              (Satuan: {item.unit})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>
                          Efisiensi tercapai saat libur.
                          {!isCost && (
                            <span className="ml-1 block font-semibold">
                              (Satuan: {item.unit})
                            </span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
