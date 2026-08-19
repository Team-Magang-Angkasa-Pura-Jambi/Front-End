"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Droplets,
  Fuel,
  Info,
  Layers,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DashboardCardMetersConfig,
  getDashboardCardConfigApi,
  MeterOptionItem,
  updateDashboardCardConfigApi,
} from "../service/visualizations.service";

interface DashboardCardConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DashboardCardConfigModal = ({
  open,
  onOpenChange,
}: DashboardCardConfigModalProps) => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
    enabled: open,
  });

  const availableMeters = response?.data?.availableMeters;
  const initialConfig = response?.data?.config;

  const [selectedMeters, setSelectedMeters] = useState<DashboardCardMetersConfig>({
    electricityMeterIds: [],
    waterMeterIds: [],
    fuelMeterIds: [],
  });

  useEffect(() => {
    if (initialConfig) {
      setSelectedMeters({
        electricityMeterIds: initialConfig.electricityMeterIds || [],
        waterMeterIds: initialConfig.waterMeterIds || [],
        fuelMeterIds: initialConfig.fuelMeterIds || [],
      });
    }
  }, [initialConfig]);

  const { mutate: saveConfig, isPending: isSaving } = useMutation({
    mutationFn: (config: DashboardCardMetersConfig) => updateDashboardCardConfigApi(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCardConfig"] });
      toast.success("Konfigurasi meteran kartu dashboard berhasil disimpan!", {
        description: "Data konsumsi dan biaya pada card akan diperbarui sesuai pilihan meteran.",
      });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error("Gagal menyimpan konfigurasi meteran", {
        description: err.response?.data?.message || err.message,
      });
    },
  });

  const handleToggleMeter = (
    category: "electricityMeterIds" | "waterMeterIds" | "fuelMeterIds",
    meterId: number
  ) => {
    setSelectedMeters((prev) => {
      const currentList = prev[category] || [];
      const exists = currentList.includes(meterId);
      const updatedList = exists
        ? currentList.filter((id) => id !== meterId)
        : [...currentList, meterId];

      return {
        ...prev,
        [category]: updatedList,
      };
    });
  };

  const handleSelectAll = (
    category: "electricityMeterIds" | "waterMeterIds" | "fuelMeterIds",
    meters: MeterOptionItem[]
  ) => {
    const allIds = meters.map((m) => m.meter_id);
    setSelectedMeters((prev) => ({
      ...prev,
      [category]: allIds,
    }));
  };

  const handleClearAll = (
    category: "electricityMeterIds" | "waterMeterIds" | "fuelMeterIds"
  ) => {
    setSelectedMeters((prev) => ({
      ...prev,
      [category]: [],
    }));
  };

  const renderMeterList = (
    categoryKey: "electricityMeterIds" | "waterMeterIds" | "fuelMeterIds",
    meters: MeterOptionItem[] | undefined,
    energyLabel: string,
    energyIcon: React.ReactNode
  ) => {
    const currentSelected = selectedMeters[categoryKey] || [];
    const allMetersList = meters || [];

    if (isLoading) {
      return (
        <div className="space-y-3 p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (allMetersList.length === 0) {
      return (
        <div className="flex h-44 flex-col items-center justify-center text-center">
          <Layers className="text-muted-foreground/40 mb-2 h-10 w-10" />
          <p className="text-muted-foreground text-sm font-medium">
            Tidak ada meteran aktif ditemukan untuk kategori {energyLabel}.
          </p>
        </div>
      );
    }

    const isAllSelected =
      allMetersList.length > 0 &&
      allMetersList.every((m) => currentSelected.includes(m.meter_id));

    return (
      <div className="space-y-4">
        {/* Header Action Tools */}
        <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-2">
            {energyIcon}
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {currentSelected.length} dari {allMetersList.length} meter dipilih
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs font-medium"
              onClick={() =>
                isAllSelected
                  ? handleClearAll(categoryKey)
                  : handleSelectAll(categoryKey, allMetersList)
              }
            >
              {isAllSelected ? "Hapus Semua" : "Pilih Semua"}
            </Button>
            {currentSelected.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-7 text-xs"
                onClick={() => handleClearAll(categoryKey)}
              >
                <RotateCcw className="mr-1 h-3 w-3" /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="border-primary/20 bg-primary/5 flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Jika Anda memilih <strong>Terminal</strong> dan <strong>Kantor</strong>, maka total
            pemakaian energi dan biayanya akan <strong>ditambahkan (diakumulasikan)</strong>. Jika
            hanya memilih Terminal, kartu hanya menampilkan konsumsi Terminal.
          </span>
        </div>

        {/* Meters Checkbox List */}
        <ScrollArea className="h-64 pr-2">
          <div className="space-y-2.5">
            {allMetersList.map((meter) => {
              const isChecked = currentSelected.includes(meter.meter_id);
              const isTerminal = meter.category === "TERMINAL";
              const isKantor = meter.category === "KANTOR";

              return (
                <div
                  key={meter.meter_id}
                  onClick={() => handleToggleMeter(categoryKey, meter.meter_id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all",
                    isChecked
                      ? "border-primary/60 bg-primary/5 ring-primary/20 shadow-xs ring-1"
                      : "border-border hover:bg-muted/50 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggleMeter(categoryKey, meter.meter_id)}
                      className="data-[state=checked]:bg-primary h-5 w-5 rounded-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                          {meter.meter_code}
                        </span>
                        {meter.name && (
                          <span className="text-muted-foreground text-xs font-normal">
                            ({meter.name})
                          </span>
                        )}
                      </div>
                      {meter.location?.name && (
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                          📍 {meter.location.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold tracking-wider uppercase",
                      isTerminal && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      isKantor && "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                      !isTerminal && !isKantor && "border-slate-200 bg-slate-100 text-slate-700"
                    )}
                  >
                    {meter.category}
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <SlidersHorizontal className="text-primary h-5 w-5" />
            Manajemen Data Card Dashboard
          </DialogTitle>
          <DialogDescription className="text-sm">
            Atur meteran mana saja yang akan ditampilkan dan diakumulasikan konsumsinya pada kartu
            metrik Air, Listrik, dan BBM.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="electricity" className="w-full">
          <TabsList className="grid w-full grid-cols-3 p-1">
            <TabsTrigger
              value="electricity"
              className="flex items-center gap-2 data-[state=active]:font-bold"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Listrik</span>
              {selectedMeters.electricityMeterIds?.length > 0 && (
                <span className="bg-primary/20 text-primary ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                  {selectedMeters.electricityMeterIds.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="water"
              className="flex items-center gap-2 data-[state=active]:font-bold"
            >
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>Air</span>
              {selectedMeters.waterMeterIds?.length > 0 && (
                <span className="bg-primary/20 text-primary ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                  {selectedMeters.waterMeterIds.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="fuel"
              className="flex items-center gap-2 data-[state=active]:font-bold"
            >
              <Fuel className="h-4 w-4 text-orange-500" />
              <span>BBM</span>
              {selectedMeters.fuelMeterIds?.length > 0 && (
                <span className="bg-primary/20 text-primary ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                  {selectedMeters.fuelMeterIds.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="electricity" className="mt-4">
            {renderMeterList(
              "electricityMeterIds",
              availableMeters?.electricity,
              "Listrik",
              <Zap className="h-4 w-4 text-amber-500" />
            )}
          </TabsContent>

          <TabsContent value="water" className="mt-4">
            {renderMeterList(
              "waterMeterIds",
              availableMeters?.water,
              "Air",
              <Droplets className="h-4 w-4 text-blue-500" />
            )}
          </TabsContent>

          <TabsContent value="fuel" className="mt-4">
            {renderMeterList(
              "fuelMeterIds",
              availableMeters?.fuel,
              "BBM",
              <Fuel className="h-4 w-4 text-orange-500" />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 border-t pt-4 sm:justify-between">
          <div className="text-muted-foreground flex items-center text-xs">
            <span>*Kosongkan pilihan untuk menggunakan seluruh meteran</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => saveConfig(selectedMeters)}
              disabled={isSaving || isLoading}
              className="bg-primary font-semibold shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Simpan Konfigurasi
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
