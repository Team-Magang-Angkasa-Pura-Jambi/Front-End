"use client";

import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { EnergyTypeName } from "@/common/types/energy";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

export interface RecapMeta {
  total_rows?: number;
  total_cost?: number;
  totalCost?: number;
  total_consumption?: number;
  totalConsumption?: number;
  column_totals?: Record<string, number>;
  columnTotals?: Record<string, number>;
}

interface RecapTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  meta: RecapMeta | undefined;
  dataType: EnergyTypeName;
}

export function RecapTable<TData, TValue>({
  columns,
  data,
  isLoading,
  meta,
}: RecapTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDecimal = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatInt = (amount: unknown): string => {
    const num = Number(amount);
    if (amount === null || amount === undefined || isNaN(num)) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalCost = meta?.total_cost ?? meta?.totalCost ?? 0;
  const totalConsumption = meta?.total_consumption ?? meta?.totalConsumption ?? 0;
  const columnTotals = meta?.column_totals ?? meta?.columnTotals ?? {};

  return (
    <div className="space-y-4">
      {/* Tombol Toggle Sembunyikan/Tampilkan Kolom */}
      <div className="flex justify-end px-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Kelola Kolom
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize cursor-pointer"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-card overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-foreground font-semibold whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-muted-foreground h-32 text-center"
                  >
                    Data tidak ditemukan untuk periode ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {/* FOOTER DINAMIS: Menyesuaikan kolom statis/dinamis & visibilitas */}
            {!isLoading && data.length > 0 && (
              <TableFooter className="bg-muted/30">
                <TableRow>
                  {table.getVisibleLeafColumns().map((column) => {
                    const colId = column.id;

                    // Kolom Tanggal / Pertama
                    if (colId === "date") {
                      return (
                        <TableCell key={colId} className="font-bold tracking-wider uppercase">
                          Akumulasi Total
                        </TableCell>
                      );
                    }

                    // Kolom Total Konsumsi (Root Meta)
                    if (colId === "consumption") {
                      return (
                        <TableCell key={colId} className="font-bold">
                          {totalConsumption ? formatDecimal(totalConsumption) : "-"}
                        </TableCell>
                      );
                    }

                    // Kolom Biaya (Root Meta)
                    if (colId === "cost") {
                      return (
                        <TableCell key={colId} className="text-primary font-bold">
                          {totalCost ? formatCurrency(totalCost) : "-"}
                        </TableCell>
                      );
                    }

                    // Kolom Berupa Angka / Total dari column_totals (Termasuk BBM, Sisa Stok, dll)
                    if (columnTotals[colId] !== undefined) {
                      const val = columnTotals[colId];
                      return (
                        <TableCell key={colId} className="font-bold">
                          {val !== null && val !== undefined ? formatDecimal(val) : "-"}
                        </TableCell>
                      );
                    }

                    // Kolom Pax (Format Integer)
                    if (colId === "pax") {
                      const val = columnTotals[colId];
                      return (
                        <TableCell key={colId} className="font-bold">
                          {val ? formatInt(val) : "-"}
                        </TableCell>
                      );
                    }

                    // Kolom Lainnya yang Tidak Perlu Akumulasi Total
                    return (
                      <TableCell key={colId} className="text-muted-foreground text-center">
                        -
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground text-sm">
          Menampilkan {table.getRowModel().rows.length} baris data
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}