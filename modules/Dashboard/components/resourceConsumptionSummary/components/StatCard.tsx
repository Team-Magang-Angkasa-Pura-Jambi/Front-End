"use client";
import { Card, CardContent } from "@/common/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  iconBgColor: string;
  percentageChange?: number | null;
}

export const StatCard = ({
  icon,
  label,
  value,
  unit,
  iconBgColor,
  percentageChange,
}: StatCardProps) => {
  const IconComponent = icon;

  // --- LOGIKA WARNA & STATUS ---
  let percentageColor = "text-slate-500";
  let PercentageIcon = null;
  let percentageText =
    percentageChange !== null && percentageChange !== undefined
      ? `${Math.abs(percentageChange)}%`
      : "N/A";

  if (percentageChange !== null && percentageChange !== undefined) {
    if (percentageChange < 0) {
      // Turun (Bagus untuk Konsumsi/Biaya) -> Hijau
      percentageColor = "text-emerald-600 dark:text-emerald-500";
      PercentageIcon = ArrowDown;
    } else if (percentageChange > 0) {
      // Naik (Buruk untuk Konsumsi/Biaya) -> Merah
      percentageColor = "text-red-600 dark:text-red-500";
      PercentageIcon = ArrowUp;
    } else {
      // Stabil
      percentageColor = "text-slate-500";
      percentageText = "0%";
    }
  } else {
    // Data Baru / Kosong
    percentageColor = "text-blue-600 dark:text-blue-500";
    percentageText = "Baru";
  }

  return (
    <Card className="h-full border-l-4 border-l-transparent transition-all hover:border-l-blue-500/50">
      {/* Menggunakan CardContent dengan flex layout.
        pt-6 ditambahkan karena kita tidak memakai CardHeader, 
        sehingga padding atas perlu disamakan dengan padding lainnya.
      */}
      <CardContent className="relative z-10 flex h-full items-center justify-between p-6">
        {/* BAGIAN KIRI: Teks & Angka */}
        <div>
          <p className="text-muted-foreground mb-1 text-sm font-medium">
            {label}
          </p>

          <div className="flex items-baseline gap-1">
            <h3 className="text-foreground text-2xl font-bold">{value}</h3>
            <span className="text-muted-foreground text-sm font-medium">
              {unit}
            </span>
          </div>

          {/* Bagian Persentase */}
          {percentageChange !== undefined && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs font-bold ${percentageColor}`}
            >
              {PercentageIcon && <PercentageIcon className="h-3 w-3" />}
              <span>{percentageText}</span>
              <span className="text-muted-foreground ml-1 font-normal">
                vs bulan lalu
              </span>
            </div>
          )}
        </div>

        {/* BAGIAN KANAN: Icon dengan Background */}
        <div className={`rounded-xl p-3 shadow-sm ${iconBgColor}`}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );
};
