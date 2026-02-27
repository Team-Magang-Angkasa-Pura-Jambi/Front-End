"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { ReadingHistory } from "../services/reading.service"; // Pastikan type diimport

export const createColumns = (
  onEdit: (item: ReadingHistory) => void,
  onDelete: (item: ReadingHistory) => void
): ColumnDef<ReadingHistory>[] => [
  {
    accessorKey: "reading_date",
    header: "Tanggal",
    cell: ({ row }) => {
      const date = new Date(row.getValue("reading_date"));
      return (
        <div className="flex items-center gap-2 font-medium">
          <CalendarIcon className="text-muted-foreground h-4 w-4" />
          {format(date, "dd MMM yyyy", { locale: id })}
        </div>
      );
    },
  },
  {
    accessorKey: "meter.meter_code", // Akses nested object
    header: "Meteran",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold">{row.original.meter.name}</span>
        <span className="text-muted-foreground text-xs">
          {row.original.meter.meter_code || "Tanpa Kode"}
        </span>
      </div>
    ),
  },

  // --- INI BAGIAN PENTINGNYA: DETAIL DINAMIS ---
  {
    accessorKey: "details",
    header: "Detail Pembacaan",
    cell: ({ row }) => {
      const details = row.original.details;

      if (!details || details.length === 0) {
        return <span className="text-muted-foreground text-xs italic">- Kosong -</span>;
      }

      return (
        <div className="flex min-w-[180px] flex-col gap-1.5">
          {details.map((detail) => (
            <div
              key={detail.detail_id}
              className="flex items-center justify-between border-b border-dashed pb-1 text-sm last:border-0 last:pb-0"
            >
              {/* Nama Tipe (WBP, LWBP, dll) */}
              <Badge variant="outline" className="text-muted-foreground text-[10px] font-normal">
                {detail.reading_type.type_name}
              </Badge>

              {/* Nilai + Satuan */}
              <span className="font-mono font-medium">
                {Number(detail.value).toLocaleString("id-ID")}
                <span className="text-muted-foreground ml-1 text-xs">
                  {detail.reading_type.unit}
                </span>
              </span>
            </div>
          ))}
        </div>
      );
    },
  },

  {
    accessorKey: "notes",
    header: "Catatan",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string;
      return notes ? (
        <span className="text-muted-foreground block max-w-[150px] truncate text-xs" title={notes}>
          {notes}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
