"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { ApiErrorResponse } from "@/common/types/api";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowUpDown,
  BrainCircuit,
  Briefcase,
  Calendar,
  Droplets,
  Flame,
  Fuel,
  Home,
  Loader2,
  Minus,
  Target,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { RecapDataRow } from "../types/recap.type";

import { classifiesApi } from "../services/classify.service";
import { predictApi } from "../services/predict.service";

const idrFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

const formatCurrency = (val: unknown): string => {
  const num = Number(val);
  if (val == null || isNaN(num)) return "-";
  return idrFormat.format(num).replace(/\s/g, "");
};

const formatNumber = (val: unknown): string => {
  const num = Number(val);
  if (val == null || isNaN(num)) return "-";
  return numFormat.format(num);
};

const SortableHeader = ({ column, title }: { column: Column<any, any>; title: string }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="h-auto p-0 text-left font-bold hover:bg-transparent"
  >
    {title}
    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
  </Button>
);

const IconLabel = ({ icon: Icon, label }: { icon: React.ElementType; label: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
    <span className="font-medium">{label}</span>
  </div>
);

const CLASSIFICATION_MAP = {
  HEMAT: {
    badge: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
    text: "text-emerald-600 dark:text-emerald-500",
    icon: TrendingDown,
  },
  NORMAL: {
    badge: "bg-slate-100 hover:bg-slate-200 text-slate-800 border-transparent",
    text: "text-slate-600 dark:text-slate-400",
    icon: Minus,
  },
  BOROS: {
    badge: "bg-destructive hover:bg-destructive/90 text-white border-transparent",
    text: "text-red-600 dark:text-red-500",
    icon: TrendingUp,
  },
} as const;

type ClassificationType = keyof typeof CLASSIFICATION_MAP;

const normalizeClassification = (raw: unknown): ClassificationType | null => {
  if (!raw || typeof raw !== "string") return null;
  const upper = raw.toUpperCase().trim();
  if (upper === "UNKNOWN" || upper === "") return null;
  if (
    upper.includes("EFISIEN") ||
    upper.includes("HEMAT") ||
    upper.includes("LAYANAN TIDAK MAKSIMAL") ||
    upper.includes("SANGAT EFISIEN")
  ) {
    return "HEMAT";
  }
  if (upper === "NORMAL") {
    return "NORMAL";
  }
  if (upper.includes("BOROS") || upper.includes("OVER BUDGET")) {
    return "BOROS";
  }
  return null;
};

const AiActionCell = ({
  row,
  meterId,
  actionType,
}: {
  row: Row<RecapDataRow>;
  meterId: number | null;
  actionType: "predict" | "classify";
}) => {
  const queryClient = useQueryClient();
  const isPredict = actionType === "predict";

  type ActionVariables = {
    meterId: number;
    rowData: RecapDataRow;
  };

  const { mutate, isPending } = useMutation<unknown, AxiosError<ApiErrorResponse>, ActionVariables>(
    {
      mutationFn: async ({ meterId, rowData }) => {
        const date = String(rowData.date).split("T")[0];

        if (isPredict) {
          return predictApi({
            date,
            meterId,
          });
        } else {
          return classifiesApi({
            meter_id: meterId,
            summary_id: rowData.id,
            suhu_rata: rowData.suhu_rata_rata ?? undefined,
            suhu_max: rowData.suhu_max ?? undefined,
            pax: rowData.pax ?? undefined,
            is_hari_kerja: rowData.is_workday === true ? 1 : 0,
          });
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recapData"] });
        toast.success(`${isPredict ? "Prediksi" : "Klasifikasi"} berhasil dijalankan.`, {
          description: "Data akan segera diperbarui.",
        });
      },
      onError: (error) => {
        toast.error(`Gagal menjalankan ${isPredict ? "prediksi" : "klasifikasi"}.`, {
          description: error.response?.data?.status?.message || error.message,
        });
      },
    }
  );

  const handleAction = () => {
    if (!meterId) {
      toast.warning(
        `Pilih satu meter terlebih dahulu untuk melakukan ${isPredict ? "prediksi" : "klasifikasi"}.`
      );
      return;
    }
    mutate({ meterId, rowData: row.original });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAction}
      disabled={isPending || !meterId}
      className="w-full shadow-sm"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <BrainCircuit className="mr-2 h-4 w-4" />
      )}
      {isPredict ? "Prediksi" : "Klasifikasi"}
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
      header: ({ column }) => <SortableHeader column={column} title="Tanggal" />,
      cell: ({ row }) => {
        const dateValue = row.getValue("date") as string;
        if (!dateValue) return "-";
        const cleanDate = dateValue.split("T")[0];
        return (
          <IconLabel
            icon={Calendar}
            label={format(new Date(`${cleanDate}T00:00:00`), "dd MMM yyyy", { locale: id })}
          />
        );
      },
    },
  ];

  const isElectricity = dataType === "Electricity";
  const dynamicColumns: ColumnDef<RecapDataRow>[] = isElectricity
    ? [
        {
          accessorKey: "target",
          header: ({ column }) => <SortableHeader column={column} title="Target (kWh)" />,
          cell: ({ row }) => (
            <IconLabel icon={Target} label={formatNumber(row.getValue("target"))} />
          ),
        },
        {
          accessorKey: "pemakaian wbp",
          header: ({ column }) => <SortableHeader column={column} title="WBP (kWh)" />,
          cell: ({ row }) => (
            <IconLabel icon={Zap} label={formatNumber(row.getValue("pemakaian wbp"))} />
          ),
        },
        {
          accessorKey: "pemakaian lwbp",
          header: ({ column }) => <SortableHeader column={column} title="LWBP (kWh)" />,
          cell: ({ row }) => (
            <IconLabel icon={Zap} label={formatNumber(row.getValue("pemakaian lwbp"))} />
          ),
        },
        {
          accessorKey: "consumption",
          header: ({ column }) => <SortableHeader column={column} title="Total Konsumsi (kWh)" />,
          cell: ({ row }) => (
            <span className="font-semibold">{formatNumber(row.getValue("consumption"))}</span>
          ),
        },
        {
          accessorKey: "pax",
          header: ({ column }) => <SortableHeader column={column} title="Pax" />,
          cell: ({ row }) => <IconLabel icon={Users} label={formatNumber(row.getValue("pax"))} />,
        },
        {
          id: "suhu",
          header: ({ column }) => <SortableHeader column={column} title="Suhu (°C)" />,
          cell: ({ row }) => {
            const rawAvg = row.original.suhu_rata_rata;
            const rawMax = row.original.suhu_max;

            if (
              (rawAvg === null || rawAvg === undefined) &&
              (rawMax === null || rawMax === undefined)
            ) {
              return <span className="text-muted-foreground">-</span>;
            }

            const avgTemp = rawAvg !== null && rawAvg !== undefined ? Number(rawAvg) : null;
            const maxTemp = rawMax !== null && rawMax !== undefined ? Number(rawMax) : null;

            return (
              <div className="flex flex-col gap-1.5">
                {avgTemp !== null && (
                  <Badge
                    variant={avgTemp > 30 ? "destructive" : "secondary"}
                    className="w-fit text-[10px]"
                    title="Suhu Rata-rata"
                  >
                    {avgTemp > 30 ? (
                      <Flame className="mr-1 h-3 w-3" />
                    ) : (
                      <Thermometer className="mr-1 h-3 w-3" />
                    )}
                    Avg: {formatNumber(avgTemp)}
                  </Badge>
                )}

                {maxTemp !== null && (
                  <Badge
                    variant={maxTemp > 30 ? "destructive" : "secondary"}
                    className="w-fit text-[10px]"
                    title="Suhu Maksimal"
                  >
                    {maxTemp > 30 ? (
                      <Flame className="mr-1 h-3 w-3" />
                    ) : (
                      <Thermometer className="mr-1 h-3 w-3" />
                    )}
                    Max: {formatNumber(maxTemp)}
                  </Badge>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: "hari_kerja",
          header: ({ column }) => <SortableHeader column={column} title="Hari Kerja" />,
          cell: ({ row }) => {
            const isWorkday = row.getValue("hari_kerja") === "Kerja";
            return (
              <IconLabel
                icon={isWorkday ? Briefcase : Home}
                label={isWorkday ? "Hari Kerja" : "Libur"}
              />
            );
          },
        },
        {
          accessorKey: "classification",
          header: ({ column }) => <SortableHeader column={column} title="Nilai Deviasi" />,
          cell: ({ row }) => {
            const rawClass = row.original.classification;
            const type = normalizeClassification(rawClass);
            const score = row.original.confidence_score;

            // Tampilkan tombol action JIKA klasifikasi belum ada atau UNKNOWN
            if (!type || !CLASSIFICATION_MAP[type]) {
              return <AiActionCell row={row} meterId={meterId} actionType="classify" />;
            }

            const config = CLASSIFICATION_MAP[type];
            const TrendIcon = config.icon;

            return (
              <div className="flex flex-col items-center justify-center gap-2">
                <Badge className={cn("w-20 justify-center shadow-sm", config.badge)}>
                  {rawClass} {/* Tetap pertahankan format aslinya saat ditampilkan */}
                </Badge>
                <div
                  className={cn("flex items-center gap-1 font-mono text-xs font-bold", config.text)}
                >
                  <TrendIcon className="h-3.5 w-3.5" />
                  {score != null ? `${score.toFixed(1)}%` : "-"}
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "predict",
          header: ({ column }) => <SortableHeader column={column} title="Prediksi" />,
          cell: ({ row }) => {
            const pred = row.original.prediction;

            // PERBAIKAN 3: Validasi ketat untuk tipe data null dan undefined
            if (pred !== null && pred !== undefined) {
              return (
                <div className="text-primary text-center font-mono font-semibold">
                  {formatNumber(pred)}
                </div>
              );
            }

            // Jika kosong, tampilkan action button
            return <AiActionCell row={row} meterId={meterId} actionType="predict" />;
          },
        },
      ]
    : [
        {
          accessorKey: "target",
          header: ({ column }) => <SortableHeader column={column} title="Target" />,
          cell: ({ row }) => (
            <IconLabel
              icon={Target}
              label={`${formatNumber(row.getValue("target"))} ${dataType === "Water" ? "m³" : "L"}`}
            />
          ),
        },
        {
          accessorKey: "consumption",
          header: ({ column }) => <SortableHeader column={column} title="Pemakaian" />,
          cell: ({ row }) => (
            <IconLabel
              icon={dataType === "Water" ? Droplets : Fuel}
              label={`${formatNumber(row.getValue("consumption"))} ${dataType === "Water" ? "m³" : "L"}`}
            />
          ),
        },
      ];

  const commonEndColumns: ColumnDef<RecapDataRow>[] = [
    {
      accessorKey: "cost",
      header: ({ column }) => <SortableHeader column={column} title="Biaya" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
          <Wallet className="h-4 w-4 shrink-0 text-emerald-600" />
          {formatCurrency(row.getValue("cost"))}
        </div>
      ),
    },
  ];

  return [...baseColumns, ...dynamicColumns, ...commonEndColumns];
};
