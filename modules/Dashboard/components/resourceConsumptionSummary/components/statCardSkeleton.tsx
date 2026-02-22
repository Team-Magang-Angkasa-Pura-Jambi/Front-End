import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

// Tipe untuk properti (props) StatCard
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number; // Dukung number agar lebih fleksibel
  unit?: string; // Dibuat opsional dengan ?
  iconBgColor?: string; // Dibuat opsional dengan ?
  subValue?: string; // Tambahan untuk info ekstra
}

// Komponen utama untuk menampilkan data statistik
export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  iconBgColor = "bg-primary", // Default color jika tidak diisi
  subValue,
}) => {
  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden border shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
          {label}
        </CardTitle>
        {/* Gunakan opacity pada background agar ikon tetap terlihat kontras */}
        <div className={cn("rounded-full p-2 text-white shadow-sm", iconBgColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-baseline gap-1">
          <div className="text-xl font-bold tracking-tight">{value}</div>
          {unit && <span className="text-muted-foreground text-[10px] font-medium">{unit}</span>}
        </div>
        {subValue && (
          <p className="text-muted-foreground mt-1 text-[10px] font-medium">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
};

// Komponen Skeleton untuk ditampilkan saat loading
export const StatCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-1 h-3 w-16" />
      </CardContent>
    </Card>
  );
};
