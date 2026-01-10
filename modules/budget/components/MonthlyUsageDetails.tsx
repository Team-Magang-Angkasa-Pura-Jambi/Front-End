import { Loader2 } from "lucide-react";
import { MeterAllocationDetails } from "./MeterAllocationDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";
import { AnnualBudget } from "@/common/types/budget";

export const MonthlyUsageDetails = ({
  annualBudget,
}: {
  annualBudget: AnnualBudget;
}) => {
  const year = new Date(annualBudget.period_start).getFullYear();
  const monthlyData = annualBudget.monthlyAllocation || [];
  const isLoading = false;
  const isError = !monthlyData;

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Memuat detail bulanan...
        </p>
      </div>
    );
  }

  if (isError || !monthlyData) {
    return (
      <div className="p-4 text-center text-destructive">
        Gagal memuat detail pemakaian bulanan.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50">
      <MeterAllocationDetails annualBudget={annualBudget} />

      <h4 className="font-semibold mb-2 mt-6">
        Detail Pemakaian Anggaran Tahun {year}
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bulan</TableHead>
            <TableHead className="text-right">Alokasi</TableHead>
            <TableHead className="text-right">Realisasi</TableHead>
            <TableHead className="text-right">Sisa</TableHead>
            <TableHead className="text-right">Persentase</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthlyData?.map((item) => (
            <TableRow key={item.month}>
              <TableCell>{item.monthName}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.allocatedBudget)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.realizationCost)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.remainingBudget)}
              </TableCell>
              <TableCell className="text-right">
                {item.realizationPercentage != null
                  ? `${item.realizationPercentage.toFixed(2)}%`
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
