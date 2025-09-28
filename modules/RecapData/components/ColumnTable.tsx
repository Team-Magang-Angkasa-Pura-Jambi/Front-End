"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecapDataRow } from "../type"; // Ganti 'RecapRecord' ke 'RecapDataRow' agar konsisten

/**
 * Memformat nilai menjadi format mata uang Rupiah.
 * @param amount Nilai yang akan diformat.
 * @returns String mata uang atau "-" jika tidak valid.
 */
const formatCurrency = (amount: unknown): string => {
  const num = Number(amount);
  // Cek jika amount null, undefined, atau bukan angka yang valid
  if (amount === null || amount === undefined || isNaN(num)) {
    return "-";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Memformat nilai menjadi format angka lokal Indonesia.
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
  column: Column<RecapDataRow, unknown>;
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
 * Membuat definisi kolom untuk tabel rekap berdasarkan jenis data.
 * @param dataType Jenis energi ('Electricity', 'Water', atau 'Fuel').
 * @returns Array dari ColumnDef.
 */
export const createColumns = (
  dataType: "Electricity" | "Water" | "Fuel"
): ColumnDef<RecapDataRow>[] => {
  // Kolom dasar yang selalu ada di awal
  const baseColumns: ColumnDef<RecapDataRow>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tanggal" />
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("date") as string | Date;
        // Penanganan jika tanggal tidak valid
        if (!dateValue) return "-";
        return new Date(dateValue).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      },
    },
  ];

  let specificColumns: ColumnDef<RecapDataRow>[] = [];

  switch (dataType) {
    case "Electricity":
      specificColumns = [
        {
          accessorKey: "target",
          header: ({ column }) => (
            <SortableHeader column={column} title="Target (kWh)" />
          ),
          cell: ({ row }) => formatNumber(row.getValue("target")),
        },
        {
          accessorKey: "wbp",
          header: ({ column }) => (
            <SortableHeader column={column} title="WBP (kWh)" />
          ),
          cell: ({ row }) => formatNumber(row.getValue("wbp")),
        },
        {
          accessorKey: "lwbp",
          header: ({ column }) => (
            <SortableHeader column={column} title="LWBP (kWh)" />
          ),
          cell: ({ row }) => formatNumber(row.getValue("lwbp")),
        },
        {
          // **FIX**: Menggunakan 'consumption' yang sudah dihitung di service
          accessorKey: "consumption",
          header: ({ column }) => (
            <SortableHeader column={column} title="Total Konsumsi (kWh)" />
          ),
          cell: ({ row }) => formatNumber(row.getValue("consumption")),
        },

        {
          accessorKey: "pax",
          header: ({ column }) => (
            <SortableHeader column={column} title="Pax" />
          ),
          cell: ({ row }) => formatNumber(row.getValue("pax")),
        },
      ];
      break;

    case "Water":
    case "Fuel":
      specificColumns = [
        {
          accessorKey: "target",
          header: ({ column }) => (
            <SortableHeader column={column} title="Target" />
          ),
          cell: ({ row }) => {
            const amount = row.getValue("target");
            if (amount === null || amount === undefined) return "-";
            const unit = dataType === "Water" ? "m³" : "L";
            return `${formatNumber(amount)} ${unit}`;
          },
        },
        {
          accessorKey: "consumption",
          header: ({ column }) => (
            <SortableHeader column={column} title="Pemakaian" />
          ),
          cell: ({ row }) => {
            const amount = row.getValue("consumption");
            if (amount === null || amount === undefined) return "-";
            const unit = dataType === "Water" ? "m³" : "L";
            return `${formatNumber(amount)} ${unit}`;
          },
        },
        // **BARU**: Menambahkan kolom Target dan Pax untuk Air & BBM
      ];
      break;
  }

  // Kolom yang selalu ada di akhir
  const commonEndColumns: ColumnDef<RecapDataRow>[] = [
    {
      accessorKey: "cost",
      header: ({ column }) => <SortableHeader column={column} title="Biaya" />,
      cell: ({ row }) => formatCurrency(row.getValue("cost")),
    },
  ];

  return [...baseColumns, ...specificColumns, ...commonEndColumns];
};
