import { EmptyData } from "@/common/components/EmptyData";
import { Badge } from "@/common/components/ui/badge";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "../../../../../Dashboard/constants";

export const WaterfallChart = ({
  data,
}: {
  data: { name: string; value: number; type: string }[] | undefined;
}) => {
  // Logic: Jika data tidak ada atau array kosong, tampilkan EmptyData
  if (!data || data.length === 0) {
    return <EmptyData />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          fontSize={11}
          tick={{ fill: "#64748b" }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          fontSize={11}
          width={50}
          tick={{ fill: "#64748b" }}
          tickFormatter={(v) => {
            const f = formatCurrencySmart(v);
            return `${f.val} ${f.unit}`.trim();
          }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          formatter={(value: number | undefined) => [formatCurrencySmart(value ?? 0).full, "Nilai"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[entry.type as keyof typeof CHART_COLORS] || "#cbd5e1"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SavedChart = ({
  data,
  totalSaved,
}: {
  data: { name: string; amount: number }[] | undefined;
  totalSaved: number;
}) => {
  // Mengecek apakah penghematan positif atau over-budget (negatif)
  const isPositive = totalSaved >= 0;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4 flex shrink-0 items-end justify-between px-2">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Saved YTD
          </p>
          <h4 className={`text-2xl font-black ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {formatCurrencySmart(totalSaved).full}
          </h4>
        </div>
        <Badge
          variant="secondary"
          className={isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}
        >
          {isPositive ? (
            <TrendingDown className="mr-1 h-3 w-3" />
          ) : (
            <TrendingUp className="mr-1 h-3 w-3" />
          )}
          {isPositive ? "Efisiensi Positif" : "Over Budget"}
        </Badge>
      </div>

      <div className="min-h-0 w-full flex-1">
        {/* Cek data untuk SavedChart juga untuk keamanan */}
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                fontSize={11}
                tick={{ fill: "#64748b" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={11}
                width={50}
                tick={{ fill: "#64748b" }}
                tickFormatter={(v) => {
                  // Diformat ringkas agar tidak terpotong (e.g., 10 Jt)
                  const f = formatCurrencySmart(v);
                  return `${f.val} ${f.unit}`.trim();
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number | undefined) => [
                  formatCurrencySmart(value ?? 0).full,
                  "Hemat",
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={isPositive ? CHART_COLORS.line : "#ef4444"} // Warna garis menyesuaikan performa
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: isPositive ? CHART_COLORS.line : "#ef4444",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyData />
        )}
      </div>

      <div className="bg-background mt-2 shrink-0 rounded-lg border border-slate-100 p-3 text-[11px] text-slate-600">
        💡 Insight:{" "}
        {isPositive
          ? "Penghematan berjalan dengan baik. Teruskan optimasi penggunaan!"
          : "Peringatan! Penggunaan anggaran saat ini melebihi target efisiensi. Perlu dilakukan peninjauan ulang."}
      </div>
    </div>
  );
};
