"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnergyData {
  energyType: string;
  totalCost: {
    currentValue: number;
  };
}

interface EnergyDistributionChartProps {
  data: EnergyData[];
}

const COLORS = {
  Electricity: "#FBBF24", // amber-400
  Water: "#38BDF8", // sky-400
  Fuel: "#F97316", // orange-500
};

const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const percent = total > 0 ? (payload[0].value / total) * 100 : 0;
    return (
      <div className="p-2 text-sm bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-muted-foreground">{`Biaya: ${new Intl.NumberFormat(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }
        ).format(payload[0].value)}`}</p>
        <p className="text-muted-foreground">{`Persentase: ${percent.toFixed(
          1
        )}%`}</p>
      </div>
    );
  }

  return null;
};

export const EnergyDistributionChart = ({
  data,
}: EnergyDistributionChartProps) => {
  const chartData = data.map((item) => ({
    name: item.energyType,
    value: item.totalCost.currentValue,
  }));

  const totalCost = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.value, 0),
    [chartData]
  );

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Distribusi Biaya Energi</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full">
        {chartData.length > 0 && totalCost > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const radius =
                    innerRadius + (outerRadius - innerRadius) * 1.4;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="currentColor"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="text-xs font-medium"
                    >{`${(percent * 100).toFixed(0)}%`}</text>
                  );
                }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      COLORS[entry.name as keyof typeof COLORS] || "#8884d8"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => (
                  <CustomTooltip
                    active={active}
                    payload={payload}
                    total={totalCost}
                  />
                )}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-xs text-muted-foreground">
              Tidak ada data biaya.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
