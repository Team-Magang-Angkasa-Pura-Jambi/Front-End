import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

// Tipe untuk properti (props) StatCard
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  iconBgColor: string;
}

// Komponen utama untuk menampilkan data statistik
export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  iconBgColor,
}) => {
  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
        <div className={cn("rounded-full p-2 text-white", iconBgColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{unit}</p>
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
