"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  Loader2,
  FileDown,
  RotateCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { exportToExcel, exportToPdf } from "@/lib/exportUtils";
import { companyLogoBase64 } from "@/lib/logo";
import { getMetersApi } from "@/services/meter.service";
import type { RecapMeta, Meter } from "../type"; // Impor tipe yang relevan
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recalculateRecapApi } from "@/services/recap.service";

// --- Tipe Props ---
interface RecapHeaderProps {
  filters: {
    type: "Electricity" | "Water" | "Fuel";
    date: DateRange | undefined;
    sortBy: "cost" | "date";
    sortOrder: "asc" | "desc";
    meterId: number | null | undefined;
  };
  setFilters: React.Dispatch<React.SetStateAction<RecapHeaderProps["filters"]>>;
  isFetching: boolean;
  dataToExport: any[];
  columns: ColumnDef<any, any>[];
  summary: RecapMeta | undefined;
}

export const RecapHeader: React.FC<RecapHeaderProps> = ({
  filters,
  setFilters,
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // --- Pengambilan Data & Penanganan API ---
  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["metersForRecap", filters.type],
    queryFn: () => getMetersApi(filters.type),
  });
  // Ekstrak array dari respons API dengan aman.
  const meters: Meter[] = metersResponse?.data || [];

  // --- Fungsi Filter ---
  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      setFilters((prev) => {
        if (key === "type") {
          return { ...prev, type: value, meterId: null };
        }
        return { ...prev, [key]: value };
      });
    },
    [setFilters]
  );

  // --- Efek Samping untuk Mengatur Nilai Default ---
  useEffect(() => {
    if (
      meters.length > 0 &&
      !isLoadingMeters &&
      (filters.meterId === null || filters.meterId === undefined)
    ) {
      handleFilterChange("meterId", meters[0].meter_id);
    }
  }, [meters, isLoadingMeters, filters.meterId, handleFilterChange]);

  // --- Logika untuk Opsi Ekspor PDF ---
  const generateSubtitle = () => {
    const { from, to } = filters.date || {};
    if (from && to) {
      return `Periode: ${format(from, "d MMM yyyy", { locale: id })} - ${format(
        to,
        "d MMM yyyy",
        { locale: id }
      )}`;
    }
    return "Semua Periode";
  };

  const [pdfOptions, setPdfOptions] = useState({
    title: `Laporan Rekap ${filters.type}`,
    subtitle: generateSubtitle(),
    headerColor: "#2F5597",
  });

  useEffect(() => {
    setPdfOptions((prev) => ({
      ...prev,
      title: `Laporan Rekap ${filters.type}`,
      subtitle: generateSubtitle(),
    }));
  }, [filters.type, filters.date]);

  const { mutate: recalculate, isPending: isRecalculating } = useMutation({
    mutationFn: () => {
      if (!filters.date?.from || !filters.date?.to) {
        return Promise.reject(
          new Error("Tanggal mulai dan selesai wajib diisi.")
        );
      }
      return recalculateRecapApi({
        startDate: format(filters.date.from, "yyyy-MM-dd"),
        endDate: format(filters.date.to, "yyyy-MM-dd"),
        meterId: filters.meterId,
      });
    },
    onSuccess: () => {
      toast.success("Perhitungan ulang rekap berhasil!", {
        description: "Data sedang diperbarui.",
      });
      queryClient.invalidateQueries({ queryKey: ["recapData"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat perhitungan ulang.";
      toast.error("Gagal Menghitung Ulang", {
        description: message,
      });
    },
  });

  // --- Fungsi Ekspor ---

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filter Rekapitulasi</CardTitle>
          <CardDescription>
            Pilih jenis data, meteran, dan periode untuk melihat rekap
            pemakaian.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2 items-center justify-between">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
            <Tabs
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <TabsList>
                <TabsTrigger value="Electricity">Listrik</TabsTrigger>
                <TabsTrigger value="Water">Air</TabsTrigger>
                <TabsTrigger value="Fuel">BBM</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select // Filter Meteran
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
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Memuat...
                  </div>
                ) : (
                  <>
                    <SelectItem value="all-meters">Semua Meter</SelectItem>
                    {meters.map((meter) => (
                      <SelectItem
                        key={meter.meter_id}
                        value={String(meter.meter_id)}
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
                    "w-full sm:w-[280px] justify-start text-left font-normal",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date?.from ? (
                    filters.date.to ? (
                      <>
                        {format(filters.date.from, "d LLL, y", { locale: id })}{" "}
                        - {format(filters.date.to, "d LLL, y", { locale: id })}
                      </>
                    ) : (
                      format(filters.date.from, "d LLL, y", { locale: id })
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

      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sesuaikan Dokumen PDF</DialogTitle>
            <DialogDescription>
              Atur properti dokumen sebelum mengekspor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pdf-title" className="text-right">
                Judul
              </Label>
              <Input
                id="pdf-title"
                value={pdfOptions.title}
                onChange={(e) =>
                  setPdfOptions((prev) => ({ ...prev, title: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pdf-subtitle" className="text-right">
                Subjudul
              </Label>
              <Input
                id="pdf-subtitle"
                value={pdfOptions.subtitle}
                onChange={(e) =>
                  setPdfOptions((prev) => ({
                    ...prev,
                    subtitle: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pdf-color" className="text-right">
                Warna Header
              </Label>
              <Input
                id="pdf-color"
                type="color"
                value={pdfOptions.headerColor}
                onChange={(e) =>
                  setPdfOptions((prev) => ({
                    ...prev,
                    headerColor: e.target.value,
                  }))
                }
                className="col-span-3 h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleExport("pdf")}>Export PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
