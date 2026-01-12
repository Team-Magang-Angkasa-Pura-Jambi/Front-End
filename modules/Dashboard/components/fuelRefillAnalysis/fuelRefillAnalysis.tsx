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
      className="w-full h-full shadow-lg border-none ring-1 ring-slate-200 flex flex-col"
    >
      {/* HEADER SECTION (Always Visible) */}
      <CardHeader>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          {/* Title Section */}
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Fuel className="w-4 h-4 text-blue-600" />
              Manajemen Stok & Isi Ulang BBM
            </CardTitle>
            <p className="text-sm text-muted-foreground italic mt-1">
              Monitor volume pengisian, pemakaian, dan sisa stok.
            </p>
          </div>

          {/* Filters Section */}
          <div className="flex gap-2 flex-wrap w-full xl:w-auto">
            {/* Filter Meter */}
            <Select value={filters.meterId} onValueChange={filters.setMeterId}>
              <SelectTrigger>
                <Gauge className="w-3 h-3 mr-2 text-slate-500" />
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
                <Calendar className="w-3 h-3 mr-2 text-slate-500" />
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
                <span className="text-[10px] animate-pulse">...</span>
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* CONTENT SECTION */}
      <CardContent className="flex-1 min-h-[400px] flex flex-col justify-between pt-2">
        {isLoading ? (
          /* STATE: LOADING */
          <div className="h-full w-full flex flex-col items-center justify-center gap-4">
            <Skeleton className="h-[250px] w-full rounded-xl bg-background" />
            <div className="w-full h-24 bg-background rounded-xl animate-pulse" />
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
            <div className="p-4 bg-background rounded-xl border border-slate-200 mt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full shrink-0">
                  <RefreshCcw className="w-4 h-4 text-blue-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Analisis Logistik & Stok
                  </p>

                  <div className="text-xs text-slate-600 leading-relaxed mt-2 space-y-1">
                    <div className="flex justify-between border-b border-slate-200 pb-1 mb-1">
                      <span>Pengisian Terakhir:</span>
                      <span className="font-semibold">
                        {summary.lastRefill}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
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
                      <div className="flex items-center gap-1.5 text-red-600 font-medium mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Stok kritis! Di bawah 20% kapasitas tangki.</span>
                      </div>
                    )}

                    {/* Balance Status */}
                    {summary.status === "Critical" ? (
                      <div className="flex items-start gap-1.5 text-amber-700 mt-2 bg-amber-50 p-2 rounded-md">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>
                          <b>Defisit Stok:</b> Total pemakaian melebihi
                          pengisian sebesar{" "}
                          {Math.abs(summary.balance).toLocaleString("id-ID")} L.
                          Segera jadwalkan refill.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 text-emerald-700 mt-2 bg-emerald-50 p-2 rounded-md">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
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
