"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Switch } from "@/common/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  CloudSun,
  Droplets,
  EyeOff,
  Fuel,
  Info,
  LayoutTemplate,
  LineChart,
  Loader2,
  Plane,
  RotateCcw,
  Save,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getDashboardCardConfigApi,
  MeterOptionItem,
  updateDashboardCardConfigApi,
} from "../../Dashboard/service/visualizations.service";

export interface CardDetailConfig {
  show: boolean;
  title: string;
  meterIds?: number[];
}

export interface FullDashboardVisualSettings {
  cards: {
    electricity: CardDetailConfig;
    water: CardDetailConfig;
    fuel: CardDetailConfig;
    pax: { show: boolean; title: string };
    weather: { show: boolean; title: string };
  };
  yearly_heatmap: {
    show: boolean;
    title: string;
    meter_ids: number[];
    default_meter_id?: number | null;
  };
  trend_analysis: {
    show: boolean;
    title: string;
    meter_ids: number[];
    default_energy_id: number;
    default_meter_id?: number | null;
  };
  fuel_logistics: {
    show: boolean;
    title: string;
    meter_ids: number[];
    default_meter_id?: number | null;
  };
  yearly_spending: {
    show: boolean;
    title: string;
    default_energy_id: number;
  };
  pax_correlation: {
    show: boolean;
    title: string;
    default_energy_id: number;
  };
}

export const DashboardConfigPage = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
  });

  const availableMeters = response?.data?.availableMeters;
  const initialConfig = response?.data?.config as any;

  const [config, setConfig] = useState<FullDashboardVisualSettings>({
    cards: {
      electricity: { show: true, title: "Listrik", meterIds: [] },
      water: { show: true, title: "Air", meterIds: [] },
      fuel: { show: true, title: "BBM", meterIds: [] },
      pax: { show: true, title: "Penumpang (PAX)" },
      weather: { show: true, title: "Cuaca & Suhu" },
    },
    yearly_heatmap: {
      show: true,
      title: "Health Check: Indeks Efisiensi Harian",
      meter_ids: [],
      default_meter_id: null,
    },
    trend_analysis: {
      show: true,
      title: "Analisis Tren Konsumsi",
      meter_ids: [],
      default_energy_id: 1,
      default_meter_id: null,
    },
    fuel_logistics: {
      show: true,
      title: "Analisis Logistik & Sisa Stok BBM",
      meter_ids: [],
      default_meter_id: null,
    },
    yearly_spending: {
      show: true,
      title: "Tren Pengeluaran Tahunan",
      default_energy_id: 1,
    },
    pax_correlation: {
      show: true,
      title: "Korelasi Beban Operasional",
      default_energy_id: 1,
    },
  });

  useEffect(() => {
    if (initialConfig) {
      const cardsData = initialConfig.cards || {
        electricity: initialConfig.electricity || { show: true, title: "Listrik", meterIds: [] },
        water: initialConfig.water || { show: true, title: "Air", meterIds: [] },
        fuel: initialConfig.fuel || { show: true, title: "BBM", meterIds: [] },
        pax: initialConfig.pax || { show: true, title: "Penumpang (PAX)" },
        weather: initialConfig.weather || { show: true, title: "Cuaca & Suhu" },
      };

      const elecIds = cardsData.electricity?.meterIds || initialConfig.electricityMeterIds || [];
      const waterIds = cardsData.water?.meterIds || initialConfig.waterMeterIds || [];
      const fuelIds = cardsData.fuel?.meterIds || initialConfig.fuelMeterIds || [];

      setConfig({
        cards: {
          electricity: {
            show: cardsData.electricity?.show ?? true,
            title: cardsData.electricity?.title ?? "Listrik",
            meterIds: elecIds,
          },
          water: {
            show: cardsData.water?.show ?? true,
            title: cardsData.water?.title ?? "Air",
            meterIds: waterIds,
          },
          fuel: {
            show: cardsData.fuel?.show ?? true,
            title: cardsData.fuel?.title ?? "BBM",
            meterIds: fuelIds,
          },
          pax: {
            show: cardsData.pax?.show ?? true,
            title: cardsData.pax?.title ?? "Penumpang (PAX)",
          },
          weather: {
            show: cardsData.weather?.show ?? true,
            title: cardsData.weather?.title ?? "Cuaca & Suhu",
          },
        },
        yearly_heatmap: {
          show: initialConfig.yearly_heatmap?.show ?? true,
          title: initialConfig.yearly_heatmap?.title ?? "Health Check: Indeks Efisiensi Harian",
          meter_ids: Array.isArray(initialConfig.yearly_heatmap?.meter_ids)
            ? initialConfig.yearly_heatmap.meter_ids
            : [],
          default_meter_id: initialConfig.yearly_heatmap?.default_meter_id ?? null,
        },
        trend_analysis: {
          show: initialConfig.trend_analysis?.show ?? true,
          title: initialConfig.trend_analysis?.title ?? "Analisis Tren Konsumsi",
          meter_ids: Array.isArray(initialConfig.trend_analysis?.meter_ids)
            ? initialConfig.trend_analysis.meter_ids
            : [],
          default_energy_id: initialConfig.trend_analysis?.default_energy_id ?? 1,
          default_meter_id: initialConfig.trend_analysis?.default_meter_id ?? null,
        },
        fuel_logistics: {
          show: initialConfig.fuel_logistics?.show ?? true,
          title: initialConfig.fuel_logistics?.title ?? "Analisis Logistik & Sisa Stok BBM",
          meter_ids: Array.isArray(initialConfig.fuel_logistics?.meter_ids)
            ? initialConfig.fuel_logistics.meter_ids
            : [],
          default_meter_id: initialConfig.fuel_logistics?.default_meter_id ?? null,
        },
        yearly_spending: {
          show: initialConfig.yearly_spending?.show ?? true,
          title: initialConfig.yearly_spending?.title ?? "Tren Pengeluaran Tahunan",
          default_energy_id: initialConfig.yearly_spending?.default_energy_id ?? 1,
        },
        pax_correlation: {
          show: initialConfig.pax_correlation?.show ?? true,
          title: initialConfig.pax_correlation?.title ?? "Korelasi Beban Operasional",
          default_energy_id: initialConfig.pax_correlation?.default_energy_id ?? 1,
        },
      });
    }
  }, [initialConfig]);

  const { mutate: saveConfig, isPending: isSaving } = useMutation({
    mutationFn: (payload: FullDashboardVisualSettings) =>
      updateDashboardCardConfigApi(payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCardConfig"] });
      toast.success("Semua konfigurasi visual dashboard berhasil disimpan!", {
        description:
          "Pengaturan visibilitas widget, meteran terpilih, dan judul langsung aktif di halaman dasbor.",
      });
    },
    onError: (err: any) => {
      toast.error("Gagal menyimpan konfigurasi visual dashboard", {
        description: err.response?.data?.message || err.message,
      });
    },
  });

  const handleToggleCardMeter = (category: "electricity" | "water" | "fuel", meterId: number) => {
    setConfig((prev) => {
      const currentList = prev.cards[category].meterIds || [];
      const exists = currentList.includes(meterId);
      const updatedList = exists
        ? currentList.filter((id) => id !== meterId)
        : [...currentList, meterId];

      return {
        ...prev,
        cards: {
          ...prev.cards,
          [category]: {
            ...prev.cards[category],
            meterIds: updatedList,
          },
        },
      };
    });
  };

  const handleToggleSectionMeter = (
    section: "yearly_heatmap" | "trend_analysis" | "fuel_logistics",
    meterId: number
  ) => {
    setConfig((prev) => {
      const currentList = prev[section].meter_ids || [];
      const exists = currentList.includes(meterId);
      const updatedList = exists
        ? currentList.filter((id) => id !== meterId)
        : [...currentList, meterId];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          meter_ids: updatedList,
        },
      };
    });
  };

  const handleSelectAllSectionMeters = (
    section: "yearly_heatmap" | "trend_analysis" | "fuel_logistics",
    meters: MeterOptionItem[]
  ) => {
    const allIds = meters.map((m) => m.meter_id);
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        meter_ids: allIds,
      },
    }));
  };

  const handleClearSectionMeters = (
    section: "yearly_heatmap" | "trend_analysis" | "fuel_logistics"
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        meter_ids: [],
      },
    }));
  };

  const allMetersList = (availableMeters as any)?.all || [
    ...(availableMeters?.electricity || []),
    ...(availableMeters?.water || []),
    ...(availableMeters?.fuel || []),
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 p-4 pb-24 md:p-8">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-r from-emerald-600/10 via-teal-500/5 to-blue-600/10 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-blue-950/40">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-600 p-3 text-white shadow-md shadow-emerald-600/25">
              <LayoutTemplate className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Konfigurasi Visualisasi Dashboard
                </h1>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-600"
                >
                  Pusat Manajemen Visual
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Kelola visibilitas (Show/Hide), meteran query default, dan judul dari setiap widget
                visualisasi data di Dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => saveConfig(config)}
              disabled={isSaving}
              className="h-10 bg-emerald-600 px-5 font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Semua Visualisasi
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="tab_cards" className="w-full space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1.5 md:grid-cols-3 lg:grid-cols-6 dark:border-slate-800 dark:bg-slate-900">
          <TabsTrigger
            value="tab_cards"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
          >
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <span>1. Card Metriks</span>
          </TabsTrigger>

          <TabsTrigger
            value="tab_heatmap"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
          >
            <CalendarDays className="h-4 w-4 text-blue-500" />
            <span>2. Health Check</span>
            {!config.yearly_heatmap.show && (
              <EyeOff className="text-muted-foreground ml-auto h-3 w-3 opacity-70" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="tab_trend"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
          >
            <LineChart className="h-4 w-4 text-indigo-500" />
            <span>3. Tren Konsumsi</span>
            {!config.trend_analysis.show && (
              <EyeOff className="text-muted-foreground ml-auto h-3 w-3 opacity-70" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="tab_fuel"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
          >
            <Fuel className="h-4 w-4 text-orange-500" />
            <span>4. Logistik BBM</span>
            {!config.fuel_logistics.show && (
              <EyeOff className="text-muted-foreground ml-auto h-3 w-3 opacity-70" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="tab_spending"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
          >
            <Wallet className="h-4 w-4 text-purple-500" />
            <span>5. Pengeluaran</span>
            {!config.yearly_spending.show && (
              <EyeOff className="text-muted-foreground ml-auto h-3 w-3 opacity-70" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="tab_pax"
            className="flex items-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
          >
            <Users className="h-4 w-4 text-red-500" />
            <span>6. Korelasi PAX</span>
            {!config.pax_correlation.show && (
              <EyeOff className="text-muted-foreground ml-auto h-3 w-3 opacity-70" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CARD METRIKS KONSUMSI */}
        <TabsContent value="tab_cards" className="space-y-6">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      1. Card Metriks Ringkasan Konsumsi
                    </CardTitle>
                    <CardDescription>
                      Atur visibilitas, judul, dan sumber meteran yang diakumulasikan pada kartu
                      ringkasan di bagian paling atas dasbor.
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>Aturan Akumulasi:</strong> Jika Anda memilih <strong>Terminal</strong> dan{" "}
                  <strong>Kantor</strong>, maka total pemakaian energi dan biayanya akan{" "}
                  <strong>ditambahkan (diakumulasikan)</strong>. Jika hanya memilih Terminal, kartu
                  hanya menampilkan data Terminal.
                </span>
              </div>

              {/* Subtabs */}
              <Tabs defaultValue="card_electricity" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2 p-1 sm:grid-cols-5">
                  <TabsTrigger
                    value="card_electricity"
                    className="flex items-center gap-2 py-2 text-xs font-semibold"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Listrik</span>
                    <Switch
                      checked={config.cards.electricity.show}
                      onCheckedChange={(c) =>
                        setConfig((p) => ({
                          ...p,
                          cards: { ...p.cards, electricity: { ...p.cards.electricity, show: c } },
                        }))
                      }
                      className="ml-1 scale-75"
                    />
                  </TabsTrigger>

                  <TabsTrigger
                    value="card_water"
                    className="flex items-center gap-2 py-2 text-xs font-semibold"
                  >
                    <Droplets className="h-3.5 w-3.5 text-blue-500" />
                    <span>Air</span>
                    <Switch
                      checked={config.cards.water.show}
                      onCheckedChange={(c) =>
                        setConfig((p) => ({
                          ...p,
                          cards: { ...p.cards, water: { ...p.cards.water, show: c } },
                        }))
                      }
                      className="ml-1 scale-75"
                    />
                  </TabsTrigger>

                  <TabsTrigger
                    value="card_fuel"
                    className="flex items-center gap-2 py-2 text-xs font-semibold"
                  >
                    <Fuel className="h-3.5 w-3.5 text-orange-500" />
                    <span>BBM</span>
                    <Switch
                      checked={config.cards.fuel.show}
                      onCheckedChange={(c) =>
                        setConfig((p) => ({
                          ...p,
                          cards: { ...p.cards, fuel: { ...p.cards.fuel, show: c } },
                        }))
                      }
                      className="ml-1 scale-75"
                    />
                  </TabsTrigger>

                  <TabsTrigger
                    value="card_pax"
                    className="flex items-center gap-2 py-2 text-xs font-semibold"
                  >
                    <Plane className="h-3.5 w-3.5 text-red-500" />
                    <span>PAX</span>
                    <Switch
                      checked={config.cards.pax.show}
                      onCheckedChange={(c) =>
                        setConfig((p) => ({
                          ...p,
                          cards: { ...p.cards, pax: { ...p.cards.pax, show: c } },
                        }))
                      }
                      className="ml-1 scale-75"
                    />
                  </TabsTrigger>

                  <TabsTrigger
                    value="card_weather"
                    className="flex items-center gap-2 py-2 text-xs font-semibold"
                  >
                    <CloudSun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Cuaca</span>
                    <Switch
                      checked={config.cards.weather.show}
                      onCheckedChange={(c) =>
                        setConfig((p) => ({
                          ...p,
                          cards: { ...p.cards, weather: { ...p.cards.weather, show: c } },
                        }))
                      }
                      className="ml-1 scale-75"
                    />
                  </TabsTrigger>
                </TabsList>

                {/* Subcontent Electricity */}
                <TabsContent value="card_electricity" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase">Nama Judul Kartu</Label>
                      <Input
                        value={config.cards.electricity.title}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            cards: {
                              ...p.cards,
                              electricity: { ...p.cards.electricity, title: e.target.value },
                            },
                          }))
                        }
                        placeholder="Listrik"
                      />
                    </div>
                    <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3 text-xs">
                      <span className="font-semibold">
                        {config.cards.electricity.meterIds?.length || 0} dari{" "}
                        {availableMeters?.electricity.length || 0} meter listrik dipilih
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              cards: {
                                ...p.cards,
                                electricity: {
                                  ...p.cards.electricity,
                                  meterIds: (availableMeters?.electricity || []).map(
                                    (m) => m.meter_id
                                  ),
                                },
                              },
                            }))
                          }
                        >
                          Pilih Semua
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-7 text-xs"
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              cards: {
                                ...p.cards,
                                electricity: { ...p.cards.electricity, meterIds: [] },
                              },
                            }))
                          }
                        >
                          <RotateCcw className="mr-1 h-3 w-3" /> Reset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-56 pr-2">
                    <div className="space-y-2">
                      {(availableMeters?.electricity || []).map((meter) => {
                        const isChecked = (config.cards.electricity.meterIds || []).includes(
                          meter.meter_id
                        );
                        return (
                          <div
                            key={meter.meter_id}
                            onClick={() => handleToggleCardMeter("electricity", meter.meter_id)}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all",
                              isChecked
                                ? "border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/20"
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isChecked}
                                className="data-[state=checked]:bg-amber-500"
                              />
                              <span className="font-mono font-bold">
                                {meter.meter_code} ({meter.name})
                              </span>
                              {meter.location?.name && (
                                <span className="text-muted-foreground">
                                  📍 {meter.location.name}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                              {meter.category}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Subcontent Water */}
                <TabsContent value="card_water" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase">Nama Judul Kartu</Label>
                      <Input
                        value={config.cards.water.title}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            cards: {
                              ...p.cards,
                              water: { ...p.cards.water, title: e.target.value },
                            },
                          }))
                        }
                        placeholder="Air"
                      />
                    </div>
                    <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3 text-xs">
                      <span className="font-semibold">
                        {config.cards.water.meterIds?.length || 0} dari{" "}
                        {availableMeters?.water.length || 0} meter air dipilih
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              cards: {
                                ...p.cards,
                                water: {
                                  ...p.cards.water,
                                  meterIds: (availableMeters?.water || []).map((m) => m.meter_id),
                                },
                              },
                            }))
                          }
                        >
                          Pilih Semua
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-7 text-xs"
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              cards: { ...p.cards, water: { ...p.cards.water, meterIds: [] } },
                            }))
                          }
                        >
                          <RotateCcw className="mr-1 h-3 w-3" /> Reset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-56 pr-2">
                    <div className="space-y-2">
                      {(availableMeters?.water || []).map((meter) => {
                        const isChecked = (config.cards.water.meterIds || []).includes(
                          meter.meter_id
                        );
                        return (
                          <div
                            key={meter.meter_id}
                            onClick={() => handleToggleCardMeter("water", meter.meter_id)}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all",
                              isChecked
                                ? "border-blue-500/60 bg-blue-500/5 ring-1 ring-blue-500/20"
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isChecked}
                                className="data-[state=checked]:bg-blue-500"
                              />
                              <span className="font-mono font-bold">
                                {meter.meter_code} ({meter.name})
                              </span>
                              {meter.location?.name && (
                                <span className="text-muted-foreground">
                                  📍 {meter.location.name}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                              {meter.category}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Subcontent Fuel */}
                <TabsContent value="card_fuel" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase">Nama Judul Kartu</Label>
                      <Input
                        value={config.cards.fuel.title}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            cards: { ...p.cards, fuel: { ...p.cards.fuel, title: e.target.value } },
                          }))
                        }
                        placeholder="BBM"
                      />
                    </div>
                    <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3 text-xs">
                      <span className="font-semibold">
                        {config.cards.fuel.meterIds?.length || 0} dari{" "}
                        {availableMeters?.fuel.length || 0} meter BBM dipilih
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              cards: {
                                ...p.cards,
                                fuel: {
                                  ...p.cards.fuel,
                                  meterIds: (availableMeters?.fuel || []).map((m) => m.meter_id),
                                },
                              },
                            }))
                          }
                        >
                          Pilih Semua
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-7 text-xs"
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              cards: { ...p.cards, fuel: { ...p.cards.fuel, meterIds: [] } },
                            }))
                          }
                        >
                          <RotateCcw className="mr-1 h-3 w-3" /> Reset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-56 pr-2">
                    <div className="space-y-2">
                      {(availableMeters?.fuel || []).map((meter) => {
                        const isChecked = (config.cards.fuel.meterIds || []).includes(
                          meter.meter_id
                        );
                        return (
                          <div
                            key={meter.meter_id}
                            onClick={() => handleToggleCardMeter("fuel", meter.meter_id)}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all",
                              isChecked
                                ? "border-orange-500/60 bg-orange-500/5 ring-1 ring-orange-500/20"
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isChecked}
                                className="data-[state=checked]:bg-orange-500"
                              />
                              <span className="font-mono font-bold">
                                {meter.meter_code} ({meter.name})
                              </span>
                              {meter.location?.name && (
                                <span className="text-muted-foreground">
                                  📍 {meter.location.name}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                              {meter.category}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Subcontent PAX */}
                <TabsContent value="card_pax" className="mt-4 space-y-4">
                  <div className="max-w-md space-y-2">
                    <Label className="text-xs font-bold uppercase">
                      Nama Judul Kartu Penumpang
                    </Label>
                    <Input
                      value={config.cards.pax.title}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          cards: { ...p.cards, pax: { ...p.cards.pax, title: e.target.value } },
                        }))
                      }
                      placeholder="Pax"
                    />
                  </div>
                </TabsContent>

                {/* Subcontent Weather */}
                <TabsContent value="card_weather" className="mt-4 space-y-4">
                  <div className="max-w-md space-y-2">
                    <Label className="text-xs font-bold uppercase">Nama Judul Kartu Cuaca</Label>
                    <Input
                      value={config.cards.weather.title}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          cards: {
                            ...p.cards,
                            weather: { ...p.cards.weather, title: e.target.value },
                          },
                        }))
                      }
                      placeholder="Cuaca & Suhu"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: HEALTH CHECK (HEATMAP) */}
        <TabsContent value="tab_heatmap" className="space-y-6">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      2. Health Check: Indeks Efisiensi Harian (Heatmap)
                    </CardTitle>
                    <CardDescription>
                      Pilih meteran mana saja yang akan ditampilkan di dropdown heatmap dan tentukan
                      meteran default awal.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border bg-slate-100 px-3 py-1.5 dark:bg-slate-800/80">
                  <Label htmlFor="toggle-heatmap" className="cursor-pointer text-xs font-bold">
                    {config.yearly_heatmap.show ? "Tampilkan Widget" : "Sembunyikan Widget"}
                  </Label>
                  <Switch
                    id="toggle-heatmap"
                    checked={config.yearly_heatmap.show}
                    onCheckedChange={(checked) =>
                      setConfig((p) => ({
                        ...p,
                        yearly_heatmap: { ...p.yearly_heatmap, show: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">Judul Widget</Label>
                  <Input
                    value={config.yearly_heatmap.title}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        yearly_heatmap: { ...p.yearly_heatmap, title: e.target.value },
                      }))
                    }
                    placeholder="Health Check: Indeks Efisiensi Harian"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">
                    Default Meteran Terpilih (Query Awal)
                  </Label>
                  <Select
                    value={config.yearly_heatmap.default_meter_id?.toString() || "default"}
                    onValueChange={(val) =>
                      setConfig((p) => ({
                        ...p,
                        yearly_heatmap: {
                          ...p.yearly_heatmap,
                          default_meter_id: val === "default" ? null : parseInt(val, 10),
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Meter Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Otomatis (Meter Pertama yang Dipilih)</SelectItem>
                      {allMetersList.map((m: any) => (
                        <SelectItem key={m.meter_id} value={m.meter_id.toString()}>
                          {m.meter_code} - {m.name || "Meter"} ({m.energy_type?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Meter Filter Selection for Heatmap */}
              <div className="space-y-3 pt-2">
                <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Pilih meteran yang diizinkan untuk ditampilkan pada Heatmap Kalender (
                    {config.yearly_heatmap.meter_ids.length} dipilih)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSelectAllSectionMeters("yearly_heatmap", allMetersList)}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-7 text-xs"
                      onClick={() => handleClearSectionMeters("yearly_heatmap")}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" /> Reset
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-60 pr-2">
                  <div className="space-y-2">
                    {allMetersList.map((meter: any) => {
                      const isChecked = config.yearly_heatmap.meter_ids.includes(meter.meter_id);
                      return (
                        <div
                          key={meter.meter_id}
                          onClick={() => handleToggleSectionMeter("yearly_heatmap", meter.meter_id)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all",
                            isChecked
                              ? "border-blue-500/60 bg-blue-500/5 ring-1 ring-blue-500/20"
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isChecked}
                              className="data-[state=checked]:bg-blue-500"
                            />
                            <span className="font-mono font-bold">
                              {meter.meter_code} ({meter.name || "Meter"})
                            </span>
                            {meter.location?.name && (
                              <span className="text-muted-foreground">
                                📍 {meter.location.name}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase">
                            {meter.category}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: TREN KONSUMSI */}
        <TabsContent value="tab_trend" className="space-y-6">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      3. Analisis Tren Konsumsi & Garis Prediksi AI
                    </CardTitle>
                    <CardDescription>
                      Atur visibilitas, daftar meteran yang dapat dianalisis, default energi, dan
                      default meter terpilih.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border bg-slate-100 px-3 py-1.5 dark:bg-slate-800/80">
                  <Label htmlFor="toggle-trend" className="cursor-pointer text-xs font-bold">
                    {config.trend_analysis.show ? "Tampilkan Widget" : "Sembunyikan Widget"}
                  </Label>
                  <Switch
                    id="toggle-trend"
                    checked={config.trend_analysis.show}
                    onCheckedChange={(checked) =>
                      setConfig((p) => ({
                        ...p,
                        trend_analysis: { ...p.trend_analysis, show: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">Judul Widget</Label>
                  <Input
                    value={config.trend_analysis.title}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        trend_analysis: { ...p.trend_analysis, title: e.target.value },
                      }))
                    }
                    placeholder="Analisis Tren Konsumsi"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">
                    Tipe Energi Default
                  </Label>
                  <Select
                    value={config.trend_analysis.default_energy_id.toString()}
                    onValueChange={(val) =>
                      setConfig((p) => ({
                        ...p,
                        trend_analysis: {
                          ...p.trend_analysis,
                          default_energy_id: parseInt(val, 10),
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Energi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Electricity (Listrik)</SelectItem>
                      <SelectItem value="2">Water (Air)</SelectItem>
                      <SelectItem value="3">Fuel (BBM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">
                    Default Meter Terpilih
                  </Label>
                  <Select
                    value={config.trend_analysis.default_meter_id?.toString() || "all"}
                    onValueChange={(val) =>
                      setConfig((p) => ({
                        ...p,
                        trend_analysis: {
                          ...p.trend_analysis,
                          default_meter_id: val === "all" ? null : parseInt(val, 10),
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Meter Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Meter (Agregasi Total Energi)</SelectItem>
                      {allMetersList.map((m: any) => (
                        <SelectItem key={m.meter_id} value={m.meter_id.toString()}>
                          {m.meter_code} - {m.name || "Meter"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Meter Filter Selection for Trend */}
              <div className="space-y-3 pt-2">
                <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Pilih meteran yang diizinkan untuk analisis tren (
                    {config.trend_analysis.meter_ids.length} dipilih)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSelectAllSectionMeters("trend_analysis", allMetersList)}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-7 text-xs"
                      onClick={() => handleClearSectionMeters("trend_analysis")}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" /> Reset
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-60 pr-2">
                  <div className="space-y-2">
                    {allMetersList.map((meter: any) => {
                      const isChecked = config.trend_analysis.meter_ids.includes(meter.meter_id);
                      return (
                        <div
                          key={meter.meter_id}
                          onClick={() => handleToggleSectionMeter("trend_analysis", meter.meter_id)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all",
                            isChecked
                              ? "border-indigo-500/60 bg-indigo-500/5 ring-1 ring-indigo-500/20"
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isChecked}
                              className="data-[state=checked]:bg-indigo-500"
                            />
                            <span className="font-mono font-bold">
                              {meter.meter_code} ({meter.name || "Meter"})
                            </span>
                            {meter.location?.name && (
                              <span className="text-muted-foreground">
                                📍 {meter.location.name}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase">
                            {meter.category}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: LOGISTIK BBM */}
        <TabsContent value="tab_fuel" className="space-y-6">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600">
                    <Fuel className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      4. Analisis Logistik & Sisa Stok BBM (Tangki)
                    </CardTitle>
                    <CardDescription>
                      Atur visibilitas, tangki BBM yang diizinkan untuk dimonitor, dan default
                      tangki awal.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border bg-slate-100 px-3 py-1.5 dark:bg-slate-800/80">
                  <Label
                    htmlFor="toggle-fuel-logistics"
                    className="cursor-pointer text-xs font-bold"
                  >
                    {config.fuel_logistics.show ? "Tampilkan Widget" : "Sembunyikan Widget"}
                  </Label>
                  <Switch
                    id="toggle-fuel-logistics"
                    checked={config.fuel_logistics.show}
                    onCheckedChange={(checked) =>
                      setConfig((p) => ({
                        ...p,
                        fuel_logistics: { ...p.fuel_logistics, show: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">Judul Widget</Label>
                  <Input
                    value={config.fuel_logistics.title}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        fuel_logistics: { ...p.fuel_logistics, title: e.target.value },
                      }))
                    }
                    placeholder="Analisis Logistik & Sisa Stok BBM"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">
                    Default Tangki BBM Terpilih
                  </Label>
                  <Select
                    value={config.fuel_logistics.default_meter_id?.toString() || "default"}
                    onValueChange={(val) =>
                      setConfig((p) => ({
                        ...p,
                        fuel_logistics: {
                          ...p.fuel_logistics,
                          default_meter_id: val === "default" ? null : parseInt(val, 10),
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tangki BBM Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Otomatis (Tangki BBM Pertama)</SelectItem>
                      {(availableMeters?.fuel || []).map((m: any) => (
                        <SelectItem key={m.meter_id} value={m.meter_id.toString()}>
                          {m.meter_code} - {m.name || "Tangki"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tank Filter Selection for Fuel Logistics */}
              <div className="space-y-3 pt-2">
                <div className="bg-muted/40 flex items-center justify-between rounded-lg p-3 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Pilih tangki BBM yang diizinkan untuk logistik (
                    {config.fuel_logistics.meter_ids.length} dipilih)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        handleSelectAllSectionMeters("fuel_logistics", availableMeters?.fuel || [])
                      }
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-7 text-xs"
                      onClick={() => handleClearSectionMeters("fuel_logistics")}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" /> Reset
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-60 pr-2">
                  <div className="space-y-2">
                    {(availableMeters?.fuel || []).map((meter: any) => {
                      const isChecked = config.fuel_logistics.meter_ids.includes(meter.meter_id);
                      return (
                        <div
                          key={meter.meter_id}
                          onClick={() => handleToggleSectionMeter("fuel_logistics", meter.meter_id)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all",
                            isChecked
                              ? "border-orange-500/60 bg-orange-500/5 ring-1 ring-orange-500/20"
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isChecked}
                              className="data-[state=checked]:bg-orange-500"
                            />
                            <span className="font-mono font-bold">
                              {meter.meter_code} ({meter.name || "Tangki"})
                            </span>
                            {meter.location?.name && (
                              <span className="text-muted-foreground">
                                📍 {meter.location.name}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase">
                            {meter.category}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: PENGELUARAN TAHUNAN */}
        <TabsContent value="tab_spending" className="space-y-6">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      5. Tren Pengeluaran Tahunan (Budget vs Realisasi)
                    </CardTitle>
                    <CardDescription>
                      Atur visibilitas widget analisis realisasi biaya terhadap budget plan dan
                      energi default.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border bg-slate-100 px-3 py-1.5 dark:bg-slate-800/80">
                  <Label htmlFor="toggle-spending" className="cursor-pointer text-xs font-bold">
                    {config.yearly_spending.show ? "Tampilkan Widget" : "Sembunyikan Widget"}
                  </Label>
                  <Switch
                    id="toggle-spending"
                    checked={config.yearly_spending.show}
                    onCheckedChange={(checked) =>
                      setConfig((p) => ({
                        ...p,
                        yearly_spending: { ...p.yearly_spending, show: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">Judul Widget</Label>
                  <Input
                    value={config.yearly_spending.title}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        yearly_spending: { ...p.yearly_spending, title: e.target.value },
                      }))
                    }
                    placeholder="Tren Pengeluaran Tahunan"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">
                    Tipe Energi Default
                  </Label>
                  <Select
                    value={config.yearly_spending.default_energy_id.toString()}
                    onValueChange={(val) =>
                      setConfig((p) => ({
                        ...p,
                        yearly_spending: {
                          ...p.yearly_spending,
                          default_energy_id: parseInt(val, 10),
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Energi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Electricity (Listrik)</SelectItem>
                      <SelectItem value="2">Water (Air)</SelectItem>
                      <SelectItem value="3">Fuel (BBM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: KORELASI PAX */}
        <TabsContent value="tab_pax" className="space-y-6">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-red-500/10 p-2 text-red-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      6. Korelasi Beban Operasional (Energi vs PAX)
                    </CardTitle>
                    <CardDescription>
                      Atur visibilitas widget korelasi konsumsi energi dengan kepadatan penumpang
                      bandara.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border bg-slate-100 px-3 py-1.5 dark:bg-slate-800/80">
                  <Label htmlFor="toggle-pax-corr" className="cursor-pointer text-xs font-bold">
                    {config.pax_correlation.show ? "Tampilkan Widget" : "Sembunyikan Widget"}
                  </Label>
                  <Switch
                    id="toggle-pax-corr"
                    checked={config.pax_correlation.show}
                    onCheckedChange={(checked) =>
                      setConfig((p) => ({
                        ...p,
                        pax_correlation: { ...p.pax_correlation, show: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">Judul Widget</Label>
                  <Input
                    value={config.pax_correlation.title}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        pax_correlation: { ...p.pax_correlation, title: e.target.value },
                      }))
                    }
                    placeholder="Korelasi Beban Operasional"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider uppercase">
                    Tipe Energi Default
                  </Label>
                  <Select
                    value={config.pax_correlation.default_energy_id.toString()}
                    onValueChange={(val) =>
                      setConfig((p) => ({
                        ...p,
                        pax_correlation: {
                          ...p.pax_correlation,
                          default_energy_id: parseInt(val, 10),
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Energi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Electricity (Listrik)</SelectItem>
                      <SelectItem value="2">Water (Air)</SelectItem>
                      <SelectItem value="3">Fuel (BBM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
