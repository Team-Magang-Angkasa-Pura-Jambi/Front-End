"use client";

import React from "react";
import { Column, ColumnDef, Row } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Briefcase,
  Calendar,
  DollarSign,
  Droplets,
  Flame,
  Fuel,
  Home,
  Target,
  TrendingDown,
  TrendingUp,
  Thermometer,
  Users,
  BrainCircuit,
  Tags,
  Zap,
  Loader2,
} from "lucide-react";
import { Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import { RecapDataRow } from "../types/recap.type";
import {
  runSingleClassificationApi,
  runSinglePredictionApi,
} from "../services/recap.service";

const formatCurrency = (amount: unknown): string => {
  const num = Number(amount);

  if (amount === null || amount === undefined || isNaN(num)) {
    return "-";
  }
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return formatted.replace(/\s/g, "");
};

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
  column: Column<RecapDataRow, unknown>;
  title: string;
}) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="text-left p-0 h-auto hover:bg-transparent"
  >
    {title}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

const ClassificationBadge = ({
  classification,
}: {
  classification: RecapDataRow["classification"];
}) => {
  if (!classification || classification === "UNKNOWN") {
    return <span className="text-muted-foreground">-</span>;
  }

  const colorMap: Record<"HEMAT" | "NORMAL" | "BOROS", string> = {
    HEMAT: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
    NORMAL: "",
    BOROS: "",
  };

  const variantMap: Record<
    "HEMAT" | "NORMAL" | "BOROS",
    "default" | "destructive"
  > = {
    HEMAT: "default",
    NORMAL: "default",
    BOROS: "destructive",
  };

  return (
    <Badge
      className={cn("w-20 justify-center", colorMap[classification])}
      variant={variantMap[classification]}
    >
      {classification}
    </Badge>
  );
};

const PredictionCell = ({
  row,
  meterId,
}: {
  row: Row<RecapDataRow>;
  meterId: number | null;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    { date: string; meterId: number }
  >({
    mutationFn: runSinglePredictionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recapData"] });
      toast.success("Prediksi berhasil dijalankan.", {
        description: "Data mungkin memerlukan beberapa saat untuk diperbarui.",
      });
    },
    onError: (error) => {
      toast.error("Gagal menjalankan prediksi.", {
        description: error.response?.data?.status?.message || error.message,
      });
    },
  });

  const handlePredict = () => {
    if (!meterId) {
      toast.warning(
        "Pilih satu meter terlebih dahulu untuk melakukan prediksi."
      );
      return;
    }
    const date = new Date(row.original.date).toISOString().split("T")[0];
    mutate({ date, meterId });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePredict}
      disabled={isPending || !meterId}
      className="w-full"
    >
      <span className="mr-2 h-4 w-4 flex items-center justify-center">
        {isPending ? (
          <Loader2 key="loading" className="animate-spin" />
        ) : (
          <BrainCircuit className="mr-2 h-4 w-4" />
        )}
      </span>
      Prediksi
    </Button>
  );
};

const ClassificationActionCell = ({
  row,
  meterId,
}: {
  row: Row<RecapDataRow>;
  meterId: number | null;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    { date: string; meterId: number }
  >({
    mutationFn: runSingleClassificationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recapData"] });
      toast.success("Klasifikasi berhasil dijalankan.", {
        description: "Data mungkin memerlukan beberapa saat untuk diperbarui.",
      });
    },
    onError: (error) => {
      toast.error("Gagal menjalankan klasifikasi.", {
        description: error.response?.data?.status?.message || error.message,
      });
    },
  });

  const handleClassify = () => {
    if (!meterId) {
      toast.warning(
        "Pilih satu meter terlebih dahulu untuk melakukan klasifikasi."
      );
      return;
    }
    const date = new Date(row.original.date).toISOString().split("T")[0];
    mutate({ date, meterId });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClassify}
      disabled={isPending || !meterId}
      className="w-full"
    >
      <span className="mr-2 h-4 w-4 flex items-center justify-center">
        {isPending ? (
          <Loader2 key="loading" className="animate-spin" />
        ) : (
          <BrainCircuit className="mr-2 h-4 w-4" />
        )}
      </span>
      Klasifikasi
    </Button>
  );
};
export const createColumns = (
  dataType: "Electricity" | "Water" | "Fuel",
  meterId: number | null
): ColumnDef<RecapDataRow>[] => {
  const baseColumns: ColumnDef<RecapDataRow>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tanggal" />
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("date") as string | Date;
        if (!dateValue) return "-";

        const dateOnlyString = new Date(dateValue).toISOString().split("T")[0];

        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(`${dateOnlyString}T00:00:00`), "dd MMM yyyy", {
                locale: id,
              })}
            </span>
          </div>
        );
      },
    },
  ];

  let specificColumns: ColumnDef<RecapDataRow>[] = [];

  switch (dataType) {
    case "Electricity":
      specificColumns = [
        {
          accessorKey: "target",
          header: ({ column }) => (
            <SortableHeader column={column} title="Target (kWh)" />
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{formatNumber(row.getValue("target"))}</span>
            </div>
          ),
        },
        {
          accessorKey: "wbp",
          header: ({ column }) => (
            <SortableHeader column={column} title="WBP (kWh)" />
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>{formatNumber(row.getValue("wbp"))}</span>
            </div>
          ),
        },
        {
          accessorKey: "lwbp",
          header: ({ column }) => (
            <SortableHeader column={column} title="LWBP (kWh)" />
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>{formatNumber(row.getValue("lwbp"))}</span>
            </div>
          ),
        },
        {
          accessorKey: "consumption",
          header: ({ column }) => (
            <SortableHeader column={column} title="Total Konsumsi (kWh)" />
          ),
          cell: ({ row }) => formatNumber(row.getValue("consumption")),
        },

        {
          accessorKey: "pax",
          header: ({ column }) => (
            <SortableHeader column={column} title="Pax" />
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{formatNumber(row.getValue("pax"))}</span>
            </div>
          ),
        },
        {
          accessorKey: "avg_temp",
          header: ({ column }) => (
            <SortableHeader column={column} title="Suhu (°C)" />
          ),
          cell: ({ row }) => {
            const avgTemp = row.getValue("avg_temp") as number;
            const maxTemp = row.original.max_temp;
            const isHotMaxTemp = maxTemp > 30;
            const isHotAvgTemp = avgTemp > 30;

            return (
              <div className="flex flex-col gap-2 ">
                <Badge variant={isHotAvgTemp ? "destructive" : "secondary"}>
                  <div className="flex items-center gap-1.5">
                    {isHotAvgTemp ? (
                      <Flame className="h-4 w-4" />
                    ) : (
                      <Thermometer className="h-4 w-4" />
                    )}
                    <span>{formatNumber(avgTemp)}</span>
                  </div>
                </Badge>
                <Badge variant={isHotMaxTemp ? "destructive" : "secondary"}>
                  <div className="flex items-center gap-1.5">
                    {isHotMaxTemp ? (
                      <Flame className="h-4 w-4" />
                    ) : (
                      <Thermometer className="h-4 w-4" />
                    )}
                    <span>{formatNumber(maxTemp)}</span>
                  </div>
                </Badge>
              </div>
            );
          },
        },
        {
          accessorKey: "is_workday",
          header: ({ column }) => (
            <SortableHeader column={column} title="Hari Kerja" />
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              {row.getValue("is_workday") ? (
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Home className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{row.getValue("is_workday") ? "Hari Kerja" : "Libur"}</span>
            </div>
          ),
        },
        {
          accessorKey: "classification",
          header: ({ column }) => (
            <SortableHeader column={column} title="Nilai Deviasi" />
          ),
          cell: ({ row }) => {
            const classification = row.original.classification;
            const score = row.original.confidence_score;

            if (!classification || classification === "UNKNOWN") {
              return <ClassificationActionCell row={row} meterId={meterId} />;
            }

            const styleMap = {
              HEMAT: "text-green-600 dark:text-green-500",
              NORMAL: "text-slate-600 dark:text-slate-400",
              BOROS: "text-red-600 dark:text-red-500",
            } as const;

            const iconMap = {
              HEMAT: <TrendingDown className="h-3.5 w-3.5" />,
              NORMAL: <Minus className="h-3.5 w-3.5" />,
              BOROS: <TrendingUp className="h-3.5 w-3.5" />,
            };

            return (
              <div className="flex flex-col items-center justify-center gap-1.5 text-center">
                <ClassificationBadge classification={classification} />
                <div
                  className={`flex items-center gap-1 text-xs font-mono ${styleMap[classification]}`}
                >
                  {iconMap[classification]}
                  <span className="font-semibold">{`${score.toFixed(
                    1
                  )}%`}</span>
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "predict",
          header: ({ column }) => (
            <SortableHeader column={column} title="Prediksi" />
          ),
          cell: ({ row }) => {
            const predictionValue = row.original.prediction;
            return predictionValue != null ? (
              <div className="text-center font-mono">
                {formatNumber(predictionValue)}
              </div>
            ) : (
              <PredictionCell row={row} meterId={meterId} />
            );
          },
        },
      ];
      break;

    case "Water":
    case "Fuel":
      specificColumns = [
        {
          accessorKey: "target",
          header: ({ column }) => (
            <SortableHeader column={column} title="Target" />
          ),
          cell: ({ row }) => {
            const amount = row.getValue("target");
            const unit = dataType === "Water" ? "m³" : "L";
            return (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatNumber(amount)} {unit}
                </span>
              </div>
            );
          },
        },
        {
          accessorKey: "consumption",
          header: ({ column }) => (
            <SortableHeader column={column} title="Pemakaian" />
          ),
          cell: ({ row }) => {
            const amount = row.getValue("consumption");
            const unit = dataType === "Water" ? "m³" : "L";
            const Icon = dataType === "Water" ? Droplets : Fuel;
            return (
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatNumber(amount)} {unit}
                </span>
              </div>
            );
          },
        },
      ];
      break;
  }

  const commonEndColumns: ColumnDef<RecapDataRow>[] = [
    {
      accessorKey: "cost",
      header: ({ column }) => <SortableHeader column={column} title="Biaya" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{formatCurrency(row.getValue("cost"))}</span>
        </div>
      ),
    },
  ];

  return [...baseColumns, ...specificColumns, ...commonEndColumns];
};
