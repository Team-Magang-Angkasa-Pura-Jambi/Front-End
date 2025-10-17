"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerCrash } from "lucide-react";
import { getFuelStockAnalysisApi } from "@/services/analysis.service";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 text-sm bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-muted-foreground">
          Sisa Stok: {formatNumber(data.latest_stock_liters)} L
        </p>
        <p className="text-muted-foreground">
          Kapasitas: {formatNumber(data.tank_volume_liters)} L
        </p>
        <p className="font-bold text-primary">{data.percentage.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

const TankBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const radius = height / 2;

  return (
    <g>
      {/* Background/Kapasitas Penuh */}
      <rect
        x={x}
        y={y}
        width={props.background.width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
        className="opacity-20"
      />
      {/* Bar Stok Saat Ini */}
      <Rectangle {...props} radius={radius} />
    </g>
  );
};

export const FuelStockChart = () => {
  const [date] = useState(new Date());
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const {
    data: fuelStockData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["fuelStock", year, month],
    queryFn: () => getFuelStockAnalysisApi(year, month),
    staleTime: 1000 * 60 * 15, // 15 menit
  });

  const chartData = fuelStockData?.data || [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive">
          <ServerCrash className="w-8 h-8" />
          <p className="mt-2 text-sm">Gagal memuat data stok.</p>
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            Tidak ada data stok BBM.
          </p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="meter_code"
            width={80}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))" }}
            content={<CustomTooltip />}
          />
          <Bar
            dataKey="percentage"
            fill="#F97316" // orange-500
            barSize={24}
            shape={<TankBar />}
            background={{ fill: "#eee" }}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Sisa Stok BBM per Terminal</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full">{renderContent()}</CardContent>
    </Card>
  );
};
