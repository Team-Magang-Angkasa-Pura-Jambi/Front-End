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
import { EmptyData } from "@/common/components/EmptyData";
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

  if (!data) {
    return <EmptyData />;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[130px] font-medium">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
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
              className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3 text-xs font-semibold shadow-sm"
            >
              Target Efisiensi: -10%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <KpiStats totals={data?.totals} isLoading={isLoading} />
      </div>

      <Card
        ref={ref}
        className="flex-1 flex flex-col overflow-hidden shadow-md border-slate-200"
      >
        <CardHeader className="px-6 py-4 border-b bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Coins className="w-4 h-4 text-blue-600" />
            </div>
            Analisis Penggunaan & Efisiensi
          </CardTitle>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full sm:w-[240px] grid-cols-2">
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
              <Download className="w-4 h-4" />
            )}
          </Button>
        </CardHeader>

        <CardContent className="p-6 flex-1 min-h-[350px] relative">
          <div className="w-full h-full">
            {isLoading || !data ? (
              <div className="w-full h-full flex flex-col gap-4">
                <Skeleton className="w-full h-[80%] rounded-xl" />
                <div className="flex gap-4 h-[20%]">
                  <Skeleton className="w-1/2 h-full rounded-xl" />
                  <Skeleton className="w-1/2 h-full rounded-xl" />
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
