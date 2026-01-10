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
import { EnergyOutlookApi } from "../../service/visualizations.service";

const formatCurrency = (val: number) => {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(0)}Jt`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(val);
};

export const MultiEnergyForecastCard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["energyOutlook"],
    queryFn: EnergyOutlookApi,
  });

  const outlookData = data?.data || [];

  const electricForecast = useMemo(() => outlookData, [outlookData]);

  if (isError)
    return (
      <Card className="col-span-12 md:col-span-4 border-red-200 bg-red-50 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-red-800">Gagal Memuat Prediksi</p>
      </Card>
    );

  return (
    <Card className="col-span-12  md:col-span-4 shadow-md border-none ring-1  ring-slate-200 overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Prediksi Biaya Akhir Bulan
          </CardTitle>
          <Badge variant="outline" className="bg-white text-[10px]">
            {new Date().toLocaleString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </Badge>
        </div>
      </CardHeader>

      <Tabs defaultValue="electricity" className="w-full">
        <div className="p-3 ">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100/50">
            <TabsTrigger value="electricity" className="flex gap-1 text-[10px]">
              <Zap className="w-3 h-3 text-amber-500" /> Listrik
            </TabsTrigger>
            <TabsTrigger value="water" className="flex gap-1 text-[10px]">
              <Droplets className="w-3 h-3 text-blue-500" /> Air
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex gap-1 text-[10px]">
              <Fuel className="w-3 h-3 text-emerald-500" /> BBM
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- TAB LISTRIK (REAL DATA) --- */}
        <TabsContent value="electricity" className="px-3 pt-2 space-y-4">
          <div className="space-y-3 min-h-[200px]">
            {isLoading
              ? [1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))
              : electricForecast.map((m, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {m.meter_code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">
                          {formatCurrency(m.est)}
                        </p>
                        {m.over > 100 ? (
                          <p className="text-[10px] text-red-500 font-bold">
                            +{m.over - 100}% Over Budget
                          </p>
                        ) : (
                          <p className="text-[10px] text-green-600 font-bold">
                            Normal Usage
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Progress bar dinamis berdasarkan nilai 'over' */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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

        {/* --- TAB AIR & BBM (KEEP DUMMY OR REUSE LOGIC) --- */}
        {/* --- TAB AIR --- */}
        <TabsContent value="water" className="p-3 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center">
            {/* Efek dekoratif di background */}
            <div className="absolute -right-4 -top-4 text-blue-100/50">
              <Droplets className="w-24 h-24" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 animate-pulse">
                <Droplet className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-blue-900">
                Modul Prediksi Air
              </h4>
              <p className="mx-auto mt-2 max-w-[200px] text-[11px] leading-relaxed text-blue-600/70">
                Algoritma sedang mempelajari pola aliran air. Estimasi akan
                tersedia dalam 7 hari kedepan.
              </p>
              <Badge className="mt-4 bg-blue-500 hover:bg-blue-500 text-[9px] uppercase tracking-tighter">
                In Development
              </Badge>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB BBM --- */}
        <TabsContent value="fuel" className="p-6 pt-2">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-8 text-center">
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Fuel className="w-6 h-6 text-slate-400 group-hover:rotate-12 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">
                Analitik Bahan Bakar
              </h4>
              <div className="mt-3 flex flex-col gap-1">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full w-2/3 bg-slate-400 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    style={{ backgroundSize: "200% 100%" }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
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
