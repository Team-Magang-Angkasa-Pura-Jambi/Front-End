"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Users } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { ReadingSessionWithDetails } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// DIUBAH: Impor tipe data yang benar untuk riwayat

/**
 * Memformat nilai menjadi format angka lokal Indonesia dengan 2 desimal.
 * @param value Nilai yang akan diformat.
 * @returns String angka atau "-" jika tidak valid.
 */
const formatNumber = (value: unknown): string => {
  const num = Number(value);
  if (value === null || value === undefined || isNaN(num)) {
    return "-";
  }
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Komponen helper untuk membuat header kolom yang bisa di-sort.
 */
const SortableHeader = ({
  column,
  title,
}: {
  column: Column<ReadingSessionWithDetails, unknown>;
  title: string;
}) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="text-left p-0 h-auto hover:bg-transparent"
  >
    {title}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

/**
 * DIUBAH TOTAL: Membuat definisi kolom untuk tabel RIWAYAT PENCATATAN.
 * Fungsi ini sekarang lebih sederhana karena struktur data riwayat konsisten.
 * @param dataType - Jenis energi (saat ini tidak digunakan karena kolomnya generik, tapi bisa dipakai untuk kustomisasi di masa depan).
 * @returns Array dari ColumnDef.
 */
export const createColumns = (
  onEdit: (item: ReadingSessionWithDetails) => void,
  onDelete: (item: ReadingSessionWithDetails) => void,
  dataType: "Electricity" | "Water" | "Fuel"
): ColumnDef<ReadingSessionWithDetails>[] => {
  const columns: ColumnDef<ReadingSessionWithDetails>[] = [
    {
      accessorKey: "reading_date",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tgl. Pembacaan" />
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("reading_date") as string | Date;
        if (!dateValue) return "-";
        // Menggunakan date-fns untuk format yang lebih konsisten
        return format(new Date(dateValue), "dd MMM yyyy", { locale: id });
      },
    },
    {
      // BARU: Mengakses data relasi dengan dot notation
      accessorKey: "meter.meter_code",
      header: "Kode Meter",
    },
    {
      // BARU: Mengakses data relasi dengan dot notation
      accessorKey: "user.username",
      header: "Petugas Pencatat",
    },
    {
      // BARU: Kolom ini secara cerdas menampilkan semua detail bacaan dari array
      accessorKey: "details",
      header: "Detail Pembacaan",
      cell: ({ row }) => {
        const details = row.original.details;
        if (!details || details.length === 0) return "-";

        return (
          <div className="flex flex-col text-xs gap-1">
            {details.map((detail) => (
              <div key={detail.detail_id} className="flex justify-start gap-3">
                <span className="font-semibold text-muted-foreground">
                  {detail.reading_type.type_name}:
                </span>
                <span className="font-mono text-right">
                  {formatNumber(detail.value)}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    // Kolom Pax dihapus dari sini
    {
      id: "actions",
      header: "",
      cell: ({ row, table }) => {
        const item = row.original;
        // PERBAIKAN: Logika untuk menonaktifkan tombol Edit.
        // Asumsi data sudah diurutkan dari yang terbaru (descending).
        // Hanya item pertama (index 0) yang bisa diedit.
        const isLatest = row.index === 0;

        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Buka menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => isLatest && onEdit(item)}
                  className="cursor-pointer"
                  disabled={!isLatest}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-red-600 cursor-pointer"
                >
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return columns;
};
