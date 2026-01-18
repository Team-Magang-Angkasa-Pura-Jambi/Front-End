"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Calendar, Coins, Download } from "lucide-react";
import { Skeleton } from "@/common/components/ui/skeleton";
import { EnergyTypeName } from "@/common/types/energy";
import { useBudgetAnalytics } from "../../hooks/useBudgetAnalytics";
import { KpiStats } from "./charts/kpiStats";
import { SavedChart, WaterfallChart } from "./charts/waterfallChart";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { getEnergyIcon } from "./constants";
import { useDownloadImage } from "../../hooks/useDownloadImage";
import { Button } from "@/common/components/ui/button";
import { ComponentLoader } from "@/common/components/ComponentLoader";

export const ModernBudgetAnalysis = () => {
  const [year, setYear] = useState("2026");
  const [energyType, setEnergyType] = useState<EnergyTypeName>("Electricity");
  const [activeTab, setActiveTab] = useState("burn");

  const { data, isLoading, isError, error } = useBudgetAnalytics(
    year,
    energyType
  );

  const { download, isExporting, ref } = useDownloadImage<HTMLDivElement>();
  const handleDownload = () => download(`modren-budget-anlysis ${energyType}`);

  if (isLoading) {
    return <ComponentLoader />;
  }
  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[130px] font-medium">
                <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={energyType}
              onValueChange={(v: EnergyTypeName) => setEnergyType(v)}
            >
              <SelectTrigger className="w-[160px] font-medium">
                {getEnergyIcon(energyType)}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electricity">Listrik</SelectItem>
                <SelectItem value="Water">Air</SelectItem>
                <SelectItem value="Fuel">BBM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm"
            >
              Target Efisiensi: -10%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid shrink-0 grid-cols-1 gap-4 md:grid-cols-3">
        <KpiStats
          totals={
            data?.totals ?? {
              initial: 0,
              totalUsed: 0,
              totalSaved: 0,
              remaining: 0,
            }
          }
          isLoading={isLoading}
        />
      </div>

      <Card
        ref={ref}
        className="flex flex-1 flex-col overflow-hidden border-slate-200 shadow-md"
      >
        <CardHeader className="bg-background/50 flex shrink-0 flex-col items-start justify-between gap-4 border-b px-6 py-4 sm:flex-row sm:items-center">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <div className="rounded-md bg-blue-100 p-1.5">
              <Coins className="h-4 w-4 text-blue-600" />
            </div>
            Analisis Penggunaan & Efisiensi
          </CardTitle>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-[240px]">
              <TabsTrigger value="burn">Aliran Saldo</TabsTrigger>
              <TabsTrigger value="saved">Penghematan</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isExporting || isLoading}
            title="Download JPG"
          >
            {isExporting ? (
              <span className="text-[10px]">...</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>

        <CardContent className="relative min-h-[350px] flex-1 p-6">
          <div className="h-full w-full">
            {isLoading || !data ? (
              <div className="flex h-full w-full flex-col gap-4">
                <Skeleton className="h-[80%] w-full rounded-xl" />
                <div className="flex h-[20%] gap-4">
                  <Skeleton className="h-full w-1/2 rounded-xl" />
                  <Skeleton className="h-full w-1/2 rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                {activeTab === "burn" ? (
                  <WaterfallChart data={data.charts.waterfallData} />
                ) : (
                  <SavedChart
                    data={data.charts.savedData}
                    totalSaved={data.totals.totalSaved}
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
