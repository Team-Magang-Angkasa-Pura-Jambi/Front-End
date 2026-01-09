"use client";

import React, { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Calendar, CalendarDays, Building2, Plane } from "lucide-react";
import { getEfficiencyRatioApi } from "../service/visualizations.service";
import { MONTH_CONFIG } from "../constants";

export const EfficiencyRatioChart = () => {
  const currentDate = new Date();
  const [year, setYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  const [month, setMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );

  // --- FETCH DATA ---
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["efficiency-ratio", year, month],
    queryFn: () => getEfficiencyRatioApi(parseInt(year), parseInt(month)),
  });

  const chartData = apiResponse?.data || [];

  return (
    <Card className="w-full shadow-lg border-none ring-1 ring-slate-200">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Profil Efisiensi Mingguan
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Rata-rata penggunaan energi berdasarkan hari (Senin - Minggu).
          </p>
        </div>

        {/* --- FILTER --- */}
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[130px] h-9">
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
            <SelectTrigger className="w-[100px] h-9">
              <Calendar className="w-3 h-3 mr-2 text-slate-500" />
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-[300px] w-full rounded-xl bg-slate-100" />
            </div>
          ) : (
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
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  }}
                  // FORMATTER TOOLTIP: 2 Angka Belakang Koma
                  formatter={(value: number, name: string) => [
                    Number(value).toFixed(2),
                    name,
                  ]}
                />
                <Legend verticalAlign="top" height={36} />

                {/* --- SUMBU KIRI (Office) --- */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#94a3b8"
                  axisLine={false}
                  tickLine={false}
                  // FORMATTER AXIS: 2 Angka Belakang Koma
                  tickFormatter={(val) => `${Number(val).toFixed(2)} kWh`}
                  width={80} // Tambah lebar agar angka tidak terpotong
                  label={{
                    value: "Office (Total kWh)",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "#94a3b8",
                      fontSize: 10,
                    },
                  }}
                />

                {/* --- SUMBU KANAN (Terminal) --- */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f97316"
                  axisLine={false}
                  tickLine={false}
                  // FORMATTER AXIS: 2 Angka Belakang Koma
                  tickFormatter={(val) => Number(val).toFixed(2)}
                  label={{
                    value: "Terminal (kWh/Pax)",
                    angle: 90,
                    position: "insideRight",
                    style: {
                      textAnchor: "middle",
                      fill: "#f97316",
                      fontSize: 10,
                    },
                  }}
                />

                {/* GRAFIK 1: Office */}
                <Bar
                  yAxisId="left"
                  dataKey="officeRatio"
                  name="Office Load (Rata-rata kWh)"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />

                {/* GRAFIK 2: Terminal */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="terminalRatio"
                  name="Terminal Efficiency (kWh/Pax)"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#f97316",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Insight Box */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex gap-3">
            <div className="p-2 h-fit bg-white rounded-lg shadow-sm">
              <Plane className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Efisiensi Terminal
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Grafik garis (Oranye) menunjukkan kWh per penumpang. Jika garis{" "}
                <strong>naik tajam</strong> di hari sepi (Selasa/Rabu), berarti
                AC Terminal berlebih (Overcooling).
              </p>
            </div>
          </div>

          <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
            <div className="p-2 h-fit bg-white rounded-lg shadow-sm">
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Pola Beban Kantor
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Grafik batang (Abu-abu) adalah beban murni kantor. Pastikan
                batang <strong>Sabtu & Minggu rendah</strong> (mendekati 0 atau
                beban standby). Jika tinggi, ada pemborosan di hari libur.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
