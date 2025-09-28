"use client";
import { analysisApi, DailyRecord } from "@/services/analysis.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { AnalysisChartSkeleton } from "./analystChartSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActiveTab = "Water" | "Electricity" | "Fuel";

export const AnalysisChart = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Electricity");

  const [thisMonth, setThisMonth] = useState(() => new Date());

  const year = thisMonth.getFullYear();
  const month = String(thisMonth.getMonth() + 1).padStart(2, "0");
  const formattedMonth = `${year}-${month}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analysisData", activeTab, formattedMonth],

    queryFn: () => analysisApi(activeTab, formattedMonth),
  });

  const chartData = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((record) => ({
      name: new Date(record.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      pemakaian: record.actual_consumption
        ? record.actual_consumption / 100
        : null,
      target: record.efficiency_target ? record.efficiency_target / 100 : null,
      prediksi: record.actual_consumption
        ? record.actual_consumption / 100
        : null,
    }));
  }, [data]);

  if (isLoading) return <AnalysisChartSkeleton />;
  if (isError)
    return (
      <Card className="col-span-2 flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Gagal memuat data grafik.</p>
      </Card>
    );

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Analisis Pemakaian Sumber Daya</CardTitle>
          <div className="flex items-center border rounded-lg p-1 space-x-1">
            <button
              onClick={() => setActiveTab("Water")}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeTab === "Water"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              Air
            </button>
            <button
              onClick={() => setActiveTab("Electricity")}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeTab === "Electricity"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              Listrik
            </button>
            <button
              onClick={() => setActiveTab("Fuel")}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeTab === "Fuel"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              Fuel
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }} // Tambah margin kiri untuk label
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />

              {/* PERBAIKAN 2: Tambahkan label ke sumbu Y */}
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: "(dalam ratusan)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
                // Formatter untuk menampilkan nilai asli di tooltip
                formatter={(value: number) =>
                  (value * 100).toLocaleString("id-ID")
                }
              />
              <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="pemakaian"
                name="Pemakaian"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target Efisiensi"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="5 5"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="prediksi"
                name="Prediksi"
                stroke="#22c55e"
                strokeWidth={2}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
