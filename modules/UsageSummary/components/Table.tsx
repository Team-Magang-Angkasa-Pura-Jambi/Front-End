"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import { EnergyTypeName } from "@/common/types/energy";
import { RecapDataRow, RecapMeta } from "../types/recap.type";

interface RecapTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  meta: RecapMeta | undefined;
  dataType: EnergyTypeName;
}

export function RecapTable<TData extends RecapDataRow, TValue>({
  columns,
  data,
  isLoading,
  meta,
}: RecapTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
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

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-foreground font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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

          {!isLoading && data.length > 0 && (
            <TableFooter className="bg-muted/30">
              <TableRow>
                {/* Penyesuaian Kolom Footer berdasarkan tipe energi */}
                <TableCell
                  colSpan={columns.length - 3}
                  className="pr-6 text-right font-bold"
                >
                  Akumulasi Total
                </TableCell>

                <TableCell className="font-bold">
                  {meta?.totalConsumption
                    ? formatDecimal(meta.totalConsumption)
                    : "-"}
                </TableCell>

                <TableCell className="font-bold">
                  {meta?.totalPax ? formatInt(meta.totalPax) : "-"}
                </TableCell>

                <TableCell className="min-w-[200px] font-bold">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                        DPP (Netto)
                      </span>
                      <span>
                        {meta?.totalCostBeforeTax
                          ? formatCurrency(meta.totalCostBeforeTax)
                          : "-"}
                      </span>
                    </div>
                    <div className="border-muted-foreground/20 mt-1 flex items-center justify-between gap-2 border-t pt-1">
                      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                        Total Bruto
                      </span>
                      <span className="text-primary">
                        {meta?.totalCost ? formatCurrency(meta.totalCost) : "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
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
