"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, CalendarDays } from "lucide-react";

import { MONTH_CONFIG } from "../../constants";
import { getDailyAveragePaxApi } from "../../service/visualizations.service";

export const DailyAveragePaxChart = () => {
  const currentDate = new Date();
  const [year, setYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  const [month, setMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["daily-average-pax", year, month],
    queryFn: () => getDailyAveragePaxApi(parseInt(year), parseInt(month)),
  });

  const chartData = useMemo(() => apiResponse?.data || [], [apiResponse?.data]);

  return (
    <Card className="w-full h-full shadow-lg border-none ring-1 ring-slate-200 flex flex-col">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Rata-rata Kepadatan Penumpang
          </CardTitle>
          <p className="text-sm text-muted-foreground italic">
            Tren jumlah penumpang harian untuk validasi beban operasional.
          </p>
        </div>

        {/* --- FILTER SECTION --- */}
        <div className="flex flex-wrap gap-2">
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

      <CardContent className="flex-1 min-h-[350px] pt-3 flex flex-col justify-between">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-full rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => `${val.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val: number) => [
                    `${val.toLocaleString("id-ID")} Orang`,
                    "Rata-rata Pax",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="avgPax"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPax)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-xs text-orange-800 leading-relaxed font-medium">
            <strong>Analisis Keputusan:</strong> Puncak penumpang umumnya
            terjadi di <b>Sabtu & Minggu</b>. Jika di hari tersebut konsumsi
            energi naik, itu wajar. Namun jika konsumsi naik tinggi di hari
            kerja yang sepi (misal: Selasa), maka <b>overcooling</b> atau
            pemborosan sedang terjadi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
