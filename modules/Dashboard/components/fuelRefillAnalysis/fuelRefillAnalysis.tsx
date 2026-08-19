"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  Flame,
  Fuel,
  Gauge,
  ServerCrash,
  Truck,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import { getDashboardCardConfigApi } from "../../service/visualizations.service";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { useFuelRefillAnalysis } from "../../hooks/useFuelRefillAnalysis";
import { useEffect, useMemo } from "react";
import { Button } from "@/common/components/ui/button";
import { EmptyData } from "@/common/components/EmptyData";

export interface FuelChartData {
  month: string;
  consumption: number;
  refill: number;
  remainingStock: number;
}

export const FuelRefillAnalysis = () => {
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const { data, filters, options, status } = useFuelRefillAnalysis();
  const { chartData, summary, latestStockInfo, stockThresholds } = data || {};
  const { isLoading, isError, error } = status;

  const handleDownloadClick = () => {
    download(`Fuel-Logistics-${filters.year}.jpg`);
  };

  const isNoMeter = !options.meters || options.meters.length === 0;
  const isDataEmpty = !chartData || chartData.length === 0;

  const { data: configResponse } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
    staleTime: 1000 * 60 * 5,
  });
  const fuelConfig = (configResponse?.data?.config as any)?.fuel_logistics;
  const widgetTitle = fuelConfig?.title || "Logistik BBM & Aktivitas Genset";

  const filteredTanks = useMemo(() => {
    const raw = options.meters || [];
    if (fuelConfig?.meter_ids && fuelConfig.meter_ids.length > 0) {
      const allowedSet = new Set(fuelConfig.meter_ids.map(Number));
      const res = raw.filter((m: any) => allowedSet.has(m.meter_id));
      return res.length > 0 ? res : raw;
    }
    return raw;
  }, [options.meters, fuelConfig]);

  useEffect(() => {
    if (filteredTanks.length > 0) {
      if (fuelConfig?.default_meter_id) {
        const found = filteredTanks.find((m: any) => m.meter_id === fuelConfig.default_meter_id);
        if (found && !filters.meterId) {
          filters.setMeterId(String(found.meter_id));
          return;
        }
      }
      if (!filters.meterId || !filteredTanks.some((m: any) => String(m.meter_id) === filters.meterId)) {
        filters.setMeterId(String(filteredTanks[0].meter_id));
      }
    }
  }, [filteredTanks, filters, fuelConfig]);


  return (
    <Card ref={ref} className="flex w-full flex-col border-none shadow-md ring-1 ring-slate-200">
      <CardHeader className="border-b border-slate-50 pb-4">
        <div className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Fuel className="h-5 w-5 text-blue-600" />
              {widgetTitle}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Pantau sisa stok di tangki dan riwayat pemakaian saat pemadaman.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 xl:w-auto">
            <Select
              value={filters.meterId}
              onValueChange={filters.setMeterId}
              disabled={isNoMeter || isLoading}
            >
              <SelectTrigger className="w-full bg-white sm:w-[160px]">
                <Gauge className="mr-2 h-3 w-3 text-slate-500" />
                <SelectValue placeholder={isNoMeter ? "Kosong" : "Pilih Tangki"} />
              </SelectTrigger>
              <SelectContent>
                {filteredTanks.map((m: any) => (
                  <SelectItem key={m.meter_id} value={String(m.meter_id)}>
                    {m.meter_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.year}
              onValueChange={filters.setYear}
              disabled={isNoMeter || isLoading}
            >
              <SelectTrigger className="w-full bg-white sm:w-[120px]">
                <Calendar className="mr-2 h-3 w-3 text-slate-500" />
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {options.years?.map((y: string) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleDownloadClick}
              disabled={isExporting || isLoading || isNoMeter}
              className="bg-white"
              title="Download Analisis"
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

      <CardContent className="p-6">
        {isNoMeter ? (
          /* --- STATE: TIDAK ADA DATA MASTER TANGKI --- */
          <div className="flex min-h-[320px] items-center justify-center">
            <EmptyData
              title="Tangki BBM Belum Terdaftar"
              description="Sistem tidak mendeteksi adanya data aset tangki fisik (Profil Tangki) di lokasi ini."
            />
          </div>
        ) : isLoading ? (
          <SkeletonLoader />
        ) : isError ? (
          /* --- STATE: SERVER ERROR KHUSUS --- */
          <div className="animate-in fade-in zoom-in flex min-h-[320px] flex-col items-center justify-center gap-4 text-center duration-500">
            <div className="rounded-full border border-red-100 bg-red-50 p-4">
              <ServerCrash className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-800">Gangguan Koneksi Server</h3>
              <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-slate-500">
                {error?.message ||
                  "Sistem gagal mengambil data logistik BBM. Jangan khawatir, tim teknis kami sedang menanganinya."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-8 text-xs"
              onClick={() => window.location.reload()}
            >
              Muat Ulang Halaman
            </Button>
          </div>
        ) : isDataEmpty ? (
          /* --- STATE: TRANSAKSI BBM KOSONG --- */
          <div className="flex min-h-[320px] items-center justify-center">
            <EmptyData
              title="Data BBM Kosong"
              description="Tidak ada catatan logistik atau pemakaian BBM pada tahun yang dipilih."
            />
          </div>
        ) : (
          /* --- STATE: SUCCESS RENDER CHART --- */
          <div className="flex flex-col gap-6">
            <div className="min-h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={45}
                  />

                  {/* Gunakan custom content tanpa mempassing strict types dari Recharts */}
                  <Tooltip cursor={{ fill: "#f8fafc" }} content={<FuelTooltip />} />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "15px", fontSize: "12px" }}
                  />

                  <Bar
                    dataKey="refill"
                    name="Suplai Masuk (Refill)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />

                  <Bar
                    dataKey="consumption"
                    name="Pemakaian (Genset Aktif)"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />

                  <Line
                    type="stepAfter"
                    dataKey="remainingStock"
                    name="Estimasi Sisa Stok"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />

                  {stockThresholds && (
                    <ReferenceLine
                      y={stockThresholds.minStockLimit}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        position: "insideTopLeft",
                        value: `Batas Kritis (${stockThresholds.minStockLimit.toLocaleString("id-ID")} L)`,
                        fill: "#ef4444",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {latestStockInfo && stockThresholds && (
              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 md:grid-cols-3">
                <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Fuel className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Estimasi Stok Terkini
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span
                      className={`text-2xl font-black ${latestStockInfo.value < stockThresholds.minStockLimit
                        ? "text-red-600"
                        : "text-emerald-600"
                        }`}
                    >
                      {latestStockInfo.value.toLocaleString("id-ID")}
                      <span className="text-sm font-medium text-slate-500"> L</span>
                    </span>
                  </div>
                  {latestStockInfo.value < stockThresholds.minStockLimit ? (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> Tangki menipis, jadwalkan pengisian!
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Stok aman untuk operasional darurat.
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Flame className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      BBM Terbakar (YTD)
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-2xl font-black text-slate-700">
                      {Math.abs(summary?.totalConsumption || 0).toLocaleString("id-ID")}
                      <span className="text-sm font-medium text-slate-500"> L</span>
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    Indikasi durasi & intensitas mati lampu (genset aktif).
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Total Suplai Masuk (YTD)
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-2xl font-black text-slate-700">
                      {Math.abs(summary?.totalRefill || 0).toLocaleString("id-ID")}
                      <span className="text-sm font-medium text-slate-500"> L</span>
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    Terakhir diisi pada:{" "}
                    <b className="text-slate-700">{summary?.lastRefill || "-"}</b>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface FuelTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface FuelTooltipPayload {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

const FuelTooltip = ({ active, payload, label }: FuelTooltipProps) => {
  if (active && payload && payload.length) {
    const safePayload = payload as FuelTooltipPayload[];

    return (
      <div className="z-50 min-w-[200px] rounded-xl border-none bg-white p-3 text-xs shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <p className="mb-2 border-b border-slate-100 pb-1 font-bold text-slate-700">
          Periode: {label}
        </p>
        <div className="flex flex-col gap-2">
          {safePayload.map((entry, index) => {
            const val = Number(entry.value) || 0;
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <div
                    className="h-2.5 w-2.5 rounded-[3px]"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-semibold text-slate-700">
                  {val.toLocaleString("id-ID")} L
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

const SkeletonLoader = () => (
  <div className="flex h-full w-full flex-col gap-6">
    <Skeleton className="h-[320px] w-full rounded-xl" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Skeleton className="h-[100px] w-full rounded-xl" />
      <Skeleton className="h-[100px] w-full rounded-xl" />
      <Skeleton className="h-[100px] w-full rounded-xl" />
    </div>
  </div>
);
