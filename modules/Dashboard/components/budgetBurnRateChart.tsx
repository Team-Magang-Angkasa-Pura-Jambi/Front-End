"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertCircle, DollarSign } from "lucide-react";

// Data Akumulasi Harian (Burn Rate)
const burnRateData = [
  { day: 1, actual: 10, ideal: 10 },
  { day: 5, actual: 55, ideal: 50 },
  { day: 10, actual: 120, ideal: 100 },
  { day: 15, actual: 210, ideal: 150 }, // Mulai menjauh (Over-burn)
  { day: 20, actual: 300, ideal: 200 },
  { day: 25, actual: null, ideal: 250 }, // Masa depan (Prediksi)
  { day: 30, actual: null, ideal: 300 },
];

export const BudgetBurnRateChart = () => {
  return (
    <Card className="w-full shadow-lg border-none ring-1 ring-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Budget Burn Rate (Penyerapan Anggaran)
        </CardTitle>
        <p className="text-sm text-muted-foreground italic">
          Memantau akumulasi pengeluaran harian terhadap target bulanan.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={burnRateData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="day"
                label={{
                  value: "Hari ke-",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis tickFormatter={(val) => `Rp${val}jt`} />
              <Tooltip formatter={(val: number) => `Rp ${val} Juta`} />
              <Legend verticalAlign="top" align="right" />

              {/* Garis Ideal (Linear) */}
              <Area
                type="monotone"
                dataKey="ideal"
                name="Budget Ideal (Linear)"
                stroke="#94a3b8"
                fill="#f1f5f9"
                strokeDasharray="5 5"
              />

              {/* Garis Aktual (Burn Rate) */}
              <Area
                type="monotone"
                dataKey="actual"
                name="Akumulasi Aktual"
                stroke="#059669"
                fillOpacity={0.1}
                fill="#10b981"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Actionable Insight */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3 items-center">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Peringatan Over-Budget
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Hingga hari ke-20, penyerapan budget <b>40% lebih cepat</b> dari
                rencana. Diperlukan efisiensi operasional segera.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex gap-3 items-center">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Saran Keputusan
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Tunda kegiatan maintenance alat berat yang memakan daya besar
                hingga awal bulan depan untuk menjaga cashflow.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
