"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  EnergyType,
  Meter,
  PriceScheme,
  ReadingType,
  EfficiencyTarget,
} from "../types";

// Helper Aksi Generik
const createActions = <T,>(
  onEdit: (item: T) => void,
  onDelete: (item: T) => void
): ColumnDef<T> => ({
  id: "actions",
  cell: ({ row }) => (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(row.original)}
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
});

// Kolom untuk EnergyType
export const energyTypeColumns = (
  onEdit: (item: EnergyType) => void,
  onDelete: (item: EnergyType) => void
): ColumnDef<EnergyType>[] => [
  { accessorKey: "type_name", header: "Nama Energi" },
  { accessorKey: "unit_of_measurement", header: "Satuan" },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
        {row.getValue("is_active") ? "Aktif" : "Non-Aktif"}
      </Badge>
    ),
  },
  createActions(onEdit, onDelete),
];

// Kolom untuk ReadingType
export const readingTypeColumns = (
  onEdit: (item: ReadingType) => void,
  onDelete: (item: ReadingType) => void
): ColumnDef<ReadingType>[] => [
  { accessorKey: "type_name", header: "Nama Tipe" },
  { accessorKey: "energy_type.type_name", header: "Jenis Energi Induk" },
  createActions(onEdit, onDelete),
];

// Kolom untuk Meter
export const meterColumns = (
  onEdit: (item: Meter) => void,
  onDelete: (item: Meter) => void
): ColumnDef<Meter>[] => [
  { accessorKey: "meter_code", header: "Kode Meter" },
  { accessorKey: "location", header: "Lokasi" },
  { accessorKey: "energy_type.type_name", header: "Jenis Energi" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("status") === "Active" ? "default" : "destructive"
        }
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  createActions(onEdit, onDelete),
];

// Kolom untuk PriceScheme
export const priceSchemeColumns = (
  onEdit: (item: PriceScheme) => void,
  onDelete: (item: PriceScheme) => void
): ColumnDef<PriceScheme>[] => [
  { accessorKey: "scheme_name", header: "Nama Skema" },
  { accessorKey: "energy_type.type_name", header: "Jenis Energi" },
  {
    accessorKey: "effective_date",
    header: "Tanggal Efektif",
    cell: ({ row }) =>
      new Date(row.getValue("effective_date")).toLocaleDateString("id-ID"),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
        {row.getValue("is_active") ? "Aktif" : "Non-Aktif"}
      </Badge>
    ),
  },
  createActions(onEdit, onDelete),
];

// Kolom untuk EfficiencyTarget
export const efficiencyTargetColumns = (
  onEdit: (item: EfficiencyTarget) => void,
  onDelete: (item: EfficiencyTarget) => void
): ColumnDef<EfficiencyTarget>[] => [
  { accessorKey: "kpi_name", header: "Nama KPI" },
  { accessorKey: "energy_type.type_name", header: "Jenis Energi" },
  {
    accessorKey: "target_value",
    header: "Nilai Target",
    cell: ({ row }) => `${row.getValue("target_value")}%`,
  },
  {
    accessorKey: "period_start",
    header: "Periode Mulai",
    cell: ({ row }) =>
      new Date(row.getValue("period_start")).toLocaleDateString("id-ID"),
  },
  {
    accessorKey: "period_end",
    header: "Periode Selesai",
    cell: ({ row }) =>
      new Date(row.getValue("period_end")).toLocaleDateString("id-ID"),
  },
  createActions(onEdit, onDelete),
];

const statusVariant: {
  [key: string]: "default" | "secondary" | "destructive" | "outline";
} = {
  Active: "default",
  UnderMaintenance: "outline",
  Inactive: "secondary",
  DELETED: "destructive",
};

export const createMeterColumns = (
  onEdit: (meter: Meter) => void,
  onDelete: (meter: Meter) => void
): ColumnDef<Meter>[] => [
  {
    accessorKey: "meter_code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Kode Meter <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "energy_type.type_name",
    header: "Jenis Energi",
  },
  {
    accessorKey: "location",
    header: "Lokasi",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={statusVariant[status] || "secondary"}>{status}</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const meter = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(meter)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(meter)}
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
