"use client";

import React, { useRef, useState, useMemo } from "react";
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, AlertCircle, Calendar } from "lucide-react";
import { downloadElementAsJpg } from "@/utils/exportImage";
import { toast } from "sonner";
import { ENERGY_TYPES, EnergyTypeName } from "@/common/types/energy";
import { getYearlyAnalysisApi } from "../../service/visualizations.service";

export const AnalysisYearlyChart = () => {
  const [energyType, setEnergyType] = useState<EnergyTypeName>(
    ENERGY_TYPES.ELECTRICITY
  );

  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["yearlyAnalysis", energyType, year],
    queryFn: () => getYearlyAnalysisApi(energyType, parseInt(year)),
  });

  const chartData = data?.data || [];

  const volumeUnit = useMemo(() => {
    switch (energyType) {
      case "Electricity":
        return "kWh";
      case "Water":
        return "m³";
      case "Fuel":
        return "L";
      default:
        return "Unit";
    }
  }, [energyType]);

  const formatIDR = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      await downloadElementAsJpg(cardRef, {
        fileName: `Analysis-Yearly-${energyType}-${year}.jpg`,
      });
      toast.success("Gambar berhasil diunduh");
    } catch (error) {
      toast.error("Gagal mengunduh gambar");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card ref={cardRef} className="w-full h-full shadow-md border-slate-200">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-lg font-bold">
            Tren Pengeluaran Tahunan ({year})
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Analisis perbandingan konsumsi, biaya aktual, dan budget plan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* FILTER: TAHUN */}
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <Calendar className="w-3 h-3 mr-2 text-slate-500" />
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          {/* FILTER: TIPE ENERGI */}
          <Select
            value={energyType}
            onValueChange={(value) => setEnergyType(value as EnergyTypeName)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Energi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electricity">⚡ Listrik</SelectItem>
              <SelectItem value="Water">💧 Air</SelectItem>
              <SelectItem value="Fuel">⛽ BBM</SelectItem>
            </SelectContent>
          </Select>

          {/* TOMBOL DOWNLOAD */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isExporting || isLoading}
            className="h-9 px-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            title="Download JPG"
          >
            {isExporting ? (
              <span className="text-xs">Saving...</span>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[450px] w-full min-h-[400px]">
          {isLoading ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-[350px] w-full rounded-xl bg-slate-100" />
              <div className="flex gap-4 w-full justify-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ) : isError ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-xl">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>Gagal memuat data grafik.</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p>Tidak ada data tersedia untuk periode ini.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />

                {/* Y-Axis Kiri: Volume */}
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: `Volume (${volumeUnit})`,
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "#94a3b8",
                      fontSize: 11,
                    },
                    dx: -10,
                  }}
                />

                {/* Y-Axis Kanan: Biaya */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1_000_000}jt`}
                  label={{
                    value: "Biaya (IDR)",
                    angle: 90,
                    position: "insideRight",
                    style: {
                      textAnchor: "middle",
                      fill: "#94a3b8",
                      fontSize: 11,
                    },
                    dx: 10,
                  }}
                />

                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "consumption")
                      return [
                        `${value.toLocaleString()} ${volumeUnit}`,
                        "Volume",
                      ];
                    if (name === "budget")
                      return [formatIDR(value), "Budget Plan"];
                    if (name === "cost")
                      return [formatIDR(value), "Biaya Aktual"];
                    return [value, name];
                  }}
                />

                <Legend verticalAlign="top" height={36} iconType="circle" />

                <Bar
                  yAxisId="left"
                  dataKey="consumption"
                  name="consumption"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  stroke="#3b82f6"
                />

                <Line
                  yAxisId="right"
                  type="stepAfter"
                  dataKey="budget"
                  name="budget"
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  dot={false}
                  strokeWidth={2}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  name="cost"
                  stroke="#0f172a"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#0f172a",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
