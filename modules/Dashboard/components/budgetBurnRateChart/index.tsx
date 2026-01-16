"use client";

import React from "react";
import {
  AreaChart,
  Area,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  DollarSign,
  Calendar,
  CalendarDays,
  Download,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { useBudgetBurnRateChart } from "../../hooks/useBudgetBurnRate";
import { Button } from "@/common/components/ui/button";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { useDownloadImage } from "../../hooks/useDownloadImage";

export const BudgetBurnRateChart = () => {
  // 1. Panggil Hook
  const { filters, options, data, status } = useBudgetBurnRateChart();
  const { isError, isLoading, error } = status;
  const { chartData, insight } = data;

  // 2. Setup Download
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();
  const handleDownloadClick = () => {
    download(`Budget-Burn-Rate-Chart.jpg`);
  };

  return (
    <Card
      ref={ref}
      className="flex w-full flex-col border-none shadow-lg ring-1 ring-slate-200"
    >
      {/* HEADER: Selalu tampil agar user bisa ganti filter walau loading/error */}
      <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-slate-50 pb-4 xl:flex-row xl:items-center">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Budget Burn Rate (Penyerapan Anggaran)
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm italic">
            Akumulasi pengeluaran harian vs Target Ideal & Efisiensi.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 xl:w-auto">
          {/* Filter Bulan */}
          <Select value={filters.month} onValueChange={filters.setMonth}>
            <SelectTrigger className="w-[140px]">
              <CalendarDays className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {options.months.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter Tahun */}
          <Select value={filters.year} onValueChange={filters.setYear}>
            <SelectTrigger className="w-[100px]">
              <Calendar className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {options.years.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
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
              <span className="animate-pulse text-[10px]">...</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-[400px] flex-1 flex-col justify-between pt-6">
        {isLoading ? (
          /* STATE: LOADING */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <Skeleton className="bg-background h-[280px] w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : isError ? (
          /* STATE: ERROR */
          <ErrorFetchData message={error?.message} />
        ) : !chartData || chartData.length === 0 ? (
          /* STATE: EMPTY */
          <EmptyData
            title="Data Anggaran Kosong"
            description="Belum ada data realisasi anggaran untuk periode ini."
          />
        ) : (
          /* STATE: SUCCESS */
          <>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <Legend
                    verticalAlign="top"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
                  />
                  <defs>
                    <linearGradient
                      id="colorActual"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="dayDate"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    minTickGap={30}
                  />
                  {/* Y-Axis Gunakan Compact agar tidak terpotong */}
                  <YAxis
                    tickFormatter={(v) => formatCurrencySmart(v).full}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                    }}
                    // Tooltip Gunakan Full agar detail terlihat
                    formatter={(val: number | undefined) =>
                      `${formatCurrencySmart(val ?? 0).full}`
                    }
                  />

                  {/* Budget Limit (Garis Putus-putus) */}
                  <Area
                    type="monotone"
                    dataKey="idea"
                    name="Limit Ideal"
                    stroke="#94a3b8"
                    fill="transparent"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    activeDot={false}
                  />

                  {/* Target Efisiensi (Garis Hijau) */}
                  <Area
                    type="monotone"
                    dataKey="efficent"
                    name="Target Efisiensi"
                    stroke="#10b981"
                    fill="transparent"
                    strokeWidth={2}
                    activeDot={false}
                  />

                  {/* Realisasi (Area Merah) */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Realisasi"
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorActual)"
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* INSIGHT CARD */}
            {insight && (
              <div
                className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${
                  insight.type === "warning"
                    ? "border-red-200 bg-red-50"
                    : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <div
                  className={`shrink-0 rounded-full p-1.5 ${
                    insight.type === "warning"
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {insight.type === "warning" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${
                      insight.type === "warning"
                        ? "text-red-900"
                        : "text-emerald-900"
                    }`}
                  >
                    {insight.title}
                  </p>
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      insight.type === "warning"
                        ? "text-red-800"
                        : "text-emerald-800"
                    }`}
                  >
                    {insight.text}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
