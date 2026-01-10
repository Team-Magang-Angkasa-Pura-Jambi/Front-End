"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import { MONTH_CONFIG } from "../constants";
import { getBudgetBurnRateApi } from "../service/visualizations.service";

export const BudgetBurnRateChart = () => {
  const currentDate = new Date();
  const [year, setYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  const [month, setMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["budget-burn-rate", year, month],
    queryFn: () => getBudgetBurnRateApi(parseInt(year), parseInt(month)),
  });

  const chartData = useMemo(() => apiResponse?.data || [], [apiResponse?.data]);

  const insight = useMemo(() => {
    if (!chartData.length) return null;

    const lastEntry = [...chartData].reverse().find((d) => d.actual > 0);

    if (!lastEntry) return null;

    const { actual, idea, efficent } = lastEntry;
    const diff = actual - idea;
    const isOverBudget = diff > 0;
    const percentage = idea > 0 ? ((diff / idea) * 100).toFixed(1) : "0";

    const isEfficient = actual <= efficent;

    return {
      day: lastEntry.dayDate,
      isOverBudget,
      percentage,
      isEfficient,
      diffVal: diff,
    };
  }, [chartData]);

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}jt`;
    return `${val / 1000}k`;
  };

  const formatTooltip = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="w-full shadow-lg border-none ring-1 ring-slate-200 flex flex-col">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-50 ">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Budget Burn Rate (Penyerapan Anggaran)
          </CardTitle>
          <p className="text-sm text-muted-foreground italic">
            Akumulasi pengeluaran harian vs Target Ideal & Efisiensi.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <CalendarDays className="w-3 h-3 mr-2 text-slate-500" />
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_CONFIG.map((opt) => (
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
      </CardHeader>

      <CardContent className="flex-1 min-h-[350px] flex flex-col justify-between">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-full rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Legend verticalAlign="top" iconType="circle" />
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
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
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  label={{
                    value: "Tgl",
                    position: "insideBottomRight",
                    offset: -5,
                    fontSize: 10,
                  }}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val: number) => formatTooltip(val)}
                />

                <Area
                  type="monotone"
                  dataKey="idea"
                  name="Budget Limit (Max)"
                  stroke="#94a3b8"
                  fill="transparent"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="efficent"
                  name="Target Efisiensi"
                  stroke="#10b981"
                  fill="transparent"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Realisasi (Actual)"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {!isLoading && insight && (
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            <div
              className={`px-2 rounded-xl border flex gap-3 items-center ${
                insight.isOverBudget
                  ? "bg-red-50 border-red-100"
                  : insight.isEfficient
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-blue-50 border-blue-100"
              }`}
            >
              {insight.isOverBudget ? (
                <AlertCircle className="w-8 h-8 text-red-600" />
              ) : insight.isEfficient ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <TrendingUp className="w-8 h-8 text-blue-600" />
              )}

              <div>
                <p
                  className={`text-sm font-bold ${
                    insight.isOverBudget
                      ? "text-red-900"
                      : insight.isEfficient
                      ? "text-emerald-900"
                      : "text-blue-900"
                  }`}
                >
                  {insight.isOverBudget
                    ? "Peringatan Over-Budget"
                    : insight.isEfficient
                    ? "Excellent Efficiency"
                    : "On Track"}
                </p>
                <p
                  className={`text-xs leading-relaxed ${
                    insight.isOverBudget
                      ? "text-red-700"
                      : insight.isEfficient
                      ? "text-emerald-700"
                      : "text-blue-700"
                  }`}
                >
                  Hingga tgl {insight.day}, penyerapan{" "}
                  {Math.abs(Number(insight.percentage))}%{" "}
                  {insight.isOverBudget ? "di atas" : "di bawah"} batas
                  maksimal.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-center">
              <DollarSign className="w-8 h-8 text-slate-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">Rekomendasi</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.isOverBudget
                    ? "Segera identifikasi kebocoran di area High Consumption. Batasi lembur."
                    : "Pertahankan pola operasional saat ini. Potensi penghematan tercapai."}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
