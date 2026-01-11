"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import { Users, Calendar, CalendarDays, Download } from "lucide-react";

import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { EmptyData } from "@/common/components/EmptyData";
import { useDailyAveragePax } from "../../hooks/useDailyAveragePax";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { Button } from "@/common/components/ui/button";

export const DailyAveragePaxChart = () => {
  const { filters, options, data, status } = useDailyAveragePax();
  const { isLoading, isError, error } = status;

  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();
  const handleDownloadClick = () => {
    download(`Daily-Average-Pax.jpg`);
  };

  return (
    <Card
      ref={ref}
      className="flex h-full w-full flex-col border-none shadow-lg ring-1 ring-slate-200"
    >
      <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-slate-50 pb-4 xl:flex-row xl:items-center">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Users className="h-4 w-4 text-orange-500" />
            Rata-rata Kepadatan Penumpang
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm italic">
            Tren jumlah penumpang harian untuk validasi beban operasional.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 xl:w-auto">
          <Select value={filters.month} onValueChange={filters.setMonth}>
            <SelectTrigger>
              <CalendarDays className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {options.months.map((opt) => (
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

          <Select value={filters.year} onValueChange={filters.setYear}>
            <SelectTrigger>
              <Calendar className="mr-2 h-3 w-3 text-slate-500" />
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {options.years.map((opt) => (
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
          <Button
            disabled={isExporting || isLoading}
            variant="outline"
            size="icon"
            onClick={handleDownloadClick}
            title="Download JPG"
          >
            {isExporting ? (
              <span className="animate-pulse text-[10px]">...</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-[350px] flex-1 flex-col justify-between pt-6">
        {isLoading ? (
          /* State: Loading */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <Skeleton className="bg-background h-[200px] w-full rounded-xl" />
            <Skeleton className="h-4 w-1/2 rounded-full" />
          </div>
        ) : isError ? (
          /* State: Error */
          <ErrorFetchData message={error?.message} />
        ) : !data || data.length === 0 ? (
          /* State: Empty */
          <EmptyData
            title="Data Tidak Tersedia"
            description="Belum ada data penumpang untuk periode ini."
          />
        ) : (
          /* State: Success */
          <>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
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
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={(val) => `${val}`}
                    width={30}
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
                    stroke="#f97316"
                    dataKey="avgPax"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPax)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs leading-relaxed font-medium text-orange-800">
                <strong>Analisis Keputusan:</strong> Puncak penumpang umumnya
                terjadi di <b>Sabtu & Minggu</b>. Jika di hari tersebut konsumsi
                energi naik, itu wajar. Namun jika konsumsi naik tinggi di hari
                kerja yang sepi (misal: Selasa), maka <b>overcooling</b> atau
                pemborosan sedang terjadi.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
