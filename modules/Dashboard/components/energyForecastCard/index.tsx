"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/common/components/ui/tabs";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Zap, Fuel, Droplets, Droplet, AlertCircle } from "lucide-react";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { useMultiEnergyForecast } from "../../hooks/useMultiEnergyForecast";
import { EmptyData } from "@/common/components/EmptyData";

export const MultiEnergyForecastCard = () => {
  const { isError, outlookData, error, isLoading } = useMultiEnergyForecast();

  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  if (!isLoading && !outlookData) {
    return <EmptyData />;
  }

  return (
    <Card className="col-span-12 overflow-hidden border-none shadow-md ring-1 ring-slate-200 md:col-span-4">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Prediksi Biaya Akhir Bulan
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {new Date().toLocaleString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </Badge>
        </div>
      </CardHeader>

      <Tabs defaultValue="electricity" className="w-full">
        <div className="p-3">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100/50">
            <TabsTrigger value="electricity" className="flex gap-1 text-[10px]">
              <Zap className="h-3 w-3 text-amber-500" /> Listrik
            </TabsTrigger>
            <TabsTrigger value="water" className="flex gap-1 text-[10px]">
              <Droplets className="h-3 w-3 text-blue-500" /> Air
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex gap-1 text-[10px]">
              <Fuel className="h-3 w-3 text-emerald-500" /> BBM
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="electricity" className="space-y-4 px-3 pt-2">
          <div className="min-h-[200px] space-y-3">
            {isLoading
              ? [1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))
              : outlookData?.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 p-3 transition-shadow hover:shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          {m.meter_code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">
                          {formatCurrencySmart(m.est).full}
                        </p>
                        {m.over > 100 ? (
                          <p className="text-[10px] font-bold text-red-500">
                            +{m.over - 100}% Over Budget
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-green-600">
                            Normal Usage
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          m.over > 100 ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(m.over, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="water" className="space-y-4 p-3">
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center">
            <div className="absolute -top-4 -right-4 text-blue-100/50">
              <Droplets className="h-24 w-24" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Droplet className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-blue-900">
                Modul Prediksi Air
              </h4>
              <p className="mx-auto mt-2 max-w-[200px] text-[11px] leading-relaxed text-blue-600/70">
                Algoritma sedang mempelajari pola aliran air. Estimasi akan
                tersedia dalam 7 hari kedepan.
              </p>
              <Badge className="mt-4 bg-blue-500 text-[9px] tracking-tighter uppercase hover:bg-blue-500">
                In Development
              </Badge>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="p-6 pt-2">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-8 text-center">
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Fuel className="h-6 w-6 text-slate-400 transition-transform group-hover:rotate-12" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">
                Analitik Bahan Bakar
              </h4>
              <div className="mt-3 flex flex-col gap-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="animate-shimmer h-full w-2/3 bg-slate-400 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    style={{ backgroundSize: "200% 100%" }}
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-400">
                  Progress Integrasi: 65%
                </p>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic">
                &quot;Menghubungkan sensor level tangki...&quot;
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
