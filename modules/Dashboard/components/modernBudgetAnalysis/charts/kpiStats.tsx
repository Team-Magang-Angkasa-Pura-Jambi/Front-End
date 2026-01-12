import { Card, CardContent } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";

export const KpiStats = ({
  totals,
  isLoading,
}: {
  totals;
  isLoading: boolean;
}) => {
  if (isLoading || !totals) {
    return Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-24 w-full rounded-xl" />
    ));
  }

  const stats = [
    {
      label: "Anggaran Awal",
      val: totals.initial,
      color: "text-slate-800",
      bg: "",
    },
    {
      label: "Terpakai (YTD)",
      val: totals.totalUsed,
      color: "text-red-600",
      bg: "bg-red-50/50",
    },
    {
      label: "Sisa Saldo",
      val: totals.remaining,
      color: "text-black",
      bg: "bg-emerald-600 text-white",
    },
  ];

  return stats.map((stat, i) => {
    const { full } = formatCurrencySmart(stat.val);
    return (
      <Card
        key={i}
        className={`border-none shadow-sm ring-1 ring-slate-200 ${stat.bg}`}
      >
        <CardContent className="p-4">
          <p
            className={`text-[8px] font-bold uppercase tracking-wider ${
              i === 2 ? "text-emerald-100" : "text-slate-400"
            }`}
          >
            {stat.label}
          </p>
          <h3 className={`text-xl font-black mt-1 ${stat.color}`}>{full}</h3>
        </CardContent>
      </Card>
    );
  });
};
