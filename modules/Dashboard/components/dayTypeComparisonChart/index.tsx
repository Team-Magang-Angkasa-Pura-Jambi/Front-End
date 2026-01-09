"use client";

import React, { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Droplets, Fuel, Calendar, CalendarDays } from "lucide-react";

import { ENERGY_TYPES } from "@/common/types/energy";
import { getUnifiedComparisonApi } from "../../service/visualizations.service";
import { MONTH_CONFIG } from "../../constants";

export const UnifiedEnergyComparisonChart = () => {
  const [view, setView] = useState<"consumption" | "cost">("consumption");
  const isCost = view === "cost";

  const currentDate = new Date();
  const [year, setYear] = useState<string>(
    currentDate.getFullYear().toString()
  );

  const [month, setMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );

  const results = useQueries({
    queries: [
      {
        queryKey: ["comparison", ENERGY_TYPES.ELECTRICITY, year, month],
        queryFn: () =>
          getUnifiedComparisonApi(
            ENERGY_TYPES.ELECTRICITY,
            parseInt(year),
            parseInt(month)
          ),
      },
      {
        queryKey: ["comparison", ENERGY_TYPES.WATER, year, month],
        queryFn: () =>
          getUnifiedComparisonApi(
            ENERGY_TYPES.WATER,
            parseInt(year),
            parseInt(month)
          ),
      },
      {
        queryKey: ["comparison", ENERGY_TYPES.FUEL, year, month],
        queryFn: () =>
          getUnifiedComparisonApi(
            ENERGY_TYPES.FUEL,
            parseInt(year),
            parseInt(month)
          ),
      },
    ],
  });

  const isLoading = results.some((r) => r.isLoading);

  const allEnergyData = useMemo(() => {
    return results
      .map((r) => r.data?.data)
      .filter((d) => !!d)
      .map((d) => ({
        category: d.category,
        unit: d.unit,
        weekday_cons: d.weekday_cons,
        holiday_cons: d.holiday_cons,
        weekday_cost: d.weekday_cost,
        holiday_cost: d.holiday_cost,
      }));
  }, [results]);

  const formatValue = (val: number, unit: string) => {
    if (isCost) {
      if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
      return `Rp ${val.toLocaleString("id-ID")}`;
    }
    return `${val.toLocaleString("id-ID")} ${unit}`;
  };

  return (
    <Card className="w-full shadow-lg border-none ring-1 ring-slate-200">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Analisis Konsumsi & Biaya: Workday vs Holiday
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Perbandingan efisiensi operasional bulanan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <CalendarDays className="w-3 h-3 mr-2 text-slate-500" />
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_CONFIG.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
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
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Tabs
            value={view}
            onValueChange={(val) => setView(val as "consumption" | "cost")}
          >
            <TabsList className="grid w-[180px] grid-cols-2 h-9">
              <TabsTrigger value="consumption" className="text-xs">
                Volume
              </TabsTrigger>
              <TabsTrigger value="cost" className="text-xs">
                Biaya
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="h-[350px] w-full min-h-[300px]">
          {isLoading ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-[280px] w-full rounded-xl bg-slate-100" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={allEnergyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={12}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => {
                    if (isCost) return `${val / 1000000}jt`;
                    return val >= 1000 ? `${val / 1000}k` : val;
                  }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number, name: string, props) => [
                    formatValue(value, props.payload.unit),
                    name === (isCost ? "weekday_cost" : "weekday_cons")
                      ? "Hari Kerja"
                      : "Hari Libur",
                  ]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />

                <Bar
                  dataKey={isCost ? "weekday_cost" : "weekday_cons"}
                  name="Rata-rata Hari Kerja"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={50}
                />
                <Bar
                  dataKey={isCost ? "holiday_cost" : "holiday_cons"}
                  name="Rata-rata Hari Libur"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {!isLoading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {allEnergyData.map((item) => {
              const valWeekday = isCost ? item.weekday_cost : item.weekday_cons;
              const valHoliday = isCost ? item.holiday_cost : item.holiday_cons;

              const diff =
                valWeekday === 0
                  ? 0
                  : ((valHoliday - valWeekday) / valWeekday) * 100;
              const isHigher = diff > 0;

              return (
                <div
                  key={item.category}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-3 text-slate-600">
                    {item.category === "Electricity" && (
                      <Zap className="w-3 h-3" />
                    )}
                    {item.category === "Water" && (
                      <Droplets className="w-3 h-3" />
                    )}
                    {item.category === "Fuel" && <Fuel className="w-3 h-3" />}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span
                      className={`text-xl font-black ${
                        isHigher ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {Math.abs(diff).toFixed(1)}%
                    </span>
                    <Badge
                      className={
                        isHigher
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-green-100 text-green-700 hover:bg-green-100"
                      }
                    >
                      {isHigher ? "Naik saat Libur" : "Turun saat Libur"}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic leading-tight">
                    {isHigher
                      ? `Perlu pengecekan beban ekstra saat peak season/libur.`
                      : `Efisiensi tercapai dengan penurunan beban operasional.`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
