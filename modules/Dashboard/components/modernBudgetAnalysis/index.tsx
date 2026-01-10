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
import { Calendar, Coins, AlertCircle } from "lucide-react";
import { Skeleton } from "@/common/components/ui/skeleton";
import { EnergyTypeName } from "@/common/types/energy";
import { useBudgetAnalytics } from "../../hooks/useBudgetAnalytics";
import { KpiStats } from "./charts/kpiStats";
import { SavedChart, WaterfallChart } from "./charts/waterfallChart";

// Import Hooks & Sub-Components

export const ModernBudgetAnalysis = () => {
  const [year, setYear] = useState("2026");
  const [energyType, setEnergyType] = useState<EnergyTypeName>("Electricity");
  const [activeTab, setActiveTab] = useState("burn");

  // Logic dipindah ke Custom Hook
  const { data, isLoading, isError } = useBudgetAnalytics(year, energyType);

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Gagal memuat data anggaran.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 rounded-xl shadow-sm border bg-white">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px] font-bold">
              <Calendar className="w-4 h-4 mr-2" />
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
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electricity">⚡ Listrik</SelectItem>
              <SelectItem value="Water">💧 Air</SelectItem>
              <SelectItem value="Fuel">⛽ BBM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 py-1 px-3 whitespace-nowrap"
        >
          Target Efisiensi: -10%
        </Badge>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiStats totals={data?.totals} isLoading={isLoading} />
      </div>

      {/* CHART SECTION */}
      <Card className="border-none shadow-md ring-1 ring-slate-200 overflow-hidden flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-white/50 px-4 py-3 shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Coins className="w-4 h-4 text-slate-500" />
            Analisis Penggunaan & Efisiensi
          </CardTitle>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-2 h-8 w-[200px]">
              <TabsTrigger value="burn" className="text-xs">
                Aliran Saldo
              </TabsTrigger>
              <TabsTrigger value="saved" className="text-xs">
                Penghematan
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-4 flex-1 min-h-0">
          <div className="h-full w-full min-h-[300px]">
            {isLoading || !data ? (
              <Skeleton className="w-full h-full rounded-lg" />
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
