"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      // PERBAIKAN:
      // 1. bg-card: Agar putih di Light, Slate-900 di Dark.
      // 2. border-border: Mengikuti warna garis tema global.
      className="border-border bg-card relative w-full overflow-x-auto rounded-md border shadow-sm"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      // PERBAIKAN: Gunakan bg-muted/30 untuk pemisah header yang halus
      className={cn("bg-muted/30 border-border border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-border border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-border border-b transition-colors",

        // PERBAIKAN HOVER EFFECT (Energy Glow Adaptif):
        // Menggunakan primary/5 agar warnanya mengikuti tema (Cyan/Emerald)
        // tapi sangat tipis (5% opacity) agar elegan.
        "hover:bg-primary/5",

        // Selected state juga mengikuti primary
        "data-[state=selected]:bg-primary/10",

        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-4 text-left align-middle",

        // TYPOGRAPHY TEKNIKAL:
        // text-muted-foreground: Warna abu-abu yang pas di light/dark
        "text-muted-foreground text-[11px] font-bold tracking-wider uppercase",

        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // text-foreground: Warna teks utama (Charcoal/Putih Tulang)
        "text-foreground p-4 align-middle font-medium",
        "tabular-nums", // Angka sejajar
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-xs italic", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
