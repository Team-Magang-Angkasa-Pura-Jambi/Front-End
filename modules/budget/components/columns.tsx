"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AnnualBudget } from "../types";
import { DataTableRowActions } from "./data-table-row-actions"; // Pastikan path ini benar

interface ColumnsProps {
  onEdit: (budget: AnnualBudget) => void;
  onDelete: (budget: AnnualBudget) => void;
}

export const getColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<AnnualBudget>[] => [
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
  {
    accessorKey: "energy_type.name",
    header: "Tipe Energi",
    cell: ({ row }) => row.original.energy_type?.name || "-",
  },
  {
    accessorKey: "total_budget",
    header: "Total Budget",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_budget"));
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "efficiency_tag",
    header: "Efficiency Tag",
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("efficiency_tag"));
      return (
        <div className="text-center">{`${(value * 100).toFixed(0)}%`}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
      </div>
    ),
  },
];
