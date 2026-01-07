import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import { AnnualBudget } from "@/common/types/budget"; // Pastikan type dasar ada

// Definisikan tipe tambahan karena properti ini hasil kalkulasi service (bukan raw DB)
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
      <div className="p-8 text-center bg-muted/30 border-t border-dashed text-muted-foreground text-sm">
        Tidak ada detail alokasi per meter untuk budget ini.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50 border-t border-dashed">
      <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
        📊 Detail Alokasi per Meter
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {meterAllocations.map((alloc) => (
          <Card
            key={alloc.allocation_id}
            className="bg-background/80 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between space-y-0">
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
            <CardContent className="text-xs space-y-2 pb-4">
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-muted-foreground">Alokasi</span>
                <span className="font-medium">
                  {formatCurrency(alloc.allocatedBudget || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-muted-foreground">Realisasi</span>
                <span className="font-medium">
                  {formatCurrency(alloc.totalRealization || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
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

              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between items-center">
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
                <div className="h-1.5 w-full bg-secondary mt-1 rounded-full overflow-hidden">
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
