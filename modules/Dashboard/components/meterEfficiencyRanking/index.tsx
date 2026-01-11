"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Activity,
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Button } from "@/common/components/ui/button";
import { useMeterEfficiencyRanking } from "../../hooks/useMeterEfficiencyRanking";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { getStatusConfig } from "../../constants";

export const MeterEfficiencyRanking = () => {
  const { ref, download, isExporting } = useDownloadImage<HTMLDivElement>();

  const { meters, statistics, isLoading, isError } =
    useMeterEfficiencyRanking();

  const handleDownload = async () => {
    download("meter-efficiency-rank");
  };

  return (
    <Card
      ref={ref}
      className="flex h-full flex-col border-none shadow-md ring-1 ring-slate-200"
    >
      <CardHeader className="flex flex-none flex-row items-center justify-between space-y-0 px-6 pt-6 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Activity className="h-4 w-4 text-blue-500" />
          Beban Konsumsi Per Meteran
        </CardTitle>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-2 text-slate-500 hover:text-blue-600"
            disabled={isExporting || isLoading}
            title="Download JPG"
          >
            {isExporting ? (
              <span className="text-[10px]">...</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

          <Badge variant="outline" className="text-xs font-normal">
            Real-time Sync
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 w-full flex-1 overflow-y-auto px-6">
        <div className="space-y-6">
          {isError && <ErrorFetchData />}
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            : meters.map((meter, idx) => {
                const statusCfg = getStatusConfig(meter.status);
                const isOver = meter.consumption > meter.budget;
                const percentage = Math.min(
                  (meter.consumption / meter.budget) * 100,
                  100
                );

                return (
                  <div key={idx} className="group">
                    <div className="mb-2 flex items-end justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-600">
                          {meter.code}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`flex items-center justify-end gap-1 text-sm font-black ${
                            isOver ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {formatCurrencySmart(meter.consumption).val}{" "}
                          <span className="text-[12px] font-normal text-slate-400">
                            {meter.unit_of_measurement}
                          </span>
                          {isOver && <ArrowUpRight className="h-3 w-3" />}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {`Limit: ${formatCurrencySmart(meter.budget).val}
                          ${meter.unit_of_measurement}`}
                        </p>
                      </div>
                    </div>

                    <div className="bg-background relative h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${statusCfg.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute top-0 right-0 z-10 h-full w-0.5 bg-slate-900 opacity-20" />
                    </div>
                  </div>
                );
              })}
        </div>

        {!isLoading && statistics && (
          <div className="mt-6 rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide uppercase">
                    Kesehatan Sistem Metering
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ringkasan status operasional seluruh perangkat
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  statistics.hasCritical
                    ? "border-red-100 bg-red-50 text-red-700"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                }`}
              >
                {statistics.hasCritical ? "Perlu Perhatian" : "Sistem Sehat"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100">
              <div className="px-2">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <Zap className="h-3 w-3" /> Total Unit
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {statistics.total}
                </p>
                <p className="text-[10px] text-slate-400">Terdaftar Aktif</p>
              </div>

              <div className="px-4">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <AlertTriangle className="h-3 w-3 text-red-500" /> Kritis
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.critical}
                </p>
                <p className="text-[10px] font-medium text-red-400">
                  Over Budget
                </p>
              </div>

              <div className="px-4">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Efisien
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {statistics.efficient}
                </p>
                <p className="text-[10px] font-medium text-emerald-500">
                  Terkendali
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-[10px] font-medium text-slate-500">
                <span>Rasio Efisiensi</span>
                <span>
                  {statistics.total > 0
                    ? Math.round(
                        (statistics.efficient / statistics.total) * 100
                      )
                    : 0}
                  %
                </span>
              </div>

              <div className="bg-background flex h-2.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${
                      statistics.total > 0
                        ? (statistics.efficient / statistics.total) * 100
                        : 0
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{
                    width: `${
                      statistics.total > 0
                        ? (statistics.critical / statistics.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {statistics.hasCritical && (
                <p className="mt-2 rounded border border-red-100 bg-red-50 py-1 text-center text-[10px] font-medium text-red-500">
                  {statistics.critical} meteran memerlukan peninjauan budget
                  atau audit teknis.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
