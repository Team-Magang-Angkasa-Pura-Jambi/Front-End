"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Droplets, FileDown, Fuel, RotateCw, Zap } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { toast } from "sonner";

import { EnergyTypeName } from "@/common/types/energy";
import { exportToExcel, exportToPdf } from "@/lib/exportUtils";
import { companyLogoBase64 } from "@/lib/logoBase64";
import { recalculateApi } from "@/modules/EnterData/services";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConsumpFilter, RecapDataRow, RecapSummary } from "../types/recap.type";

interface RecapHeaderProps {
  filters: ConsumpFilter;
  setFilters: React.Dispatch<React.SetStateAction<ConsumpFilter>>;
  isFetching: boolean;
  dataToExport: RecapDataRow[];
  columns: ColumnDef<RecapDataRow, unknown>[];
  summary?: RecapSummary;
}

export const RecapHeader = ({
  filters,
  setFilters,
  isFetching,
  dataToExport,
  columns,
  summary,
}: RecapHeaderProps) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const ENERGY_CONFIG = useMemo(
    () => ({
      Electricity: {
        id: 1,
        label: "Listrik",
        icon: <Zap className="h-4 w-4" />,
        color: "text-amber-500",
        active: "bg-amber-500 text-white",
      },
      Water: {
        id: 2,
        label: "Air",
        icon: <Droplets className="h-4 w-4" />,
        color: "text-blue-500",
        active: "bg-blue-500 text-white",
      },
      Fuel: {
        id: 3,
        label: "BBM",
        icon: <Fuel className="h-4 w-4" />,
        color: "text-orange-600",
        active: "bg-orange-600 text-white",
      },
    }),
    []
  );

  const activeEnergyId = ENERGY_CONFIG[filters.type as keyof typeof ENERGY_CONFIG].id;

  const { data: metersResponse } = useQuery({
    queryKey: ["meters", activeEnergyId],
    queryFn: () => getMetersApi(Number(activeEnergyId)),
    refetchOnWindowFocus: false,
  });

  const handleFilterChange = useCallback(
    <K extends keyof ConsumpFilter>(key: K, value: ConsumpFilter[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };

        if (key === "type") next.meterId = undefined;
        return next;
      });
    },
    [setFilters]
  );

  useEffect(() => {
    const meters = metersResponse?.data?.meter;
    if (meters && meters.length > 0 && !filters.meterId) {
      handleFilterChange("meterId", meters[0].meter_id);
    }
  }, [metersResponse, filters.meterId, handleFilterChange]);

  const activeMeterLabel = useMemo(() => {
    const meter = metersResponse?.data?.meter.find((m) => m.meter_id === filters.meterId);
    return meter ? meter.meter_code : "Memuat Meteran...";
  }, [filters.meterId, metersResponse]);

  const subtitleText = useMemo(() => {
    const { from, to } = filters.date || {};
    const dateStr =
      from && to ? `${format(from, "d MMM yyyy")} - ${format(to, "d MMM yyyy")}` : "Semua Periode";
    return `Kategori: ${ENERGY_CONFIG[filters.type as keyof typeof ENERGY_CONFIG].label} | Meter: ${activeMeterLabel} | ${dateStr}`;
  }, [filters.date, filters.type, ENERGY_CONFIG, activeMeterLabel]);

  const [pdfOptions, setPdfOptions] = useState({
    title: `Laporan Rekapitulasi`,
    subtitle: subtitleText,
    headerColor: "#2F5597",
  });

  useEffect(() => {
    setPdfOptions((prev) => ({
      ...prev,
      subtitle: subtitleText,
      title: `Laporan Rekapitulasi ${filters.type}`,
    }));
  }, [subtitleText, filters.type]);

  const { mutate: recalculate, isPending: isRecalculating } = useMutation({
    mutationFn: () => {
      if (!filters.date?.from || !filters.date?.to || !filters.meterId)
        throw new Error("Lengkapi Filter");
      return recalculateApi({
        start_date: format(filters.date.from, "yyyy-MM-dd"),
        to_date: format(filters.date.to, "yyyy-MM-dd"),
        meter_id: filters.meterId,
      });
    },
    onSuccess: () => {
      toast.success("Kalkulasi ulang berhasil, menyegarkan data...");

      queryClient.invalidateQueries({
        queryKey: ["recapData"],
      });
    },

    onError: (err) => toast.error(err.message || "Gagal hitung ulang"),
  });

  const handleExport = (formatType: "excel" | "pdf") => {
    const exportColumns = [
      { header: "Kategori", dataKey: "energy_type" as keyof RecapDataRow },
      { header: "Nama Meter", dataKey: "meter_name" as keyof RecapDataRow },
      ...columns
        .filter((col) => "accessorKey" in col)
        .map((col) => {
          const c = col as any;
          return {
            header: typeof c.header === "string" ? c.header : c.accessorKey,
            dataKey: c.accessorKey as keyof RecapDataRow,
          };
        }),
    ];

    const enrichedData = dataToExport.map((item) => ({
      ...item,
      energy_type: ENERGY_CONFIG[filters.type as keyof typeof ENERGY_CONFIG].label,
      meter_name: item.meter?.meter_code || activeMeterLabel,
    }));

    const fileName = `Rekap_${filters.type}_${format(new Date(), "yyyyMMdd")}`;

    if (formatType === "excel") {
      exportToExcel(
        exportColumns,
        enrichedData,
        { title: pdfOptions.title, sheetName: "Data" },
        fileName,
        summary,
        companyLogoBase64
      );
    } else {
      exportToPdf(exportColumns, enrichedData, pdfOptions, fileName, summary, companyLogoBase64);
      setIsPdfModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="ring-border/50 border-none shadow-sm ring-1">
        <CardHeader className="pb-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <CardTitle className="text-xl font-bold">Rekap Data Konsumsi</CardTitle>
              <CardDescription>
                Kelola dan ekspor laporan penggunaan energi operasional.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => recalculate()}
                disabled={isRecalculating || isFetching}
              >
                <RotateCw className={cn("mr-2 h-4 w-4", isRecalculating && "animate-spin")} />
                Sinkron Data
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    disabled={!dataToExport.length}
                    className="bg-primary shadow-md"
                  >
                    <FileDown className="mr-2 h-4 w-4" /> Export Laporan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    Export ke Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPdfModalOpen(true)}>
                    Export ke PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] font-bold uppercase">
                Jenis Energi
              </Label>
              <div className="bg-muted border-border/50 flex w-fit rounded-xl border p-1">
                {(Object.keys(ENERGY_CONFIG) as (keyof typeof ENERGY_CONFIG)[]).map((key) => {
                  const isActive = filters.type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleFilterChange("type", key as EnergyTypeName)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        isActive
                          ? ENERGY_CONFIG[key].active
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {ENERGY_CONFIG[key].icon} {ENERGY_CONFIG[key].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] font-bold uppercase">
                Lokasi Meteran
              </Label>
              <Select
                value={filters.meterId ? String(filters.meterId) : ""}
                onValueChange={(val) => handleFilterChange("meterId", Number(val))}
              >
                <SelectTrigger className="bg-background border-border/60 h-10 w-[200px] rounded-xl">
                  <SelectValue placeholder="Memuat Meteran..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {metersResponse?.data?.meter.map((m) => (
                    <SelectItem key={m.meter_id} value={String(m.meter_id)}>
                      {m.meter_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] font-bold uppercase">
                Periode Waktu
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-background h-10 w-[280px] justify-start rounded-xl text-left font-normal"
                  >
                    <CalendarIcon className="text-muted-foreground mr-2 h-4 w-4" />
                    {filters.date?.from
                      ? filters.date.to
                        ? `${format(filters.date.from, "dd MMM yyyy")} - ${format(filters.date.to, "dd MMM yyyy")}`
                        : format(filters.date.from, "dd MMM yyyy")
                      : "Pilih Tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-xl border-none p-0 shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="range"
                    selected={filters.date}
                    onSelect={(d) => handleFilterChange("date", d)}
                    numberOfMonths={2}
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Kustomisasi Laporan PDF</DialogTitle>
            <DialogDescription>Sesuaikan tampilan dokumen sebelum diunduh.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Judul Laporan</Label>
              <Input
                value={pdfOptions.title}
                onChange={(e) => setPdfOptions((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Warna Header</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  className="h-10 w-12 p-1"
                  value={pdfOptions.headerColor}
                  onChange={(e) =>
                    setPdfOptions((p) => ({
                      ...p,
                      headerColor: e.target.value,
                    }))
                  }
                />
                <span className="text-muted-foreground text-sm uppercase">
                  {pdfOptions.headerColor}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPdfModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => handleExport("pdf")}>Cetak Sekarang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
