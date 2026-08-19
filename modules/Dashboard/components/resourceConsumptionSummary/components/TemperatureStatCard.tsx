"use client";

import { Thermometer } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { MetricCardsResult } from "@/modules/Dashboard/service/visualizations.service";

const formatTemp = (value: number | undefined | null) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
};

const StatItem = ({ label, value, unit }: { label: string; value: string; unit: string }) => {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <p className="text-foreground text-2xl font-bold">{value}</p>
        <span className="text-muted-foreground text-sm font-normal">{unit}</span>
      </div>
    </div>
  );
};

export const TemperatureStatCard = ({ data }: { data: MetricCardsResult }) => {
  const weather = data?.overview_metrics?.weather;

  return (
    <Card className="h-full border-l-4 border-l-transparent transition-all hover:border-l-red-500/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
            Suhu & Cuaca (Live)
          </CardTitle>
          <CardAction>
            <div className="rounded-xl bg-red-100 p-2 text-red-600 shadow-sm dark:bg-red-500/20 dark:text-red-500">
              <Thermometer className="h-5 w-5" />
            </div>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="flex flex-grow flex-col justify-center pt-2 pb-6">
        <div className="grid w-full grid-cols-2 gap-6">
          <StatItem
            label="Rata-rata (24 Jam)"
            value={formatTemp(weather?.average_temp)}
            unit={weather?.unit ?? "°C"}
          />
          <StatItem
            label="Maksimum (24 Jam)"
            value={formatTemp(weather?.max_temp)}
            unit={weather?.unit ?? "°C"}
          />
        </div>
      </CardContent>
    </Card>
  );
};
