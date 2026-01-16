"use client";

import React, { useState } from "react";
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
import {
  Download,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  BarChart3,
} from "lucide-react";
import { ENERGY_TYPES, EnergyTypeName } from "@/common/types/energy";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { ComponentLoader } from "@/common/components/ComponentLoader";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { useAnalysisYearly } from "../../hooks/useAnalysisYearlyChart";

export const AnalysisYearlyChart = () => {
  const [energyType, setEnergyType] = useState<EnergyTypeName>(
    ENERGY_TYPES.ELECTRICITY
  );

  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const { chartData, data, error, isError, isLoading, summary, volumeUnit } =
    useAnalysisYearly(energyType, Number(year));

  const handleDownloadClick = () => {
    download(`Analysis-Yearly-${energyType}-${year}.jpg`);
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
      className="flex h-full w-full flex-col border-slate-200 shadow-md"
    >
      <CardHeader className="flex flex-col items-start justify-between gap-4 pb-2 md:flex-row md:items-center">
        <div>
          <CardTitle className="text-lg font-bold">
            Tren Pengeluaran Tahunan ({year})
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Analisis perbandingan konsumsi, biaya aktual, dan budget plan.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
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

          <Select
            value={energyType}
            onValueChange={(value) => setEnergyType(value as EnergyTypeName)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih Energi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electricity">⚡ Listrik</SelectItem>
              <SelectItem value="Water">💧 Air</SelectItem>
              <SelectItem value="Fuel">⛽ BBM</SelectItem>
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
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <div className="h-[400px] min-h-[350px] w-full">
          {isLoading ? (
            <ComponentLoader />
          ) : isError ? (
            <ErrorFetchData message={error?.message} />
          ) : chartData.length === 0 ? (
            <EmptyData />
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

                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) =>
                    `${formatCurrencySmart(val).val} ${volumeUnit}`
                  }
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

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${formatCurrencySmart(val).full}`}
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
                      return [
                        `${formatCurrencySmart(value).val} ${
                          formatCurrencySmart(value).unit
                        }`,
                        "Budget Plan",
                      ];
                    if (name === "cost")
                      return [
                        `${formatCurrencySmart(value).val} ${
                          formatCurrencySmart(value).unit
                        }`,
                        "Biaya Aktual",
                      ];
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
        {!isLoading && summary && (
          <div className="bg-background mt-4 flex flex-col items-center justify-between gap-6 rounded-xl border border-slate-100 p-5 transition-all hover:shadow-sm xl:flex-row">
            <div className="flex w-full items-start gap-4 border-b border-slate-200 pb-4 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-6">
              <div
                className={`shrink-0 rounded-full p-2.5 ${
                  summary.isDeficit
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {summary.isDeficit ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <CheckCircle2 className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">
                  Status:{" "}
                  <span
                    className={
                      summary.isDeficit ? "text-red-600" : "text-emerald-600"
                    }
                  >
                    {summary.isDeficit
                      ? "Defisit Anggaran"
                      : "Efisien & Terkendali"}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {summary.isDeficit
                    ? `Pengeluaran melebihi target sebesar `
                    : `Berhasil menghemat `}
                  <span className="font-semibold text-slate-700">
                    {formatCurrencySmart(summary.realizedSavings).full}
                  </span>
                  {summary.isDeficit
                    ? ` dari anggaran berjalan.`
                    : ` dari target anggaran berjalan.`}
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-2">
              <div className="flex flex-col border-r border-slate-100 px-2 last:border-0">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <TrendingUp className="h-3 w-3 text-slate-400" />
                  Puncak
                </p>
                <p className="truncate text-sm font-bold text-slate-800">
                  {summary.peakMonth}
                </p>
                <p className="mt-0.5 text-xs font-medium text-red-600">
                  {formatCurrencySmart(summary.peakCost).full}
                </p>
              </div>

              <div className="flex flex-col border-r border-slate-100 px-2 last:border-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {summary.isDeficit ? "Total Defisit" : "Total Hemat"}
                </p>
                <p
                  className={`truncate text-sm font-bold ${
                    summary.isDeficit ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {summary.isDeficit ? "-" : "+"}
                  {formatCurrencySmart(Math.abs(summary.realizedSavings)).val}
                  <span className="ml-0.5 text-xs">
                    {
                      formatCurrencySmart(Math.abs(summary.realizedSavings))
                        .unit
                    }
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                  (Realized / YTD)
                </p>
              </div>

              <div className="flex flex-col border-r border-slate-100 px-2 last:border-0">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <BarChart3 className="h-3 w-3 text-slate-400" />
                  Rata-rata
                </p>
                <p className="truncate text-sm font-bold text-slate-800">
                  {formatCurrencySmart(summary.avgCostYTD).full}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                  Per Bulan
                </p>
              </div>

              <div className="flex flex-col px-2">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <PieChart className="h-3 w-3 text-slate-400" />
                  Serapan
                </p>
                <p
                  className={`truncate text-sm font-bold ${
                    summary.budgetUtilization > 100
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {summary.budgetUtilization.toFixed(1)}%
                </p>
                <div className="bg-background mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      summary.budgetUtilization > 100
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.min(summary.budgetUtilization, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
