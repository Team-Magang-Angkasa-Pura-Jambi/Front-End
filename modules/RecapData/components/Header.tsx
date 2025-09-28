"use client";

import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarIcon, Loader2, FileDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table"; // <-- WAJIB: Impor tipe ColumnDef

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
import { RecapSummary } from "../type";
import { companyLogoBase64 } from "@/lib/logoBase64";
import { useQuery } from "@tanstack/react-query";
import { masterData } from "@/services/masterData.service";
import { getCategoryApi } from "@/services/category.service";

// --- 1. PERBARUI INTERFACE PROPS ---
interface RecapHeaderProps {
  filters: {
    type: "Electricity" | "Water" | "Fuel";
    date: DateRange | undefined;
    sortBy: string | undefined;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  isFetching: boolean;
  dataToExport: any[];
  columns: ColumnDef<any, any>[]; // <-- TAMBAHKAN INI
  summary: RecapSummary | undefined; // <-- TAMBAHKAN INI
}

export const RecapHeader: React.FC<RecapHeaderProps> = ({
  filters,
  setFilters,
  isFetching,
  dataToExport,
  columns, // <-- Terima prop
  summary, // <-- Terima prop
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["Category"],
    queryFn: getCategoryApi,
  });

  const generateSubtitle = () => {
    const { from, to } = filters.date || {};
    if (from && to) {
      return `Periode: ${format(from, "d MMM yyyy")} - ${format(
        to,
        "d MMM yyyy"
      )}`;
    }
    return "Semua Periode";
  };

  const [pdfOptions, setPdfOptions] = useState({
    title: `Laporan Rekap ${filters.type}`,
    subtitle: generateSubtitle(),
    headerColor: "#2F5597",
  });

  React.useEffect(() => {
    setPdfOptions((prev) => ({
      ...prev,
      title: `Laporan Rekap ${filters.type}`,
      subtitle: generateSubtitle(),
    }));
  }, [filters.type, filters.date]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  // --- 2. HAPUS useMemo UNTUK KOLOM ---
  // Logika ini sekarang ada di Page.tsx, tidak perlu ada di sini lagi.

  // --- 3. PERBARUI FUNGSI EKSPOR UNTUK MENGGUNAKAN PROPS ---
  const handleExport = (formatType: "excel" | "pdf") => {
    // Konversi definisi kolom dari TanStack Table menjadi format yang dimengerti oleh export utility
    const exportColumns = columns
      .map((col: any) => {
        // Ambil header dari kolom, jika itu fungsi, kita gunakan accessorKey sebagai fallback
        const headerText =
          typeof col.header === "function"
            ? col.accessorKey // Fallback
            : col.header;
        return {
          header: headerText || col.accessorKey,
          dataKey: col.accessorKey,
        };
      })
      .filter((col) => col.dataKey && col.header); // Pastikan hanya kolom dengan dataKey yang diekspor

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
      toast.info("Mempersiapkan file PDF...");
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
      <Card>
        <CardHeader>
          <CardTitle>Rekap Data Pemakaian</CardTitle>
          <CardDescription>
            Pilih jenis data dan periode untuk melihat riwayat pemakaian.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            {/* ... (Filter Tabs, Popover, Select tidak berubah) ... */}
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
            <Select
            // value={filters.sortBy}
            // onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue
                  placeholder={
                    !isLoading || isError ? "Pilih Area" : "memuat..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories?.data?.map((e, i) => {
                  return (
                    <SelectItem key={i} value={e.category_id}>
                      {e.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[300px] justify-start text-left font-normal",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date?.from ? (
                    filters.date.to ? (
                      <>
                        {format(filters.date.from, "LLL dd, y")} -{" "}
                        {format(filters.date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.date.from, "LLL dd, y")
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
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Urutkan Berdasarkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Tanggal</SelectItem>
                <SelectItem value="cost">Biaya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto flex items-center justify-end gap-2">
            {isFetching && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!dataToExport || dataToExport.length === 0}
                >
                  <FileDown className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Export ke Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPdfModalOpen(true)}>
                  Export ke PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* ... (Dialog untuk Kustomisasi PDF tidak berubah) ... */}
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
