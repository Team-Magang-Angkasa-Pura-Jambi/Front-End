"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, FileDown, RotateCw } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
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

import { useMutation, useQuery } from "@tanstack/react-query";
import { getMetersApi } from "@/services/meter.service";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import { EnergyTypeName } from "@/common/types/energy";
import { companyLogoBase64 } from "@/lib/logoBase64";
import { ConsumpFilter, RecapDataRow, RecapSummary } from "../types/recap.type";
import { recalculateRecapApi } from "../services/recap.service";

interface RecapHeaderProps {
  filters: ConsumpFilter;
  setFilters: React.Dispatch<React.SetStateAction<ConsumpFilter>>;
  isFetching: boolean;
  dataToExport: RecapDataRow[];
  columns: ColumnDef<RecapDataRow, unknown>[];
  summary: RecapSummary;
}

export const RecapHeader: React.FC<RecapHeaderProps> = ({
  filters,
  setFilters,
  isFetching,
  dataToExport,
  columns,
  summary,
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["meters", filters.type],
    queryFn: () => getMetersApi(filters.type),
    refetchOnWindowFocus: false,
  });

  const subtitleText = useMemo(() => {
    const { from, to } = filters.date || {};
    if (from && to) {
      return `Periode: ${format(from, "d MMM yyyy")} - ${format(
        to,
        "d MMM yyyy"
      )}`;
    }
    return "Semua Periode";
  }, [filters.date]);

  const [pdfOptions, setPdfOptions] = useState({
    title: `Laporan Rekap ${filters.type}`,
    subtitle: subtitleText,
    headerColor: "#2F5597",
  });

  useEffect(() => {
    setPdfOptions((prev) => ({
      ...prev,
      title: `Laporan Rekap ${filters.type}`,
      subtitle: subtitleText,
    }));
  }, [filters.type, subtitleText]);

  const handleFilterChange = useCallback(
    <K extends keyof ConsumpFilter>(key: K, value: ConsumpFilter[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };

        if (key === "type") {
          next.meterId = undefined;
        }

        return next;
      });
    },
    [setFilters]
  );

  useEffect(() => {
    const meters = metersResponse?.data;
    if (
      Array.isArray(meters) &&
      meters.length > 0 &&
      !filters.meterId &&
      !isLoadingMeters
    ) {
      handleFilterChange("meterId", meters[0].meter_id);
    }
  }, [metersResponse, isLoadingMeters, filters.meterId, handleFilterChange]);

  const { mutate: recalculate, isPending: isRecalculating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>
  >({
    mutationFn: () => {
      if (!filters.date?.from || !filters.date?.to) {
        throw new Error("Tanggal mulai dan selesai wajib diisi.");
      }
      return recalculateRecapApi({
        startDate: format(filters.date.from, "yyyy-MM-dd"),
        endDate: format(filters.date.to, "yyyy-MM-dd"),
        meterId: filters.meterId,
      });
    },
    onSuccess: () => {
      toast.info("Proses perhitungan ulang dimulai...", {
        description: "Data akan diperbarui secara otomatis setelah selesai.",
      });
    },
    onError: (error) => {
      const message = error.response?.data?.status?.message || error.message;
      toast.error("Gagal Menghitung Ulang", { description: message });
    },
  });

  const handleExport = (formatType: "excel" | "pdf") => {
    const exportColumns = columns
      .filter((col) => "accessorKey" in col)
      .map((col) => {
        const column = col as {
          header?: string | React.ReactNode;
          accessorKey: string;
        };

        return {
          header:
            typeof column.header === "string"
              ? column.header
              : column.accessorKey,
          dataKey: column.accessorKey,
        };
      });
    const fileName = `Rekap_${filters.type}_${format(
      new Date(),
      "yyyy-MM-dd"
    )}`;

    if (formatType === "excel") {
      toast.info("Mempersiapkan file Excel...");
      exportToExcel(
        exportColumns,
        dataToExport,
        { title: `Rekap Laporan ${filters.type}`, sheetName: "Data Rekap" },
        fileName,
        summary,
        companyLogoBase64
      );
    } else {
      exportToPdf(
        exportColumns,
        dataToExport,
        pdfOptions,
        fileName,
        summary,
        companyLogoBase64
      );
      setIsPdfModalOpen(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rekap Data Beban Konsumsi</CardTitle>
          <CardDescription>
            Pilih jenis data dan periode untuk melihat evaluasi penggunaan
            energi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-end justify-between">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Tipe Energi */}
              <div className="space-y-1.5">
                <Label className="text-xs">Jenis Energi</Label>
                <Tabs
                  value={filters.type}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "type",
                      value as unknown as EnergyTypeName
                    )
                  }
                >
                  <TabsList>
                    <TabsTrigger value="Electricity">Listrik</TabsTrigger>
                    <TabsTrigger value="Water">Air</TabsTrigger>
                    <TabsTrigger value="Fuel">BBM</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Pilih Meter */}
              <div className="space-y-1.5">
                <Label className="text-xs">Meteran</Label>
                <Select
                  value={filters.meterId ? String(filters.meterId) : "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "meterId",
                      value === "all" ? undefined : Number(value)
                    )
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Meter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingMeters ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <SelectItem value="all">Semua Meter</SelectItem>
                        {Array.isArray(metersResponse?.data) &&
                          metersResponse.data.map((meter) => (
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
              </div>

              {/* Range Tanggal */}
              <div className="space-y-1.5">
                <Label className="text-xs">Periode</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !filters.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.date?.from ? (
                        filters.date.to ? (
                          `${format(
                            filters.date.from,
                            "dd MMM yyyy"
                          )} - ${format(filters.date.to, "dd MMM yyyy")}`
                        ) : (
                          format(filters.date.from, "dd MMM yyyy")
                        )
                      ) : (
                        <span>Pilih periode</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={filters.date}
                      onSelect={(date) => handleFilterChange("date", date)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => recalculate()}
                disabled={isRecalculating || isFetching}
              >
                {isRecalculating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="mr-2 h-4 w-4" />
                )}
                Hitung Ulang
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" disabled={!dataToExport?.length}>
                    <FileDown className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
        </CardContent>
      </Card>

      {/* PDF Modal */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kustomisasi PDF</DialogTitle>
            <DialogDescription>
              Atur judul dan warna sebelum diekspor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-title">Judul Laporan</Label>
              <Input
                id="pdf-title"
                value={pdfOptions.title}
                onChange={(e) =>
                  setPdfOptions((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf-color">Warna Tema</Label>
              <Input
                id="pdf-color"
                type="color"
                className="h-10 p-1"
                value={pdfOptions.headerColor}
                onChange={(e) =>
                  setPdfOptions((p) => ({ ...p, headerColor: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPdfModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => handleExport("pdf")}>Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
