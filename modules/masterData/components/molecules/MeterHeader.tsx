import { Gauge } from "lucide-react";

export const MeterHeader = () => {
  return (
    <div className="flex items-start gap-4">
      {/* Icon Dekoratif (Opsional, agar terlihat lebih profesional) */}
      <div className="bg-primary/10 text-primary border-primary/20 hidden h-12 w-12 items-center justify-center rounded-xl border shadow-sm sm:flex">
        <Gauge className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-foreground text-3xl font-bold tracking-tight">Data Meter</h2>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Dashboard monitoring dan konfigurasi teknis seluruh perangkat meter di area Sultan Thaha.
        </p>
      </div>
    </div>
  );
};
