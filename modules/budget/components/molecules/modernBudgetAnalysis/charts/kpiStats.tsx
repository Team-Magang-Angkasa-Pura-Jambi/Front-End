import { Card, CardContent } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";

// Definisikan tipe untuk memudahkan pembacaan
type KpiTotals = {
  initial: number;
  totalUsed: number;
  totalSaved: number;
  remaining: number;
};

interface KpiStatsProps {
  totals?: KpiTotals | null;
  isLoading: boolean;
}

export const KpiStats = ({ totals, isLoading }: KpiStatsProps) => {
  // 1. STATE: SEDANG LOADING (Hanya tampil saat benar-benar mengambil data API)
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </>
    );
  }

  // 2. STATE: SELESAI LOADING (Bisa berisi data asli atau data kosong/0)
  const safeTotals = totals || {
    initial: 0,
    totalUsed: 0,
    totalSaved: 0,
    remaining: 0,
  };

  const stats = [
    {
      label: "Anggaran Awal",
      val: safeTotals.initial,
      color: "text-slate-800",
      bg: "bg-white",
    },
    {
      label: "Terpakai (YTD)",
      val: safeTotals.totalUsed,
      color: "text-red-600",
      bg: "bg-red-50/50",
    },
    {
      label: "Sisa Saldo",
      val: safeTotals.remaining,
      color: "text-white",
      bg: "bg-emerald-600", // Warna hijau untuk kartu terakhir
    },
  ];

  return (
    <>
      {stats.map((stat, i) => {
        const { full } = formatCurrencySmart(stat.val);
        return (
          <Card key={i} className={`border-none shadow-sm ring-1 ring-slate-200 ${stat.bg}`}>
            <CardContent className="p-4">
              <p
                className={`text-[8px] font-bold tracking-wider uppercase ${
                  i === 2 ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                {stat.label}
              </p>
              <h3 className={`mt-1 text-xl font-black ${stat.color}`}>{full}</h3>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};
