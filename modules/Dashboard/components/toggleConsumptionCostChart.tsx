"use client";
import React, { useState } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs"; // Menggunakan Shadcn Tabs

const mixedData = [
  {
    category: "Electricity",
    weekday_cons: 4200,
    holiday_cons: 3800, // Data Konsumsi (kWh)
    weekday_cost: 6300000,
    holiday_cost: 5700000, // Data Biaya (Rp)
    unit: "kWh",
  },
  {
    category: "Water",
    weekday_cons: 850,
    holiday_cons: 1250,
    weekday_cost: 1275000,
    holiday_cost: 1875000,
    unit: "m³",
  },
  {
    category: "Fuel",
    weekday_cons: 120,
    holiday_cons: 80,
    weekday_cost: 1800000,
    holiday_cost: 1200000,
    unit: "L",
  },
];

export const ToggleConsumptionCostChart = () => {
  // State untuk kontrol Toggle (view: 'consumption' atau 'cost')
  const [view, setView] = useState<"consumption" | "cost">("consumption");

  const isCost = view === "cost";

  const formatValue = (val: number) => {
    if (isCost) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val.toLocaleString("id-ID");
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-lg font-bold">
            Analisis Perbandingan Harian
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Hari Kerja vs Hari Libur
          </p>
        </div>

        {/* Tombol Toggle */}
        <Tabs
          value={view as string}
          onValueChange={(val) => setView(val as "consumption" | "cost")}
        >
          <TabsList className="grid w-[240px] grid-cols-2">
            <TabsTrigger value="consumption">Konsumsi</TabsTrigger>
            <TabsTrigger value="cost">Biaya (Rp)</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mixedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis
                tickFormatter={(val) => (isCost ? `Rp${val / 1000}k` : val)}
              />
              <Tooltip
                formatter={(value: number, name: string, props) => [
                  formatValue(value) + (isCost ? "" : ` ${props.payload.unit}`),
                  name === "weekday" ? "Hari Kerja" : "Hari Libur",
                ]}
              />
              <Legend />

              {/* DataKey dinamis berdasarkan State 'view' */}
              <Bar
                dataKey={isCost ? "weekday_cost" : "weekday_cons"}
                name="Hari Kerja"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey={isCost ? "holiday_cost" : "holiday_cons"}
                name="Hari Libur"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          <strong>Mode {isCost ? "Biaya" : "Konsumsi"}:</strong> Menampilkan
          data berdasarkan
          {isCost
            ? " total pengeluaran dalam Rupiah."
            : " volume penggunaan fisik alat."}
        </div>
      </CardContent>
    </Card>
  );
};
