"use client";

import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { cn } from "@/lib/utils";

import { EnergyTypeName } from "@/common/types/energy";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { HistoryFilters } from "../types";

interface RecapHeaderProps {
  filters: HistoryFilters;
  setFilters: React.Dispatch<React.SetStateAction<HistoryFilters>>;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  UNDER_MAINTENANCE: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
  DELETED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
};

export const RecapHeader: React.FC<RecapHeaderProps> = ({ filters, setFilters }) => {
  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["metersForRecap", filters.type],
    queryFn: () => getMetersApi(filters.meterId),
    staleTime: 1000 * 60 * 5,
  });

  const meters = useMemo(() => metersResponse?.data.meter || [], [metersResponse]);

  const handleTypeChange = (value: string) => {
    const newType = value as EnergyTypeName;
    setFilters((prev) => ({
      ...prev,
      type: newType,
      meterId: undefined,
    }));
  };

  useEffect(() => {
    if (!isLoadingMeters && meters.length > 0 && !filters.meterId) {
      setFilters((prev) => ({ ...prev, meterId: meters[0].meter_id }));
    }
  }, [meters, filters.meterId, isLoadingMeters, setFilters]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDateDisplay = (date: Date) => {
    return formatInTimeZone(date, "Asia/Jakarta", "d MMM yyyy", { locale: id });
  };

  return (
    <Card className="border-l-primary border-l-4 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          {/* TITLE SECTION */}
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">Riwayat Data</CardTitle>
            <CardDescription className="text-sm">
              Pantau detail pemakaian energi berdasarkan kategori, meteran, dan waktu.
            </CardDescription>
          </div>

          {/* TABS KATEGORI (Dipindah ke Header agar hirarki lebih jelas) */}
          <Tabs value={filters.type} onValueChange={handleTypeChange} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 md:w-[300px]">
              <TabsTrigger value="Electricity">Listrik</TabsTrigger>
              <TabsTrigger value="Water">Air</TabsTrigger>
              <TabsTrigger value="Fuel">BBM</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* FILTER 1: METER SELECTION */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Pilih Meteran
            </label>
            <Select
              value={filters.meterId?.toString()}
              onValueChange={(val) => setFilters((prev) => ({ ...prev, meterId: Number(val) }))}
              disabled={isLoadingMeters}
            >
              <SelectTrigger className="bg-background hover:border-primary/50 focus:ring-primary/20 h-11 w-full font-medium transition-all">
                {isLoadingMeters ? (
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Memuat data...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Pilih Meteran" />
                )}
              </SelectTrigger>
              <SelectContent>
                {meters.length === 0 ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center py-6 text-center text-sm">
                    <p>Tidak ada meteran tersedia</p>
                  </div>
                ) : (
                  meters.map((meter) => (
                    <SelectItem
                      key={meter.meter_id}
                      value={meter.meter_id.toString()}
                      className="cursor-pointer py-3"
                    >
                      <div className="flex w-full items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">{meter.meter_code}</span>
                          <span className="text-muted-foreground text-[10px]">
                            {meter.name || "Meteran Umum"}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "pointer-events-none h-5 px-2 text-[10px] font-medium capitalize",
                            STATUS_STYLES[meter.status] || STATUS_STYLES.INACTIVE
                          )}
                        >
                          {meter.status.toLowerCase().replace("_", " ")}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* FILTER 2: DATE RANGE PICKER */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Periode Laporan
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "hover:border-primary/50 hover:bg-background focus:ring-primary/20 h-11 w-full justify-start text-left font-normal transition-all",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                  {filters.date?.from ? (
                    <span className="text-foreground font-medium">
                      {formatDateDisplay(filters.date.from)}
                      {filters.date.to ? (
                        <>
                          <span className="text-muted-foreground mx-2">-</span>
                          {formatDateDisplay(filters.date.to)}
                        </>
                      ) : null}
                    </span>
                  ) : (
                    <span>Pilih rentang tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto border-none bg-transparent p-0 shadow-none"
                align="start"
              >
                <div className="bg-card rounded-lg border shadow-xl">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.date?.from}
                    selected={filters.date}
                    onSelect={(range) => {
                      setFilters((prev) => ({ ...prev, date: range }));
                    }}
                    numberOfMonths={2}
                    className="p-3"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
