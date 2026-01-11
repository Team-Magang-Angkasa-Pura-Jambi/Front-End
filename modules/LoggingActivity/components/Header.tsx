"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { id } from "date-fns/locale";

import { formatInTimeZone } from "date-fns-tz";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { CalendarIcon } from "lucide-react";
import { HistoryFilters } from "../types";
import { EnergyTypeName } from "@/common/types/energy";

interface RecapHeaderProps {
  filters: HistoryFilters;
  setFilters: React.Dispatch<React.SetStateAction<RecapHeaderProps["filters"]>>;
}

export const RecapHeader: React.FC<RecapHeaderProps> = ({
  filters,
  setFilters,
}) => {
  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["metersForRecap", filters.type],
    queryFn: () => getMetersApi(filters.type),
  });

  const meters = useMemo(
    () => metersResponse?.data || [],
    [metersResponse?.data]
  );

  const handleFilterChange = useCallback(
    <K extends keyof RecapHeaderProps["filters"]>(
      key: K,
      value: RecapHeaderProps["filters"][K]
    ) => {
      setFilters((prev) => {
        if (key === "type") {
          return {
            ...prev,
            type: value,
            meterId: undefined,
          } as HistoryFilters;
        }

        return {
          ...prev,
          [key]: value,
        };
      });
    },
    [setFilters]
  );

  useEffect(() => {
    if (
      meters.length > 0 &&
      !isLoadingMeters &&
      (filters.meterId === null || filters.meterId === undefined)
    ) {
      handleFilterChange("meterId", meters[0].meter_id);
    }
  }, [meters, isLoadingMeters, filters.meterId, handleFilterChange]);

  const statusStyles = {
    Active: "",
    UnderMaintenance: "bg-amber-500 text-white",
    Inactive: "bg-background0 text-white",
    Deleted: "bg-red-500 text-white",
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Data</CardTitle>
          <CardDescription>
            Pilih jenis data, meteran, dan periode untuk melihat rekap
            pemakaian.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <div className="flex w-full flex-col flex-wrap gap-2 sm:flex-row">
            <Tabs
              value={filters.type as unknown as string}
              onValueChange={(value) =>
                handleFilterChange("type", value as unknown as EnergyTypeName)
              }
            >
              <TabsList>
                <TabsTrigger value="Electricity">Listrik</TabsTrigger>
                <TabsTrigger value="Water">Air</TabsTrigger>
                <TabsTrigger value="Fuel">BBM</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select
              value={filters.meterId ? String(filters.meterId) : "all-meters"}
              onValueChange={(value) =>
                handleFilterChange(
                  "meterId",
                  value === "all-meters" ? null : Number(value)
                )
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Pilih Meter..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingMeters ? (
                  <div className="text-muted-foreground p-4 text-center text-sm">
                    Memuat...
                  </div>
                ) : (
                  <>
                    <SelectItem value="all-meters">Pilih Meter</SelectItem>
                    {meters.map((meter) => (
                      <SelectItem
                        key={meter.meter_id}
                        value={String(meter.meter_id)}
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                          statusStyles[meter.status]
                        )}
                      >
                        {meter.meter_code}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            <Popover>
              {" "}
              {/* Filter Tanggal */}
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-[280px]",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date?.from ? (
                    filters.date.to ? (
                      <>
                        {formatInTimeZone(
                          filters.date.from,
                          "Asia/Jakarta",
                          "d LLL, y",
                          { locale: id }
                        )}{" "}
                        -{" "}
                        {formatInTimeZone(
                          filters.date.to,
                          "Asia/Jakarta",
                          "d LLL, y",
                          { locale: id }
                        )}
                      </>
                    ) : (
                      formatInTimeZone(
                        filters.date.from,
                        "Asia/Jakarta",
                        "d LLL, y",
                        { locale: id }
                      )
                    )
                  ) : (
                    <span>Pilih periode</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.date?.from}
                  selected={filters.date}
                  onSelect={(date) => handleFilterChange("date", date)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
