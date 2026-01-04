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

import { analysisApi } from "@/services/analysis.service";
import { getMetersApi } from "@/services/meter.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { AnalysisChartSkeleton } from "./analystChartSkeleton";

type MeterInfo = {
  meter_id: number;
  meter_code: string;
};


const COLORS = {
  pemakaian: "#3b82f6", 
  prediksi: "#22c55e", 
  target: "#a1a1aa", 
};

export const AnalysisChart = ({
  typeEnergy,
}: {
  typeEnergy: "Electricity" | "Water" | "Fuel";
}) => {
  const [thisMonth, setThisMonth] = useState(() => new Date());

  
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);

  const year = thisMonth.getFullYear();
  const month = String(thisMonth.getMonth() + 1).padStart(2, "0");
  const formattedMonth = `${year}-${month}`;

  
  const { data: metersData, isLoading: isMetersLoading } = useQuery({
    queryKey: ["meters", typeEnergy],
    queryFn: () => getMetersApi(typeEnergy),
    enabled: !!typeEnergy,
  });

  
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError,
  } = useQuery({
    queryKey: ["analysisData", typeEnergy, formattedMonth, selectedMeterId],
    
    queryFn: () =>
      analysisApi(typeEnergy, formattedMonth, [Number(selectedMeterId!)]),
    enabled: !!selectedMeterId, 
  });

  
  useEffect(() => {
    const meters = metersData?.data;
    
    
    if (meters && meters.length > 0 && !selectedMeterId) {
      
      setSelectedMeterId(String(meters[0].meter_id));
    }
  }, [metersData, selectedMeterId]); 

  
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

  const isLoading = isMetersLoading || (isAnalysisLoading && !!selectedMeterId);

  if (isLoading) return <AnalysisChartSkeleton />;
  if (isError)
    return (
      <Card className="col-span-2 flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Gagal memuat data grafik.</p>
      </Card>
    );

  
  const allMeters: MeterInfo[] = metersData?.data || [];
  const selectedMeterName =
    allMeters.find((m) => m.meter_id === Number(selectedMeterId))?.meter_code ||
    "";

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle>
            Analisis Pemakaian {typeEnergy}:{" "}
            <span className="text-primary">{selectedMeterName}</span>
          </CardTitle>
          {/* Ganti Checkbox dengan Dropdown */}
          <Select
            value={selectedMeterId ?? ""}
            onValueChange={(value) => setSelectedMeterId(value)}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Pilih Meter..." />
            </SelectTrigger>
            <SelectContent>
              {allMeters?.map((meter) => (
                <SelectItem key={meter.meter_id} value={String(meter.meter_id)}>
                  {meter.meter_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full sm:h-[350px]">
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
                }}
              />
              <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />

              {/* Garis-garis sekarang statis karena hanya ada 1 set data */}
              <Line
                type="monotone"
                dataKey="pemakaian"
                name="Pemakaian Aktual"
                stroke={COLORS.pemakaian}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="prediksi"
                name="Prediksi Konsumsi"
                stroke={COLORS.prediksi}
                strokeWidth={2}
                
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target Efisiensi"
                stroke={COLORS.target}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
