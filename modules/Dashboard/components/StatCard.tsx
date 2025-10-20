"use client";
import { ArrowDown, ArrowUp } from "lucide-react"; // Impor ikon panah

export const StatCard = ({
  icon,
  label,
  value,
  unit,
  iconBgColor,
  percentageChange,
}) => {
  const IconComponent = icon;

  // Tentukan warna dan ikon berdasarkan percentageChange
  let percentageColor = "text-gray-500"; // Default
  let PercentageIcon = null; // Default
  let percentageText = percentageChange
    ? `${Math.abs(percentageChange)}%`
    : "N/A";

  if (percentageChange !== null && percentageChange !== undefined) {
    if (percentageChange < 0) {
      // Jika nilai negatif, artinya lebih hemat/turun
      percentageColor = "text-green-600";
      PercentageIcon = ArrowDown;
    } else if (percentageChange > 0) {
      // Jika nilai positif, artinya lebih boros/naik
      percentageColor = "text-red-600";
      PercentageIcon = ArrowUp;
    } else {
      // percentageChange === 0
      percentageColor = "text-gray-500";
      percentageText = "0%"; // Tampilkan 0% jika tidak ada perubahan
    }
  } else {
    // Jika percentageChange adalah null (misal dari 0 ke X)
    percentageColor = "text-blue-600"; // Warna netral untuk "Baru" atau "N/A"
    percentageText = "Baru"; // Atau "N/A" atau "Data Baru"
  }

  return (
    <div className="bg-card text-card-foreground p-5 rounded-2xl shadow-sm flex items-center justify-between h-full">
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-2xl font-bold text-foreground">
          {value} {unit}
        </p>
        {/* Tambahkan bagian untuk menampilkan persentase perubahan */}
        {percentageChange !== undefined && ( // Hanya tampilkan jika prop percentageChange ada
          <div
            className={`flex items-center gap-1 text-sm font-medium ${percentageColor} mt-1`}
          >
            {PercentageIcon && <PercentageIcon className="w-4 h-4" />}{" "}
            {/* Ikon panah */}
            <span>{percentageText}</span>
          </div>
        )}
      </div>

      <div className={`p-3 rounded-full ${iconBgColor}`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};
