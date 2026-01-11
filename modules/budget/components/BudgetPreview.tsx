import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns-tz";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/common/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { useDebounce } from "@uidotdev/usehooks";
import { getBudgetPreviewApi } from "../services/analytics.service";

export const BudgetPreview = () => {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<AnnualBudgetFormValues>();

  const watchedFields = useWatch({
    control,
    name: [
      "total_budget",
      "period_start",
      "period_end",
      "allocations",
      "parent_budget_id",
    ],
  });

  const debouncedFields = useDebounce(watchedFields, 500);
  const [
    total_budget,
    period_start,
    period_end,
    allocations,
    parent_budget_id,
  ] = debouncedFields;

  const hasErrors =
    errors.total_budget || errors.period_start || errors.period_end;

  const canFetchPreview =
    !hasErrors &&
    (total_budget > 0 || parent_budget_id) &&
    period_start instanceof Date &&
    period_end instanceof Date;

  const {
    data: previewData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "budgetPreview",
      parent_budget_id,
      total_budget,
      period_start,
      period_end,
    ],
    queryFn: () =>
      getBudgetPreviewApi({
        parent_budget_id,
        total_budget: Number(total_budget) || 0,
        period_start: period_start
          ? format(period_start, "yyyy-MM-dd", { timeZone: "UTC" })
          : "",
        period_end: period_end
          ? format(period_end, "yyyy-MM-dd", { timeZone: "UTC" })
          : "",
        allocations: allocations?.map((alloc) => ({
          meter_id: alloc.meter_id,
          weight: alloc.weight,
        })),
      }),
    enabled: !!canFetchPreview,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <Card className="bg-muted/50 col-span-2 border-dashed transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Saran & Pratinjau Anggaran</CardTitle>
      </CardHeader>
      <CardContent>
        {!canFetchPreview && !isLoading && (
          <p className="text-muted-foreground text-sm">
            Isi Total Budget, Periode Mulai, dan Periode Selesai untuk melihat
            pratinjau.
          </p>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="text-primary h-4 w-4 animate-spin" />
            <span className="text-muted-foreground text-sm">
              Menghitung pratinjau...
            </span>
          </div>
        )}
        {isError && (
          <p className="text-destructive text-sm">Gagal memuat pratinjau.</p>
        )}
        {previewData && !isLoading && !isError && (
          <>
            <p className="text-primary text-2xl font-bold">
              {formatCurrency(
                previewData.calculationDetails?.budgetPerMonth || 0
              )}{" "}
              / bulan
            </p>
            <p className="text-muted-foreground text-xs">
              Estimasi alokasi rata-rata per bulan berdasarkan data historis.
            </p>
            {previewData.calculationDetails?.suggestedBudgetForPeriod > 0 && (
              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-2 text-xs dark:border-blue-800/50 dark:bg-blue-900/20">
                <p className="text-blue-800 dark:text-blue-300">
                  Saran Budget untuk Periode Ini:{" "}
                  <strong>
                    {formatCurrency(
                      previewData.calculationDetails.suggestedBudgetForPeriod
                    )}
                  </strong>
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    setValue(
                      "total_budget",
                      Number(
                        previewData.calculationDetails.suggestedBudgetForPeriod.toFixed(
                          0
                        )
                      )
                    )
                  }
                >
                  <Copy className="mr-1 h-3 w-3" /> Gunakan nilai ini
                </Button>
              </div>
            )}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold">Pratinjau per Meter:</h4>
              {previewData.meterAllocationPreview.map((meter) => (
                <div
                  key={meter.meterId}
                  className="text-muted-foreground flex justify-between text-xs"
                >
                  <span>{meter.meterName}</span>
                  <span className="font-medium">
                    {formatCurrency(meter.allocatedBudget)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetPreview;
