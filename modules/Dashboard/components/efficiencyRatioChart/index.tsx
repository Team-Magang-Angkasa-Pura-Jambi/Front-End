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
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Zap,
  Calendar,
  CalendarDays,
  Building2,
  Plane,
  Download,
} from "lucide-react";
import { MONTH_CONFIG } from "../../constants";
import { ComponentLoader } from "@/common/components/ComponentLoader";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { useEfficiencyRatio } from "../../hooks/useEfficiencyRatio";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { Button } from "@/common/components/ui/button";

export const EfficiencyRatioChart = () => {
  const currentDate = new Date();

  const [year, setYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  const [month, setMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const handleDownloadClick = () => {
    download(`Efficiency-Ratio-${year}-${month}.jpg`);
  };
  const { chartData, error, isError, isLoading } = useEfficiencyRatio(
    year,
    month
  );

  if (isLoading) {
    return <ComponentLoader />;
  }
  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  if (!chartData) {
    return <EmptyData />;
  }

  return (
    <Card
      ref={ref}
      className="w-full border-none shadow-lg ring-1 ring-slate-200"
    >
      <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-slate-50 pb-4 md:flex-row md:items-center">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Zap className="h-4 w-4 text-orange-500" />
            Profil Efisiensi Mingguan
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Rata-rata penggunaan energi berdasarkan hari (Senin - Minggu).
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-9 w-[130px]">
              <CalendarDays className="mr-2 h-3 w-3 text-slate-500" />
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
            <SelectTrigger className="h-9 w-[100px]">
              <Calendar className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
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

      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
              <Skeleton className="bg-background h-[300px] w-full rounded-xl" />
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

                <Bar
                  yAxisId="left"
                  dataKey="officeRatio"
                  name="Office Load (Rata-rata kWh)"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />

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

        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <div className="flex flex-1 gap-3 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
            <div className="h-fit rounded-lg p-2 shadow-sm">
              <Plane className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Efisiensi Terminal
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Grafik garis (Oranye) menunjukkan kWh per penumpang. Jika garis{" "}
                <strong>naik tajam</strong> di hari sepi (Selasa/Rabu), berarti
                AC Terminal berlebih (Overcooling).
              </p>
            </div>
          </div>

          <div className="bg-background flex flex-1 gap-3 rounded-xl border border-slate-100 p-4">
            <div className="h-fit rounded-lg p-2 shadow-sm">
              <Building2 className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Pola Beban Kantor
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
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
