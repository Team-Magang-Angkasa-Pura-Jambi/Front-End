"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

import { analysisApi } from "@/services/analysis.service";
import { getMetersApi } from "@/services/meter.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Impor komponen Select
import { AnalysisChartSkeleton } from "./analystChartSkeleton";

type MeterInfo = {
  meter_id: number;
  meter_code: string;
};

// Palet warna sekarang bisa lebih sederhana karena hanya ada beberapa garis statis
const COLORS = {
  pemakaian: "#3b82f6", // blue-500
  prediksi: "#22c55e", // green-500
  target: "#a1a1aa", // zinc-400
};

export const AnalysisChart = ({
  typeEnergy,
}: {
  typeEnergy: "Electricity" | "Water" | "Fuel";
}) => {
  const [thisMonth, setThisMonth] = useState(() => new Date());

  // PERBAIKAN: Gunakan string untuk state ID agar sesuai dengan komponen Select
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);

  const year = thisMonth.getFullYear();
  const month = String(thisMonth.getMonth() + 1).padStart(2, "0");
  const formattedMonth = `${year}-${month}`;

  // 1. Ambil daftar meter untuk mengisi dropdown
  const { data: metersData, isLoading: isMetersLoading } = useQuery({
    queryKey: ["meters", typeEnergy],
    queryFn: () => getMetersApi(typeEnergy),
    enabled: !!typeEnergy,
  });

  // 2. Ambil data analisis HANYA untuk meter yang dipilih
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError,
  } = useQuery({
    queryKey: ["analysisData", typeEnergy, formattedMonth, selectedMeterId],
    // API tetap menerima array, jadi kita konversi string ID ke number
    queryFn: () =>
      analysisApi(typeEnergy, formattedMonth, [Number(selectedMeterId!)]),
    enabled: !!selectedMeterId, // Hanya aktif jika ada meter yang dipilih
  });

  // Efek untuk mengisi daftar meter dan memilih meter pertama sebagai default
  useEffect(() => {
    const meters = metersData?.data;
    // PERBAIKAN: Logika disederhanakan. Jika meteran ada dan belum ada yang dipilih,
    // set meteran pertama sebagai default.
    if (meters && meters.length > 0 && !selectedMeterId) {
      // Konversi ke string saat menyimpan ke state
      setSelectedMeterId(String(meters[0].meter_id));
    }
  }, [metersData, selectedMeterId]); // Hapus selectedMeterId dari dependency untuk mencegah loop

  // Logika untuk mengubah data API (yang sekarang hanya berisi 1 meter) menjadi format grafik
  const chartData = useMemo(() => {
    if (!analysisData?.data || analysisData.data.length === 0) return [];

    // Karena API hanya mengembalikan data untuk 1 meter, kita ambil elemen pertama
    const meterTimeSeries = analysisData.data[0].data;

    return meterTimeSeries.map((record) => ({
      name: new Date(record.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      pemakaian: record.actual_consumption,
      prediksi: record.prediction,
      target: record.efficiency_target,
    }));
  }, [analysisData]);

  const isLoading = isMetersLoading || (isAnalysisLoading && !!selectedMeterId);

  if (isLoading) return <AnalysisChartSkeleton />;
  if (isError)
    return (
      <Card className="col-span-2 flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Gagal memuat data grafik.</p>
      </Card>
    );

  // Ambil data meter langsung dari hasil query, tidak perlu state terpisah
  const allMeters: MeterInfo[] = metersData?.data || [];
  const selectedMeterName =
    allMeters.find((m) => m.meter_id === Number(selectedMeterId))?.meter_code ||
    "";

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle>
            Analisis Pemakaian {typeEnergy}:{" "}
            <span className="text-primary">{selectedMeterName}</span>
          </CardTitle>
          {/* Ganti Checkbox dengan Dropdown */}
          <Select
            value={selectedMeterId ?? ""}
            onValueChange={(value) => setSelectedMeterId(value)}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Pilih Meter..." />
            </SelectTrigger>
            <SelectContent>
              {allMeters?.map((meter) => (
                <SelectItem key={meter.meter_id} value={String(meter.meter_id)}>
                  {meter.meter_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full sm:h-[350px]">
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
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />

              {/* Garis-garis sekarang statis karena hanya ada 1 set data */}
              <Line
                type="monotone"
                dataKey="pemakaian"
                name="Pemakaian Aktual"
                stroke={COLORS.pemakaian}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="prediksi"
                name="Prediksi Konsumsi"
                stroke={COLORS.prediksi}
                strokeWidth={2}
                // strokeDasharray="3 3"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target Efisiensi"
                stroke={COLORS.target}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
