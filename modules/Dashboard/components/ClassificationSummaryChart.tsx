"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClassificationSummaryApi } from "@/services/analysis.service";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerCrash } from "lucide-react";

const COLORS = {
  HEMAT: "#22C55E", // green-500
  NORMAL: "#64748B", // slate-500
  BOROS: "#EF4444", // red-500
};

const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const percent = total > 0 ? (payload[0].value / total) * 100 : 0;
    return (
      <div className="p-2 text-sm bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="font-bold">{`Klasifikasi: ${payload[0].name}`}</p>
        <p className="text-muted-foreground">{`Jumlah: ${payload[0].value} hari`}</p>
        <p className="text-muted-foreground">{`Persentase: ${
          percent ? percent.toFixed(1) : "0.0"
        }%`}</p>
      </div>
    );
  }
  return null;
};

const GroupClassificationChart = ({
  title,
  data,
  isLoading,
  isError,
}: {
  title: string;
  data: any;
  isLoading: boolean;
  isError: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-semibold text-sm text-center text-gray-700">
        {title}
      </h4>
      <div className="h-[250px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-[140px] w-[140px] rounded-full" />
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-destructive">
            <ServerCrash className="h-6 w-6" />
            <p className="mt-2 text-xs">Gagal memuat.</p>
          </div>
        ) : !data || data.totalDaysWithClassification === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Tidak ada data.</p>
          </div>
        ) : (
          <>
            {(() => {
              const chartData = [
                { name: "HEMAT", value: data.HEMAT },
                { name: "NORMAL", value: data.NORMAL },
                { name: "BOROS", value: data.BOROS },
              ].filter((d) => d.value > 0);
              const totalValue = chartData.reduce((s, e) => s + e.value, 0);

              return (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        labelLine={false}
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
                          const x =
                            cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y =
                            cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="currentColor"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              className="text-xs font-medium"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={COLORS[entry.name as keyof typeof COLORS]}
                            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => (
                          <CustomTooltip
                            active={active}
                            payload={payload}
                            total={totalValue}
                          />
                        )}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold">
                      {data.totalDaysWithClassification}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Total Hari
                    </span>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export const ClassificationSummaryChart = () => {
  const [date] = useState(new Date());
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const {
    data: classificationData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["classificationSummary", year, month, "Electricity"],
    queryFn: () => getClassificationSummaryApi(year, month, "Electricity"),
  });

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Ringkasan Klasifikasi Listrik Bulan Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x">
          <div className="pt-4 md:pt-0">
            <GroupClassificationChart
              title="Terminal"
              data={classificationData?.data?.terminal}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
          <div className="pt-4 md:pt-0 md:pl-6">
            <GroupClassificationChart
              title="Kantor"
              data={classificationData?.data?.kantor}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
