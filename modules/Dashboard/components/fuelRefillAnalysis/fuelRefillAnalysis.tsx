"use client";

import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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
  Fuel,
  RefreshCcw,
  Calendar,
  Gauge,
  Download,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { useFuelRefillAnalysis } from "../../hooks/useFuelRefillAnalysis";

export const FuelRefillAnalysis = () => {
  // 1. Download Hook
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  // 2. Data Hook (Destructuring Correctly)
  const { data, filters, options, status } = useFuelRefillAnalysis();
  const { chartData, summary, latestStockInfo, stockThresholds } = data;
  const { isLoading, isError, error } = status;

  const handleDownloadClick = () => {
    download(`Fuel-Refill-Analysis.jpg`);
  };

  return (
    <Card
      ref={ref}
      className="flex h-full w-full flex-col border-none shadow-lg ring-1 ring-slate-200"
    >
      {/* HEADER SECTION (Always Visible) */}
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-center">
          {/* Title Section */}
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Fuel className="h-4 w-4 text-blue-600" />
              Manajemen Stok & Isi Ulang BBM
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm italic">
              Monitor volume pengisian, pemakaian, dan sisa stok.
            </p>
          </div>

          {/* Filters Section */}
          <div className="flex w-full flex-wrap gap-2 xl:w-auto">
            {/* Filter Meter */}
            <Select value={filters.meterId} onValueChange={filters.setMeterId}>
              <SelectTrigger>
                <Gauge className="mr-2 h-3 w-3 text-slate-500" />
                <SelectValue placeholder="Pilih Meter" />
              </SelectTrigger>
              <SelectContent>
                {options.meters?.map((m) => (
                  <SelectItem
                    key={m.meter_id}
                    value={m.meter_id.toString()}
                    className="text-xs"
                  >
                    {m.meter_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Tahun */}
            <Select value={filters.year} onValueChange={filters.setYear}>
              <SelectTrigger>
                <Calendar className="mr-2 h-3 w-3 text-slate-500" />
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {options.years.map((y: string) => (
                  <SelectItem key={y} value={y} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Download Button */}
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
        </div>
      </CardHeader>

      {/* CONTENT SECTION */}
      <CardContent className="flex min-h-[400px] flex-1 flex-col justify-between pt-2">
        {isLoading ? (
          /* STATE: LOADING */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <Skeleton className="bg-background h-[250px] w-full rounded-xl" />
            <div className="bg-background h-24 w-full animate-pulse rounded-xl" />
          </div>
        ) : isError ? (
          /* STATE: ERROR */
          <ErrorFetchData message={error?.message} />
        ) : !chartData || chartData.length === 0 ? (
          /* STATE: EMPTY */
          <EmptyData
            title="Data BBM Tidak Tersedia"
            description="Belum ada data pengisian atau pemakaian untuk periode ini."
          />
        ) : (
          /* STATE: SUCCESS */
          <>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val / 1000}k`} // Compact View
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(val: number) => [
                      `${val.toLocaleString("id-ID")} Liter`,
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "20px" }}
                  />

                  {/* Bar: Consumption */}
                  <Bar
                    dataKey="consumption"
                    name="Volume Terpakai"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />

                  {/* Bar: Refill */}
                  <Bar
                    dataKey="refill"
                    name="Isi Ulang (Refill)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />

                  {/* Line: Remaining Stock */}
                  <Line
                    type="monotone"
                    dataKey="remainingStock"
                    name="Sisa Stok"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#10b981",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 6 }}
                  />

                  {/* Reference Line: Minimum Stock Limit */}
                  {stockThresholds && (
                    <ReferenceLine
                      y={stockThresholds.minStockLimit}
                      label={{
                        position: "right",
                        value: `Min (${Math.round(
                          stockThresholds.minStockLimit
                        )})`,
                        fill: "#ef4444",
                        fontSize: 10,
                      }}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* INSIGHT BOX */}
            <div className="bg-background mt-4 rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-full bg-blue-100 p-2">
                  <RefreshCcw className="h-4 w-4 text-blue-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Analisis Logistik & Stok
                  </p>

                  <div className="mt-2 space-y-1 text-xs leading-relaxed text-slate-600">
                    <div className="mb-1 flex justify-between border-b border-slate-200 pb-1">
                      <span>Pengisian Terakhir:</span>
                      <span className="font-semibold">
                        {summary.lastRefill}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Posisi Stok ({latestStockInfo.month}):</span>
                      <span
                        className={`font-bold ${
                          latestStockInfo.value < stockThresholds.minStockLimit
                            ? "text-red-600"
                            : "text-slate-800"
                        }`}
                      >
                        {latestStockInfo.value.toLocaleString("id-ID")} L
                      </span>
                    </div>

                    {/* Stock Alert */}
                    {latestStockInfo.value < stockThresholds.minStockLimit && (
                      <div className="mt-1 flex items-center gap-1.5 font-medium text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Stok kritis! Di bawah 20% kapasitas tangki.</span>
                      </div>
                    )}

                    {/* Balance Status */}
                    {summary.status === "Critical" ? (
                      <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 p-2 text-amber-700">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>
                          <b>Defisit Stok:</b> Total pemakaian melebihi
                          pengisian sebesar{" "}
                          {Math.abs(summary.balance).toLocaleString("id-ID")} L.
                          Segera jadwalkan refill.
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-start gap-1.5 rounded-md bg-emerald-50 p-2 text-emerald-700">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>
                          <b>Surplus Stok:</b> Supply chain aman. Total
                          pengisian mencukupi kebutuhan operasional.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
