import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import { AnnualBudget } from "@/common/types/budget";

interface ExtendedAllocation {
  allocation_id: number;
  allocatedBudget: number;
  totalRealization: number;
  remainingBudget: number;
  realizationPercentage: number | null;
  meter?: {
    meter_code: string;
    meter_name?: string;
  };
}

export const MeterAllocationDetails = ({
  annualBudget,
}: {
  annualBudget: AnnualBudget & { allocations?: ExtendedAllocation[] };
}) => {
  const meterAllocations = annualBudget.allocations || [];

  if (meterAllocations.length === 0) {
    return (
      <div className="bg-muted/30 text-muted-foreground border-t border-dashed p-8 text-center text-sm">
        Tidak ada detail alokasi per meter untuk budget ini.
      </div>
    );
  }

  return (
    <div className="bg-muted/50 border-t border-dashed p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        📊 Detail Alokasi per Meter
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meterAllocations.map((alloc) => (
          <Card
            key={alloc.allocation_id}
            className="bg-background/80 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-sm font-bold">
                {/* Gunakan Optional Chaining jaga-jaga jika meter terhapus */}
                {alloc.meter?.meter_code || "Unknown Meter"}
              </CardTitle>
              {/* Opsional: Tampilkan status kecil */}
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  (alloc.remainingBudget ?? 0) < 0
                    ? "bg-red-500"
                    : "bg-green-500"
                )}
              />
            </CardHeader>
            <CardContent className="space-y-2 pb-4 text-xs">
              <div className="flex items-center justify-between border-b pb-1">
                <span className="text-muted-foreground">Alokasi</span>
                <span className="font-medium">
                  {formatCurrency(alloc.allocatedBudget || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-1">
                <span className="text-muted-foreground">Realisasi</span>
                <span className="font-medium">
                  {formatCurrency(alloc.totalRealization || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Sisa</span>
                <span
                  className={cn(
                    "font-medium",
                    (alloc.remainingBudget ?? 0) < 0
                      ? "text-destructive"
                      : "text-primary"
                  )}
                >
                  {formatCurrency(alloc.remainingBudget || 0)}
                </span>
              </div>

              <div className="mt-2 border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Realisasi %</span>
                  <span
                    className={cn(
                      "font-bold",
                      (alloc.realizationPercentage || 0) > 100
                        ? "text-destructive"
                        : "text-primary"
                    )}
                  >
                    {/* Safety check: handle null/undefined sebelum toFixed */}
                    {(alloc.realizationPercentage ?? 0).toFixed(2)}%
                  </span>
                </div>
                {/* Progress Bar Visual */}
                <div className="bg-secondary mt-1 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      (alloc.realizationPercentage || 0) > 100
                        ? "bg-destructive"
                        : "bg-primary"
                    )}
                    style={{
                      width: `${Math.min(
                        alloc.realizationPercentage || 0,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
