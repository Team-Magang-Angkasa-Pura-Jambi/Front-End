"use client";
import React from "react";
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
import { Lightbulb, AlertCircle, Activity, Download } from "lucide-react";

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

import { useTrenConsump } from "../../hooks/useTrenConsump";
import { ComponentLoader } from "@/common/components/ComponentLoader";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { Button } from "@/common/components/ui/button";

const COLORS = {
  pemakaian: "#3b82f6",
  prediksi: "#22c55e",
  target: "#a1a1aa",
};

export const AnalysisChart = () => {
  const { data, filters, options, status } = useTrenConsump();

  const { chartData, insights } = data;
  const { isLoading, isError, error } = status;

  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const handleDownloadClick = () => {
    download(`trent-consympt-${filters.typeEnergy}.jpg`);
  };
  if (isLoading) {
    return <ComponentLoader />;
  }
  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  if (!data) {
    return <EmptyData />;
  }
  return (
    <Card
      ref={ref}
      className="col-span-12 lg:col-span-8 shadow-md border-none ring-1 ring-slate-200"
    >
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Analisis Konsumsi Energi
          </CardTitle>

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
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isError || chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-xl bg-slate-50">
            <p className="text-muted-foreground text-sm">
              Data tidak tersedia untuk kombinasi filter ini.
            </p>
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />

                <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `${val} ${options.volumeUnit} `}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",

                    border: "1px solid hsl(var(--border))",

                    borderRadius: "8px",
                  }}
                  formatter={(val) => `${val} ${options.volumeUnit}`}
                />

                <Legend
                  wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }}
                />

                <Line
                  type="monotone"
                  dataKey="pemakaian"
                  name="Aktual"
                  stroke={COLORS.pemakaian}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
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
        )}

        {insights && (
          <div
            className={`p-4 rounded-xl flex gap-3 items-start ${
              insights.type === "warning"
                ? "bg-amber-50 border border-amber-100"
                : "bg-emerald-50 border border-emerald-100"
            }`}
          >
            {insights.type === "warning" ? (
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            ) : (
              <Lightbulb className="w-5 h-5 text-emerald-600 mt-0.5" />
            )}
            <div>
              <p
                className={`text-sm font-bold ${
                  insights.type === "warning"
                    ? "text-amber-800"
                    : "text-emerald-800"
                }`}
              >
                AI Insight
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  insights.type === "warning"
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {insights.text}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
