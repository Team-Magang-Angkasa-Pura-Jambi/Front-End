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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const avgPaxData = [
  { day: "Sen", pax: 12500 },
  { day: "Sel", pax: 11800 },
  { day: "Rab", pax: 12200 },
  { day: "Kam", pax: 13000 },
  { day: "Jum", pax: 15500 }, // Mulai naik
  { day: "Sab", pax: 18000 }, // Peak Season
  { day: "Min", pax: 17500 }, // Peak Season
];

export const DailyAveragePaxChart = () => {
  return (
    <Card className="w-full h-full shadow-md border-none ring-1 ring-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          Rata-rata Kepadatan Penumpang (Daily Pax)
        </CardTitle>
        <p className="text-sm text-muted-foreground italic">
          Tren jumlah penumpang harian untuk validasi beban operasional.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={avgPaxData}
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
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(val) => `${val / 1000}rb`}
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
                dataKey="pax"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPax)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-xs text-orange-800 leading-relaxed font-medium">
            <strong>Analisis Keputusan:</strong> Puncak penumpang terjadi di
            hari <b>Sabtu & Minggu</b>. Jika di hari tersebut konsumsi
            air/listrik naik, maka itu dianggap wajar. Namun jika konsumsi naik
            di hari <b>Selasa</b> (saat penumpang paling sedikit), maka admin
            harus melakukan inspeksi pemborosan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
