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
    <Card className="h-full border-l-4 border-l-transparent hover:border-l-blue-500/50 transition-all">
      {/* Menggunakan CardContent dengan flex layout.
        pt-6 ditambahkan karena kita tidak memakai CardHeader, 
        sehingga padding atas perlu disamakan dengan padding lainnya.
      */}
      <CardContent className="p-6 flex items-center justify-between h-full relative z-10">
        {/* BAGIAN KIRI: Teks & Angka */}
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">
            {label}
          </p>

          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            <span className="text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          </div>

          {/* Bagian Persentase */}
          {percentageChange !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-bold mt-2 ${percentageColor}`}
            >
              {PercentageIcon && <PercentageIcon className="w-3 h-3" />}
              <span>{percentageText}</span>
              <span className="text-muted-foreground font-normal ml-1">
                vs bulan lalu
              </span>
            </div>
          )}
        </div>

        {/* BAGIAN KANAN: Icon dengan Background */}
        <div className={`p-3 rounded-xl shadow-sm ${iconBgColor}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );
};
