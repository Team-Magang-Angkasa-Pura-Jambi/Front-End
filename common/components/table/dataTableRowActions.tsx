"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onEdit: (data: TData) => void;
  onDelete: (data: TData) => void;
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          // text-muted-foreground: Icon titik tiga warnanya abu soft
          // data-[state=open]:bg-muted: Saat menu terbuka, background jadi abu
          className="text-muted-foreground hover:text-foreground data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </DropdownMenuTrigger>

      {/* DropdownMenuContent otomatis menggunakan bg-popover/bg-card dari global css */}
      <DropdownMenuContent align="end" className="w-[160px]">
        {/* Tombol Edit */}
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          <Pencil className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Tombol Hapus dengan Destructive Styling */}
        <DropdownMenuItem
          onClick={() => onDelete(row.original)}
          // Styling khusus delete: Teks Merah, dan saat hover background merah sangat tipis
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash className="mr-2 h-3.5 w-3.5" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
