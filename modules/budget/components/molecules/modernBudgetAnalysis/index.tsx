"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Coins, Download, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";

import { EnergyTypeName } from "@/common/types/energy";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { useDownloadImage } from "../../../../Dashboard/hooks/useDownloadImage";
import { useBudgetAnalytics } from "../../../hooks/useBudgetAnalytics";
import { KpiStats } from "./charts/kpiStats";
import { SavedChart, WaterfallChart } from "./charts/waterfallChart";
import { getEnergyIcon } from "./constants";

export const ModernBudgetAnalysis = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [energyTypeId, setEnergyTypeId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("burn");

  const years = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const { data: energyRes } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
    staleTime: Infinity,
  });
  const energyTypes = energyRes?.data || [];

  const { data, isLoading, isError, error } = useBudgetAnalytics(year, energyTypeId);

  const { download, isExporting, ref } = useDownloadImage<HTMLDivElement>();

  const selectedEnergyName = useMemo(() => {
    return energyTypes.find((e) => e.energy_type_id === energyTypeId)?.name || "Energy";
  }, [energyTypes, energyTypeId]);

  const handleDownload = () => download(`modern-budget-analysis-${selectedEnergyName}-${year}`);

  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            {/* SELECT TAHUN */}
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[130px] font-medium">
                <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* SELECT ENERGI (Dinamis dari Database) */}
            <Select value={String(energyTypeId)} onValueChange={(v) => setEnergyTypeId(Number(v))}>
              <SelectTrigger className="w-[160px] font-medium">
                <span className="mr-2">{getEnergyIcon(selectedEnergyName as EnergyTypeName)}</span>
                <SelectValue placeholder="Pilih Energi" />
              </SelectTrigger>
              <SelectContent>
                {energyTypes.map((e) => (
                  <SelectItem key={e.energy_type_id} value={String(e.energy_type_id)}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm"
            >
              Mode Analisis Tahunan
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid shrink-0 grid-cols-1 gap-4 md:grid-cols-3">
        <KpiStats
          totals={data?.totals} // Cukup passing begini saja
          isLoading={isLoading}
        />
      </div>

      <Card ref={ref} className="flex flex-1 flex-col overflow-hidden border-slate-200 shadow-md">
        <CardHeader className="bg-background/50 flex shrink-0 flex-col items-start justify-between gap-4 border-b px-6 py-4 sm:flex-row sm:items-center">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <div className="rounded-md bg-blue-100 p-1.5">
              <Coins className="h-4 w-4 text-blue-600" />
            </div>
            Analisis Penggunaan & Efisiensi
          </CardTitle>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
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
            {isLoading ? (
              // --- STATE 1: SEDANG LOADING ---
              <div className="flex h-full w-full flex-col gap-4">
                <Skeleton className="h-[80%] w-full rounded-xl" />
                <div className="flex h-[20%] gap-4">
                  <Skeleton className="h-full w-1/2 rounded-xl" />
                  <Skeleton className="h-full w-1/2 rounded-xl" />
                </div>
              </div>
            ) : !data ? (
              // --- STATE 2: DATA KOSONG ---
              <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                <SearchX className="mb-4 h-12 w-12 text-slate-400 opacity-50" />
                <h3 className="text-base font-bold text-slate-700">Data Belum Tersedia</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tidak ada rekam jejak anggaran untuk kombinasi tahun dan energi ini.
                </p>
              </div>
            ) : (
              // --- STATE 3: DATA ADA & BERHASIL ---
              <>
                {activeTab === "burn" ? (
                  <WaterfallChart data={data.charts.waterfallData} />
                ) : (
                  <SavedChart data={data.charts.savedData} totalSaved={data.totals.totalSaved} />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
