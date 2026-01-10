import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
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
import { CHART_COLORS } from "../../../constants";
import { Badge } from "@/common/components/ui/badge";
import { TrendingDown } from "lucide-react";

export const WaterfallChart = ({ data }: { data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        fontSize={11}
        tick={{ fill: "#64748b" }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        fontSize={11}
        tickFormatter={(v) =>
          `Rp ${formatCurrencySmart(v).val} ${formatCurrencySmart(v).unit} `
        }
        tick={{ fill: "#64748b" }}
        // format={(val) => formatCurrencySmart(val).full}
      />
      <Tooltip
        cursor={{ fill: "transparent" }}
        contentStyle={{
          borderRadius: "8px",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        formatter={(value: number) => [
          formatCurrencySmart(value).full,
          "Nilai",
        ]}
      />
      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={CHART_COLORS[entry.type as keyof typeof CHART_COLORS]}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const SavedChart = ({
  data,
  totalSaved,
}: {
  data: { name: string; amount: number }[];
  totalSaved: number;
}) => (
  <div className="flex flex-col h-full w-full">
    <div className="flex justify-between items-end mb-4 px-2 shrink-0">
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Saved YTD
        </p>
        <h4 className="text-2xl font-black text-emerald-600">
          {formatCurrencySmart(totalSaved).full}
        </h4>
      </div>
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
        <TrendingDown className="w-3 h-3 mr-1" /> Efisiensi Positif
      </Badge>
    </div>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          // margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            fontSize={11}
            tick={{ fill: "#64748b" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={11}
            tick={{ fill: "#64748b" }}
            tickFormatter={(v) =>
              `Rp ${formatCurrencySmart(v).val} ${formatCurrencySmart(v).unit} `
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number) => [
              formatCurrencySmart(value).full,
              "Hemat",
            ]}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={CHART_COLORS.line}
            strokeWidth={3}
            dot={{
              r: 4,
              fill: CHART_COLORS.line,
              strokeWidth: 2,
              stroke: "#fff",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 shrink-0">
      💡 Insight: Penghematan terbesar didorong oleh optimasi penggunaan.
    </div>
  </div>
);
