"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { ReadingHistory } from "../services/reading.service";

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

const SortableHeader = ({
  column,
  title,
}: {
  column: Column<ReadingHistory, unknown>;
  title: string;
}) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="h-auto p-0 text-left hover:bg-transparent"
  >
    {title}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

export const createColumns = (
  onEdit: (item: ReadingHistory) => void,
  onDelete: (item: ReadingHistory) => void
): ColumnDef<ReadingHistory>[] => {
  const columns: ColumnDef<ReadingHistory>[] = [
    {
      accessorKey: "reading_date",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tgl. Pembacaan" />
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("reading_date") as string | Date;
        if (!dateValue) return "-";

        return format(new Date(dateValue), "dd MMM yyyy", { locale: id });
      },
    },
    {
      accessorKey: "meter.meter_code",
      header: "Kode Meter",
    },
    {
      accessorKey: "user.username",
      header: "Petugas Pencatat",
    },
    {
      accessorKey: "details",
      header: "Detail Pembacaan",
      cell: ({ row }) => {
        const details = row.original.details;
        if (!details || details.length === 0) return "-";

        return (
          <div className="flex flex-col gap-1 text-xs">
            {details.map((detail) => (
              <div key={detail.detail_id} className="flex justify-start gap-3">
                <span className="text-muted-foreground font-semibold">
                  {detail.reading_type.type_name}:
                </span>
                <span className="text-right font-mono">
                  {formatNumber(detail.value)}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "",
      cell: ({ row, table }) => {
        const item = row.original;

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
                  className="cursor-pointer text-red-600"
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
