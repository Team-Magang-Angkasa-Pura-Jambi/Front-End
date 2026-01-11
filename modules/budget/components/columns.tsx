"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
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
import { DataTableRowActions } from "@/common/components/table/dataTableRowActions";

const EnergyTypeCell = ({ typeName }: { typeName: string }) => {
  let icon;
  let text;

  switch (typeName) {
    case "Electricity":
      icon = <Zap className="mr-2 h-4 w-4 text-yellow-500" />;
      text = "Listrik";
      break;
    case "Water":
      icon = <Droplets className="mr-2 h-4 w-4 text-blue-500" />;
      text = "Air";
      break;
    case "Fuel":
      icon = <Fuel className="mr-2 h-4 w-4 text-gray-500" />;
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
      const hasAllocations =
        row.original.allocations && row.original.allocations.length > 0;

      return hasAllocations ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={row.getToggleExpandedHandler()}
          className="h-8 w-8"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: "period_start",
    header: "Periode",
    cell: ({ row }) => {
      const startDate = format(new Date(row.original.period_start), "d LLL y");
      const endDate = format(new Date(row.original.period_end), "d LLL y");

      return (
        <div className="flex items-center font-medium">
          <span>{`${startDate} - ${endDate}`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "total_budget",
    header: "Total Budget",
    cell: ({ row }) => (
      <div className="text-primary font-semibold">
        {formatCurrency(Number(row.getValue("total_budget")))}
      </div>
    ),
  },
  {
    accessorKey: "totalRealization",
    header: "Realisasi",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {formatCurrency(row.original.totalRealization || 0)}
      </div>
    ),
  },
  {
    accessorKey: "realizationPercentage",
    header: "Usage (%)",
    cell: ({ row }) => {
      const percent = row.original.realizationPercentage || 0;
      return (
        <div
          className={cn(
            "font-bold",
            percent > 100 ? "text-destructive" : "text-green-600"
          )}
        >
          {percent.toFixed(2)}%
        </div>
      );
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
