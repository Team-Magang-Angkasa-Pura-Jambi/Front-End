"use client";

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";

import { ComponentLoader } from "@/common/components/ComponentLoader";
import { EmptyData } from "@/common/components/EmptyData";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { useEnergyQuery } from "@/modules/masterData/hooks/useEnergyQuery";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { formatToMwh } from "@/utils/formatKwh";
import { useQuery } from "@tanstack/react-query";
import { useAnalysisYearly } from "../../hooks/useAnalysisYearlyChart";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { getDashboardCardConfigApi } from "../../service/visualizations.service";

export const AnalysisYearlyChart = () => {
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const [energyId, setEnergyId] = useState<number | null>(null);

  const { useGetEnergies } = useEnergyQuery();
  const {
    data: energiesResponse,
    isLoading: isLoadingEnergies,
    isError: isErrorEnergies,
  } = useGetEnergies();

  const energies = useMemo(() => energiesResponse?.data || [], [energiesResponse]);

  const { data: configResponse } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
    staleTime: 1000 * 60 * 5,
  });

  const spendingConfig = (configResponse?.data?.config as any)?.yearly_spending;
  const widgetTitle = spendingConfig?.title || "Tren Pengeluaran Tahunan";

  useEffect(() => {
    if (energies.length > 0 && energyId === null) {
      if (spendingConfig?.default_energy_id) {
        const found = energies.find(
          (e: any) => e.energy_type_id === spendingConfig.default_energy_id
        );
        if (found) {
          setEnergyId(found.energy_type_id);
          return;
        }
      }
      setEnergyId(energies[0].energy_type_id);
    }
  }, [energies, energyId, spendingConfig]);

  const volumeUnit = useMemo(() => {
    if (!energyId || energies.length === 0) return "Unit";
    const selectedEnergy = energies.find((e: any) => e.energy_type_id === energyId);

    return selectedEnergy?.unit_standard || "Unit";
  }, [energyId, energies]);

  const {
    chartData,
    data,
    error,
    isError: isErrorChart,
    isLoading: isLoadingChart,
    summary,
  } = useAnalysisYearly(energyId ?? 0, Number(year));

  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const handleDownloadClick = () => {
    const selectedEnergyName =
      energies.find((e) => e.energy_type_id === energyId)?.name || "Energy";
    download(`Analysis-Yearly-${selectedEnergyName}-${year}.jpg`);
  };

  const formatYAxisVolume = useCallback((val: number) => `${formatToMwh(val)}`, []);
  const formatYAxisCost = useCallback((val: number) => `${formatCurrencySmart(val).full}`, []);

  if (isErrorEnergies || isErrorChart) {
    return <ErrorFetchData message={error?.message || "Gagal memuat data"} />;
  }

  const isInitializing = isLoadingEnergies || (energies.length > 0 && energyId === null);
  const isLoading = isInitializing || isLoadingChart;
  // const __isDataEmpty = !chartData || chartData.length === 0;

  return (
    <Card ref={ref} className="flex h-full w-full flex-col border-slate-200 shadow-md">
      <CardHeader className="flex flex-col items-start justify-between gap-4 pb-2 md:flex-row md:items-center">
        <div>
          <CardTitle className="text-lg font-bold">
            {widgetTitle} ({year})
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Analisis perbandingan konsumsi, biaya aktual, dan budget plan.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          {/* FILTER TAHUN */}
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <Calendar className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {["2024", "2025", "2026"].map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* FILTER ENERGI DINAMIS */}
          {isInitializing ? (
            <Skeleton className="h-8 w-[140px] rounded-md" />
          ) : (
            <Select
              value={energyId ? String(energyId) : ""}
              onValueChange={(value) => setEnergyId(Number(value))}
              disabled={energies.length === 0}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pilih Energi" />
              </SelectTrigger>
              <SelectContent>
                {energies.map((e: any) => {
                  const icon =
                    e.name === "Electricity"
                      ? "⚡ "
                      : e.name === "Water"
                        ? "💧 "
                        : e.name === "Fuel"
                          ? "⛽ "
                          : "";
                  return (
                    <SelectItem key={e.energy_type_id} value={String(e.energy_type_id)}>
                      {icon}
                      {e.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}

          {/* TOMBOL DOWNLOAD */}
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

      {/* RENDER KONTEN (Tanpa Layout Jitter) */}
      <CardContent className="flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex h-[400px] min-h-[350px] items-center justify-center">
            <ComponentLoader />
          </div>
        ) : !data || chartData.length === 0 ? (
          <div className="flex h-[400px] min-h-[350px] items-center justify-center">
            <EmptyData />
          </div>
        ) : (
          <>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />

                  <YAxis
                    yAxisId="left"
                    tickFormatter={formatYAxisVolume}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: `Volume (${volumeUnit})`,
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#94a3b8", fontSize: 11 },
                      dx: -10,
                    }}
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={formatYAxisCost}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Biaya (IDR)",
                      angle: 90,
                      position: "insideRight",
                      style: { fill: "#94a3b8", fontSize: 11 },
                      dx: 10,
                    }}
                  />

                  <Tooltip content={<CustomChartTooltip volumeUnit={volumeUnit} />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />

                  <Bar
                    yAxisId="left"
                    dataKey="consumption"
                    name="Volume Konsumsi"
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
                    name="Budget Plan"
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cost"
                    name="Biaya Aktual"
                    stroke="#0f172a"
                    strokeWidth={3}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 4, fill: "#0f172a", strokeWidth: 2, stroke: "#fff" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
      {summary && <YearlySummaryMetrics summary={summary} />}
      <CardFooter></CardFooter>
    </Card>
  );
};

const CustomChartTooltip = ({ active, payload, label, volumeUnit }: any) => {
  if (active && payload && payload.length) {
    const consumption = payload.find((p: any) => p.dataKey === "consumption")?.value || 0;
    const budget = payload.find((p: any) => p.dataKey === "budget")?.value || 0;
    const cost = payload.find((p: any) => p.dataKey === "cost")?.value || 0;

    const variance = budget - cost;
    const isOverBudget = variance < 0;

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="mb-2 border-b border-slate-100 pb-1 font-bold text-slate-700">{label}</p>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <div className="h-2 w-2 rounded-full bg-blue-500" /> Konsumsi:
            </span>
            <span className="font-semibold text-slate-700">
              {formatToMwh(consumption)} {volumeUnit}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <div className="h-2 w-2 rounded-full border-2 border-dashed border-red-500 bg-transparent" />{" "}
              Budget:
            </span>
            <span className="font-semibold text-slate-700">{formatCurrencySmart(budget).full}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <div className="h-2 w-2 rounded-full bg-slate-900" /> Aktual:
            </span>
            <span className="font-semibold text-slate-700">{formatCurrencySmart(cost).full}</span>
          </div>

          <div
            className={`mt-1 flex justify-between gap-4 border-t border-slate-100 pt-1 text-xs font-bold ${isOverBudget ? "text-red-600" : "text-emerald-600"}`}
          >
            <span>Selisih (Variance):</span>
            <span>
              {isOverBudget ? "-" : "+"}
              {formatCurrencySmart(Math.abs(variance)).full}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const YearlySummaryMetrics = ({ summary }: { summary: any }) => {
  return (
    <div className="bg-background mt-4 flex flex-col items-center justify-between gap-6 rounded-xl border border-slate-100 p-5 transition-all hover:shadow-sm xl:flex-row">
      <div className="flex w-full items-start gap-4 border-b border-slate-200 pb-4 xl:border-r xl:border-b-0 xl:pr-6 xl:pb-0">
        <div
          className={`shrink-0 rounded-full p-2.5 ${summary.isDeficit ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
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
            <span className={summary.isDeficit ? "text-red-600" : "text-emerald-600"}>
              {summary.isDeficit ? "Defisit Anggaran" : "Efisien & Terkendali"}
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {summary.isDeficit ? `Pengeluaran melebihi target sebesar ` : `Berhasil menghemat `}
            <span className="font-semibold text-slate-700">
              {formatCurrencySmart(summary.realizedSavings).full}
            </span>
            {summary.isDeficit ? ` dari anggaran berjalan.` : ` dari target anggaran berjalan.`}
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
        <div className="flex flex-col border-r border-slate-100 px-2">
          <p className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <TrendingUp className="h-3 w-3" /> Puncak
          </p>
          <p className="truncate text-sm font-bold text-slate-800">{summary.peakMonth}</p>
          <p className="mt-0.5 text-xs font-medium text-red-600">
            {formatCurrencySmart(summary.peakCost).full}
          </p>
        </div>

        <div className="flex flex-col border-r border-slate-100 px-2">
          <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {summary.isDeficit ? "Total Defisit" : "Total Hemat"}
          </p>
          <p
            className={`truncate text-sm font-bold ${summary.isDeficit ? "text-red-600" : "text-emerald-600"}`}
          >
            {summary.isDeficit ? "-" : "+"}
            {formatCurrencySmart(Math.abs(summary.realizedSavings)).val}
            <span className="ml-0.5 text-xs">
              {formatCurrencySmart(Math.abs(summary.realizedSavings)).unit}
            </span>
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">(Realized / YTD)</p>
        </div>

        <div className="flex flex-col border-r border-slate-100 px-2">
          <p className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <BarChart3 className="h-3 w-3" /> Rata-rata
          </p>
          <p className="truncate text-sm font-bold text-slate-800">
            {formatCurrencySmart(summary.avgCostYTD).full}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">Per Bulan</p>
        </div>

        <div className="flex flex-col px-2">
          <p className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <PieChart className="h-3 w-3" /> Serapan
          </p>
          <p
            className={`truncate text-sm font-bold ${summary.budgetUtilization > 100 ? "text-red-600" : "text-blue-600"}`}
          >
            {summary.budgetUtilization.toFixed(1)}%
          </p>
          <div className="bg-background mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full ${summary.budgetUtilization > 100 ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${Math.min(summary.budgetUtilization, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
