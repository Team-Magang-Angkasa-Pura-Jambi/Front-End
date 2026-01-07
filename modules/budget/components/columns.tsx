"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Droplets,
  Fuel,
  Zap,
} from "lucide-react";
import { format } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import { AnnualBudget } from "@/common/types/budget";
import { DataTableRowActions } from "@/components/table/dataTableRowActions";

const EnergyTypeCell = ({ typeName }: { typeName: string }) => {
  let icon;
  let text;

  switch (typeName) {
    case "Electricity":
      icon = <Zap className="h-4 w-4 mr-2 text-yellow-500" />;
      text = "Listrik";
      break;
    case "Water":
      icon = <Droplets className="h-4 w-4 mr-2 text-blue-500" />;
      text = "Air";
      break;
    case "Fuel":
      icon = <Fuel className="h-4 w-4 mr-2 text-gray-500" />;
      text = "BBM";
      break;
    default:
      icon = null;
      text = typeName;
  }
  return (
    <div className="flex items-center">
      {icon}
      <span>{text}</span>
    </div>
  );
};

export const getColumns = (
  onEdit: (budget: AnnualBudget) => void,
  onDelete: (budget: AnnualBudget) => void
): ColumnDef<AnnualBudget>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: "period_start",
    header: "Periode",
    cell: ({ row }) => {
      const isChild = !!row.original.parent_budget_id;
      const startDate = format(new Date(row.original.period_start), "d LLL y");
      const endDate = format(new Date(row.original.period_end), "d LLL y");

      return (
        <div className={cn("flex items", isChild && "pl-4")}>
          {isChild && (
            <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <span>{`${startDate} - ${endDate}`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "total_budget",
    header: "Total Budget",
    cell: ({ row }) => (
      <div>{formatCurrency(parseFloat(row.getValue("total_budget")))}</div>
    ),
  },
  {
    accessorKey: "efficiency_tag",
    header: "Efficiency Tag",
    cell: ({ row }) => {
      const value = row.getValue("efficiency_tag") as number;
      return value ? `${(value * 100).toFixed(0)}%` : "-";
    },
  },
  {
    accessorKey: "energy_type.type_name",
    header: "Tipe Energi",
    cell: ({ row }) => {
      const energyType = row.original.energy_type;
      if (!energyType) return "-";

      return <EnergyTypeCell typeName={energyType.type_name} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
