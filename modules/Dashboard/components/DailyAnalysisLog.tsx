"use client";
import {
  ChevronDown,
  Flame,
  Lightbulb,
  AlertTriangle,
  Zap,
  Droplet,
  Fuel,
  CheckCircle2,
  Loader2,
  ServerCrash,
} from "lucide-react"; // Pastikan ChevronDown diimpor
import { useQuery } from "@tanstack/react-query";
import React, { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getLogbooksApi } from "@/services/logbook.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const dayOptions = [
  { label: "Hari Ini", offset: 0 },
  { label: "Kemarin", offset: 1 },
  { label: "2 Hari Lalu", offset: 2 },
  { label: "3 Hari Lalu", offset: 3 },
];

const energyConfig = {
  Electricity: { icon: Zap, label: "Listrik" },
  Water: { icon: Droplet, label: "Air" },
  Fuel: { icon: Fuel, label: "BBM" },
};
export const DailyAnalysisLog = () => {
  const [dayOffset, setDayOffset] = useState(1); // Default: Kemarin
  const { startDate, endDate } = useMemo(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - dayOffset);
    const start = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();
    return { startDate: start, endDate: end };
  }, [dayOffset]);

  const {
    data: logbookData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["logbooks", startDate, endDate],
    queryFn: () => getLogbooksApi(startDate, endDate),
    select: (data) => data.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const selectedLabel =
    dayOptions.find((opt) => opt.offset === dayOffset)?.label || "Pilih Hari";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">Log Analisis Harian</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm text-gray-500">
              {selectedLabel}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {dayOptions.map((option) => (
              <DropdownMenuItem
                key={option.offset}
                onClick={() => setDayOffset(option.offset)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="text-center text-red-500 py-4">
            <ServerCrash className="mx-auto w-8 h-8 mb-2" />
            <p className="text-sm">Gagal memuat data log.</p>
          </div>
        ) : logbookData && logbookData?.length > 0 ? (
          logbookData.map((log) => {
            const isSavings = log.savings_value !== null;
            const energy = energyConfig[log.meter.energy_type.type_name];
            const Icon = isSavings ? CheckCircle2 : AlertTriangle;
            const iconColor = isSavings ? "text-green-500" : "text-red-500";
            const bgColor = isSavings ? "bg-green-100" : "bg-red-100";

            return (
              <div key={log.log_id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${bgColor}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {energy.label}: {isSavings ? "Penghematan" : "Pemborosan"}
                  </p>
                  <p className="text-gray-600 text-sm">{log.summary_notes}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-4 text-sm">
            Tidak ada analisis untuk tanggal yang dipilih.
          </p>
        )}
      </div>
    </div>
  );
};
