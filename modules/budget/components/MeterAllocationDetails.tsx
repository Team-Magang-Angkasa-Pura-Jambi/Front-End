import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import { AnnualBudget } from "@/common/types/budget";

export const MeterAllocationDetails = ({
  annualBudget,
}: {
  annualBudget: AnnualBudget;
}) => {
  const meterAllocations = annualBudget.allocations || [];

  return (
    <div className="p-4 bg-muted/50 border-t border-dashed">
      <h4 className="font-semibold mb-2 text-sm">Detail Alokasi per Meter</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {meterAllocations.map((alloc) => (
          <Card key={alloc.allocation_id} className="bg-background/50">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">
                {alloc.meter.meter_code}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 pb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alokasi:</span>
                <span className="font-medium">
                  {formatCurrency(alloc.allocatedBudget)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Realisasi:</span>
                <span className="font-medium">
                  {formatCurrency(alloc.totalRealization)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa:</span>
                <span
                  className={cn(
                    "font-medium",
                    alloc.remainingBudget < 0 && "text-destructive"
                  )}
                >
                  {formatCurrency(alloc.remainingBudget)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Persentase:</span>
                <span className="font-bold text-primary">
                  {alloc.realizationPercentage.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
