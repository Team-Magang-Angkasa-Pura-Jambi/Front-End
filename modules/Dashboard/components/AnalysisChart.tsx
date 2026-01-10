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
import { Lightbulb, AlertCircle, Activity } from "lucide-react";

import { analysisApi } from "@/services/analysis.service";
import { getMetersApi } from "@/modules/masterData/services/meter.service";

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
import { AnalysisChartSkeleton } from "./analystChartSkeleton";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";

const COLORS = {
  pemakaian: "#3b82f6",
  prediksi: "#22c55e",
  target: "#a1a1aa",
};

export const AnalysisChart = () => {
  // 1. Fetch Energy Types secara internal
  const { data: energyTypesResponse } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
    refetchOnWindowFocus: false,
  });

  const energyTypesData = useMemo(() => {
    return energyTypesResponse?.data;
  }, [energyTypesResponse]);

  const [typeEnergy, setTypeEnergy] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);

  // Set default energy type setelah data dimuat
  useEffect(() => {
    if (energyTypesData && energyTypesData.length > 0 && !typeEnergy) {
      setTypeEnergy(energyTypesData[0].type_name);
    }
  }, [energyTypesData, typeEnergy]);

  const monthOptions = useMemo(() => {
    const options = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const label = date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      options.push({ value: `${y}-${m}`, label });
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  }, []);

  const { data: metersData, isLoading: isMetersLoading } = useQuery({
    queryKey: ["meters", typeEnergy],
    queryFn: () => getMetersApi(typeEnergy as any),
    enabled: !!typeEnergy,
  });

  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError,
  } = useQuery({
    queryKey: ["analysisData", typeEnergy, selectedMonth, selectedMeterId],
    queryFn: () =>
      analysisApi(typeEnergy as any, selectedMonth, [Number(selectedMeterId!)]),
    enabled: !!selectedMeterId && !!selectedMonth,
  });

  useEffect(() => {
    const meters = metersData?.data;
    if (meters && meters.length > 0) {
      setSelectedMeterId(String(meters[0].meter_id));
    }
  }, [metersData]);

  const chartData = useMemo(() => {
    if (!analysisData?.data || analysisData.data.length === 0) return [];
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

  // 2. Logika Penulisan Insight Otomatis
  const insights = useMemo(() => {
    if (chartData.length === 0) return null;
    const lastData = chartData[chartData.length - 1];
    const isOverTarget = lastData.pemakaian > lastData.target;
    const efficiency = (
      ((lastData.target - lastData.pemakaian) / lastData.target) *
      100
    ).toFixed(1);

    if (isOverTarget) {
      return {
        type: "warning",
        text: `Konsumsi aktual saat ini melebihi target efisiensi. Periksa kembali beban operasional pada meter ini.`,
      };
    }
    return {
      type: "success",
      text: `Meter ini beroperasi sangat efisien, sekitar ${efficiency}% di bawah ambang batas target.`,
    };
  }, [chartData]);

  if (isMetersLoading || isAnalysisLoading) return <AnalysisChartSkeleton />;

  return (
    <Card className="col-span-1 shadow-md border-none ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Analisis Konsumsi Energi
          </CardTitle>

          <div className="flex gap-1">
            {/* Filter Tipe Energi */}
            <Select value={typeEnergy} onValueChange={setTypeEnergy}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe Energi" />
              </SelectTrigger>
              <SelectContent>
                {energyTypesData?.map((type: any) => (
                  <SelectItem key={type.energy_type_id} value={type.type_name}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Meter */}
            <Select
              value={selectedMeterId ?? ""}
              onValueChange={setSelectedMeterId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Meter" />
              </SelectTrigger>
              <SelectContent>
                {metersData?.data?.map((meter: any) => (
                  <SelectItem
                    key={meter.meter_id}
                    value={String(meter.meter_id)}
                  >
                    {meter.meter_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Bulan */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

                <YAxis tick={{ fontSize: 12 }} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",

                    border: "1px solid hsl(var(--border))",

                    borderRadius: "8px",
                  }}
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

        {/* --- CATATAN KAKI / INSIGHT --- */}
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
