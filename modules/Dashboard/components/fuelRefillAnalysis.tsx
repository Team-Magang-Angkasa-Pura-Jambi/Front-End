"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Fuel, RefreshCcw, Calendar, Gauge } from "lucide-react";

// Import API & Constants
import { getFuelRefillAnalysisApi } from "../service/visualizations.service";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { ENERGY_TYPES } from "@/common/types/energy";

export const FuelRefillAnalysis = () => {
  const currentDate = new Date();
  const [year, setYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  const [meterId, setMeterId] = useState<string>();

  // --- 1. FETCH METER DATA ---
  const { data: meterDataResponse, isSuccess: fetchMeterSuccess } = useQuery({
    queryKey: ["meter-data"],
    queryFn: () => getMetersApi(ENERGY_TYPES.FUEL),
  });

  const meterData = useMemo(
    () => meterDataResponse?.data || [],
    [meterDataResponse?.data]
  );

  useEffect(() => {
    if (meterData.length && !meterId) {
      setMeterId(meterData[0].meter_id.toString());
    }
  }, [meterData, meterId]);

  // --- 2. FETCH ANALYSIS DATA ---
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["fuel-refill-analysis", year, meterId],
    queryFn: () => getFuelRefillAnalysisApi(parseInt(year), parseInt(meterId!)),
    enabled: fetchMeterSuccess && !!meterId,
  });

  const chartData = useMemo(() => apiResponse?.data || [], [apiResponse?.data]);

  // --- 3. LOGIC BARU: Max Capacity & Min Stock (20%) ---
  const stockThresholds = useMemo(() => {
    if (!chartData.length) return { maxCapacity: 0, minStockLimit: 0 };

    // 1. Cari nilai stok tertinggi yang pernah tercatat (Asumsi: Kondisi Penuh)
    const maxRecordedStock = Math.max(
      ...chartData.map((d) => d.remainingStock)
    );

    // 2. Hitung 20% dari kapasitas penuh
    const minStockLimit = maxRecordedStock * 0.2;

    return { maxCapacity: maxRecordedStock, minStockLimit };
  }, [chartData]);

  // --- 4. LOGIC UPDATE: Last Stock (Seperti Last Refill) ---
  const latestStockInfo = useMemo(() => {
    if (!chartData.length) return { month: "-", value: 0 };

    // Cari data paling akhir (reverse) yang stoknya > 0
    // Ini menangani kasus jika bulan depan datanya masih 0/null
    const lastValidData = [...chartData]
      .reverse()
      .find((d) => d.remainingStock > 0);

    return {
      month: lastValidData ? lastValidData.month : "-",
      value: lastValidData ? lastValidData.remainingStock : 0,
    };
  }, [chartData]);

  // --- 5. Logic Summary (Balance & Refill) ---
  const summary = useMemo(() => {
    if (!chartData.length)
      return { balance: 0, lastRefill: "-", status: "Neutral" };

    const totalRefill = chartData.reduce((acc, curr) => acc + curr.refill, 0);
    const totalCons = chartData.reduce(
      (acc, curr) => acc + curr.consumption,
      0
    );
    const balance = totalRefill - totalCons;

    const lastRefillData = [...chartData].reverse().find((d) => d.refill > 0);

    return {
      balance,
      lastRefill: lastRefillData ? lastRefillData.month : "Belum ada",
      status: balance < 0 ? "Critical" : "Safe",
    };
  }, [chartData]);

  return (
    <Card className="w-full h-full shadow-lg border-none ring-1 ring-slate-200 flex flex-col">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Title Section */}
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Fuel className="w-4 h-4 text-blue-600" />
              Manajemen Stok & Isi Ulang BBM
            </CardTitle>
            <p className="text-sm text-muted-foreground italic ">
              Monitor volume pengisian, pemakaian, dan sisa stok.
            </p>
          </div>

          {/* Filters Section */}
          <div className="flex gap-2 flex-wrap">
            <Select value={meterId} onValueChange={setMeterId}>
              <SelectTrigger>
                <Gauge className="w-3 h-3 mr-2 text-slate-500" />
                <SelectValue placeholder="Pilih Meter" />
              </SelectTrigger>
              <SelectContent>
                {meterData?.map((m) => (
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

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <Calendar className="w-3 h-3 mr-2 text-slate-500" />
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024" className="text-xs">
                  2024
                </SelectItem>
                <SelectItem value="2025" className="text-xs">
                  2025
                </SelectItem>
                <SelectItem value="2026" className="text-xs">
                  2026
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[350px] flex flex-col justify-between">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-full rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
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
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}L`}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val: number) => [
                    `${val.toLocaleString("id-ID")} L`,
                  ]}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />

                <Bar
                  dataKey="consumption"
                  name="Volume Terpakai"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />

                <Bar
                  dataKey="refill"
                  name="Isi Ulang (Refill)"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />

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

                {/* Garis Batas Aman (20% Dynamic) */}
                <ReferenceLine
                  y={stockThresholds.minStockLimit}
                  label={{
                    position: "right",
                    value: `Min (${Math.round(
                      stockThresholds.minStockLimit
                    )}L)`,
                    fill: "#ef4444",
                    fontSize: 10,
                  }}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {!isLoading && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <RefreshCcw className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Analisis Logistik
                </p>
                <div className="text-xs text-slate-600 leading-relaxed mt-1">
                  <p>
                    Pengisian terakhir: <b>{summary.lastRefill}</b>.
                  </p>

                  <p className="mt-1">
                    Stok <b>{latestStockInfo.month}</b>:{" "}
                    <b>{latestStockInfo.value.toLocaleString("id-ID")} L</b>.
                    {latestStockInfo.value < stockThresholds.minStockLimit && (
                      <span className="text-red-600 font-bold ml-1">
                        (Di bawah 20% Kapasitas!)
                      </span>
                    )}
                  </p>

                  {summary.status === "Critical" ? (
                    <span className="text-amber-600 block mt-1">
                      ⚠️ Neraca Defisit: Pemakaian melebihi pengisian (Defisit{" "}
                      {Math.abs(summary.balance)}L).
                    </span>
                  ) : (
                    <span className="text-emerald-600 block mt-1">
                      ✅ Neraca Surplus: Supply chain aman.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
