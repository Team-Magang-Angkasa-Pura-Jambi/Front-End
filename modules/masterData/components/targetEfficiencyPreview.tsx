import React, { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { AlertTriangle, CheckCircle2, Copy } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/lib/utils";

import { getEfficiencyTargetPreviewApi } from "../services/targetEfficiency.service";
import { TargetEfficiencyFormValues } from "../schemas/targetEfficiency.schema";
import { formatCurrency } from "@/utils/formatCurrency";

// --- Helper Component ---
interface SuggestionCardProps {
  type: "standard" | "efficiency";
  message: string;
  value: number;
  onApply: (val: number) => void;
}

const SuggestionCard = ({
  type,
  message,
  value,
  onApply,
}: SuggestionCardProps) => {
  const isEfficiency = type === "efficiency";
  const bgColor = isEfficiency
    ? "bg-green-50 dark:bg-green-900/20 border-green-200"
    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200";
  const textColor = isEfficiency
    ? "text-green-800 dark:text-green-300"
    : "text-blue-800 dark:text-blue-300";

  return (
    <div className={cn("mt-2 text-xs p-2 border rounded-md", bgColor)}>
      <p className={cn("mb-1", textColor)}>{message}</p>
      <Button
        type="button"
        variant="link"
        size="sm"
        className={cn(
          "p-0 h-auto font-semibold",
          isEfficiency ? "text-green-600" : "text-blue-600"
        )}
        onClick={() => onApply(value)}
      >
        <Copy className="mr-1 h-3 w-3" /> Gunakan nilai ini (
        {value?.toFixed(2) ?? "0"})
      </Button>
    </div>
  );
};

// --- Main Component ---

export const TargetEfficiencyPreview = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TargetEfficiencyFormValues>();

  const watchedFields = useWatch({
    control,
    name: ["meter_id", "target_value", "period_start", "period_end"],
  });

  const debouncedValues = useDebounce(watchedFields, 500);
  const [meter_id, target_value, period_start, period_end] = debouncedValues;

  const hasFieldErrors =
    !!errors.meter_id ||
    !!errors.target_value ||
    !!errors.period_start ||
    !!errors.period_end;

  const canFetchPreview =
    !hasFieldErrors &&
    !!meter_id &&
    Number(target_value) >= 0 &&
    period_start instanceof Date &&
    !isNaN(period_start.getTime()) &&
    period_end instanceof Date &&
    !isNaN(period_end.getTime());

  const {
    data: previewDataResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "efficiencyTargetPreview",
      meter_id,
      target_value,
      period_start,
      period_end,
    ],
    queryFn: () =>
      getEfficiencyTargetPreviewApi({
        meter_id: Number(meter_id),
        target_value: Number(target_value),
        period_start: period_start as Date,
        period_end: period_end as Date,
        kpi_name: "Preview",
      }),
    enabled: canFetchPreview,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const previewData = useMemo(
    () => previewDataResponse?.data,
    [previewDataResponse?.data]
  );

  const isExceedingBudget = useMemo(() => {
    if (!previewData?.budget || !previewData?.preview) return false;
    const estimatedCost = previewData.preview.estimatedTotalCost ?? 0;
    const remainingBudget = previewData.budget.remainingBudget ?? 0;
    return estimatedCost > remainingBudget;
  }, [previewData]);

  // UPDATE: Lokasi properti berubah (ada di preview, bukan calculation)
  const unitName = previewData?.preview?.unitOfMeasurement ?? "kWh";
  const totalDays = previewData?.preview?.totalDays ?? 0;
  const inputTotalKwh = previewData?.preview?.inputTotalKwh ?? 0;

  // Hitung manual daily jika backend tidak menyediakan
  const dailyTarget = totalDays > 0 ? inputTotalKwh / totalDays : 0;

  const formatUnit = (val: number | undefined) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(
      val ?? 0
    );

  return (
    <Card className="col-span-2 mt-4 border-dashed bg-muted/50 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Pratinjau & Estimasi
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!canFetchPreview && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Lengkapi data meter, target, dan periode untuk melihat estimasi
            biaya.
          </p>
        )}

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Gagal memuat pratinjau
            </p>
            <p className="mt-1 text-xs opacity-90">
              {error.message ?? "Terjadi kesalahan."}
            </p>
          </div>
        )}

        {previewData && !isLoading && !isError && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* --- Status & Cost Section --- */}
            <div className="flex items-start gap-3">
              {isExceedingBudget ? (
                <AlertTriangle className="mt-1 h-8 w-8 shrink-0 text-amber-500" />
              ) : (
                <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-green-600" />
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Estimasi Total Biaya
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold tracking-tight",
                    isExceedingBudget ? "text-amber-600" : "text-primary"
                  )}
                >
                  {formatCurrency(
                    previewData?.preview?.estimatedTotalCost ?? 0
                  )}
                </p>

                {previewData?.budget ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sisa Anggaran:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        isExceedingBudget && "text-destructive"
                      )}
                    >
                      {formatCurrency(previewData.budget.remainingBudget ?? 0)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    Tidak ada data anggaran untuk periode ini.
                  </p>
                )}
              </div>
            </div>

            {/* --- Calculation Details (UPDATED PATHS) --- */}
            <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-xs sm:grid-cols-2">
              <div>
                <span className="block text-muted-foreground">
                  Total Konsumsi
                </span>
                <span className="font-semibold text-foreground">
                  {formatUnit(inputTotalKwh)} {unitName}
                </span>
              </div>
              <div>
                <span className="block text-muted-foreground">Durasi</span>
                <span className="font-semibold text-foreground">
                  {totalDays} Hari
                </span>
              </div>
              <div>
                <span className="block text-muted-foreground">
                  Rata-rata Harian
                </span>
                <span className="font-semibold text-foreground">
                  {formatUnit(dailyTarget)} {unitName}/hari
                </span>
              </div>
              <div>
                <span className="block text-muted-foreground">
                  Harga Rata-rata
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(previewData?.preview?.avgPricePerUnit ?? 0)} /{" "}
                  {unitName}
                </span>
              </div>
            </div>

            {/* --- AI Suggestions --- */}
            {(previewData?.suggestion?.standard ||
              previewData?.suggestion?.efficiency) && (
              <div className="mt-4 space-y-2 border-t pt-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Rekomendasi AI
                </p>

                {previewData.suggestion?.standard && (
                  <SuggestionCard
                    type="standard"
                    message={previewData.suggestion.standard.message}
                    value={previewData.suggestion.standard.suggestedDailyKwh}
                    onApply={(val) =>
                      setValue("target_value", Number(val.toFixed(2)))
                    }
                  />
                )}

                {previewData.suggestion?.efficiency && (
                  <SuggestionCard
                    type="efficiency"
                    message={previewData.suggestion.efficiency.message}
                    value={previewData.suggestion.efficiency.suggestedDailyKwh}
                    onApply={(val) =>
                      setValue("target_value", Number(val.toFixed(2)))
                    }
                  />
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
