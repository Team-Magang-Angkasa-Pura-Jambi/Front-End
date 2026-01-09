"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, AlertCircle, RefreshCcw } from "lucide-react";

// Data Dummy: Pencatatan sebulan sekali (saat isi ulang)
const fuelRefillData = [
  { month: "Jan", refill: 1000, consumption: 800 },
  { month: "Feb", refill: 0, consumption: 750 }, // Tidak isi ulang
  { month: "Mar", refill: 1200, consumption: 900 },
  { month: "Apr", refill: 0, consumption: 850 },
  { month: "Mei", refill: 1500, consumption: 1000 },
  { month: "Jun", refill: 0, consumption: 950 },
];

export const FuelRefillAnalysis = () => {
  return (
    <Card className="w-full h-full shadow-md border-none ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Fuel className="w-4 h-4 text-blue-600" />
              Manajemen Stok & Isi Ulang BBM
            </CardTitle>
            <p className="text-sm text-muted-foreground italic">
              Monitor volume pengisian bulanan vs pemakaian.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block uppercase">
              Stok Saat Ini
            </span>
            <span className="text-xl font-black text-blue-600">550 L</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={fuelRefillData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}L`}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />

              {/* Bar untuk Pemakaian */}
              <Bar
                dataKey="consumption"
                name="Volume Terpakai (L)"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />

              {/* Bar untuk Isi Ulang */}
              <Bar
                dataKey="refill"
                name="Volume Isi Ulang (L)"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />

              {/* Garis Batas Kritis (Threshold) */}
              <ReferenceLine
                y={400}
                label={{
                  position: "right",
                  value: "Reorder Point",
                  fill: "#ef4444",
                  fontSize: 10,
                }}
                stroke="#ef4444"
                strokeDasharray="3 3"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Keputusan Efisiensi/Operasional */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <RefreshCcw className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                Strategi Logistik
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pencatatan bulan <b>Mei</b> menunjukkan pengisian sebesar
                1.500L. Dengan rata-rata pemakaian harian, stok diprediksi akan
                menyentuh <b>Reorder Point</b> pada minggu ke-3 bulan Juli.
                Jadwalkan pengisian ulang sebelum tanggal 20.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
