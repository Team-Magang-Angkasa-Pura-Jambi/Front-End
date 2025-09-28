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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecapMeta, RecapDataRow } from "../type"; // Impor tipe yang relevan

// --- Tipe Props ---
interface RecapTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  meta: RecapMeta | undefined;
  dataType: "Electricity" | "Water" | "Fuel";
}

// --- Komponen Utama ---
export function RecapTable<TData extends RecapDataRow, TValue>({
  columns,
  data,
  isLoading,
  meta,
  dataType,
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

  // --- Komponen Skeleton (Placeholder saat Loading) ---
  const TableSkeleton = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {columns.map((col, j) => (
          <TableCell key={j}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));

  // --- Fungsi Helper untuk Format Mata Uang ---
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDecimal = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "decimal", // Diubah dari "currency" menjadi "decimal"
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  const formatInt = (amount: unknown): string => {
    const num = Number(amount);
    if (amount === null || amount === undefined || isNaN(num)) {
      return "-";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "decimal", // Gunakan 'decimal' untuk angka biasa
      maximumFractionDigits: 0, // Hapus semua angka di belakang koma
    }).format(num);
  };

  // --- JSX ---
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
              <TableSkeleton />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
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
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {!isLoading && data.length > 0 && (
            <TableFooter>
              <TableRow>
                {dataType === "Electricity" ? (
                  <>
                    <TableCell
                      colSpan={columns.length - 3}
                      className="font-bold "
                    >
                      Total
                    </TableCell>
                    {/* <TableCell className="font-bold ">
                      {meta?.totalTarget
                        ? meta.totalTarget.toLocaleString("id-ID", {
                            minimumFractionDigits: 2,
                          })
                        : "-"}
                    </TableCell> */}
                    <TableCell className="font-bold  ">
                      {meta?.totalConsumption
                        ? formatDecimal(meta.totalConsumption)
                        : "-"}
                    </TableCell>
                    <TableCell className="font-bold  ">
                      {meta?.totalPax ? formatInt(meta.totalPax) : "-"}
                    </TableCell>
                    <TableCell className="font-bold ">
                      {meta?.totalCost ? formatCurrency(meta.totalCost) : "-"}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell
                      colSpan={columns.length - 2}
                      className="font-bold "
                    >
                      Total Biaya
                    </TableCell>
                    <TableCell className="font-bold ">
                      {meta?.totalConsumption
                        ? formatDecimal(meta.totalConsumption)
                        : "-"}
                    </TableCell>
                    <TableCell className="font-bold ">
                      {meta?.totalCost ? formatCurrency(meta.totalCost) : "-"}
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
}
