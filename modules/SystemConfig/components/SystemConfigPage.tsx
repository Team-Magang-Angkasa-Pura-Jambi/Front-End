"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  CloudSun,
  Code2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileJson,
  FileUp,
  Globe,
  Info,
  KeyRound,
  Loader2,
  Radio,
  Save,
  SlidersHorizontal,
  Thermometer,
  Upload,
  UploadCloud,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  exportMasterPackageApi,
  FullSystemConfigPayload,
  getSystemConfigApi,
  importMasterPackageApi,
  MasterPackageExportData,
  testMlConnectionApi,
  TestMlResult,
  testWeatherConnectionApi,
  TestWeatherResult,
  updateSystemConfigApi,
} from "../services/systemConfig.service";

export const SystemConfigPage = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["systemConfig"],
    queryFn: getSystemConfigApi,
  });

  const initialConfig = response?.data?.config;
  const serverInfo = response?.data?.server_info;

  const [formData, setFormData] = useState<FullSystemConfigPayload>({
    endpoints: {
      active_environment: "development",
      development: {
        backend_api_url: "http://localhost:8080/api/v2",
        ml_api_base_url: "http://localhost:8000",
      },
      production: {
        backend_api_url: "https://sentinel.angkasapura2.co.id/api/v2",
        ml_api_base_url: "https://sentinel-ml.angkasapura2.co.id",
      },
      backend_api_url: "http://localhost:8080/api/v2",
      ml_api_base_url: "http://localhost:8000",
    },
    security: {
      jwt_secret: "",
      uploadthing_app_id: "",
      uploadthing_secret: "",
      uploadthing_token: "",
    },
    weather: {
      airport_name: "Bandara Sultan Thaha Jambi",
      latitude: -1.63806,
      longitude: 103.6444,
      openweather_api_key: "",
    },
    dashboardCards: {
      electricityMeterIds: [],
      waterMeterIds: [],
      fuelMeterIds: [],
    },
    ai: {
      google_generative_ai_api_key: "",
    },
  });

  const [showSecrets, setShowSecrets] = useState({
    jwt: false,
    uploadthingSecret: false,
    uploadthingToken: false,
    ai: false,
  });

  // Package Export / Import Modal States
  const [isExporting, setIsExporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [__importJsonRaw, setImportJsonRaw] = useState("");
  const [parsedImportData, setParsedImportData] = useState<MasterPackageExportData | null>(null);
  const [importMode, setImportMode] = useState<"MERGE_UPSERT" | "CLEAN_IMPORT">("MERGE_UPSERT");
  const [isImporting, setIsImporting] = useState(false);

  // Connection Testing States
  const [mlTestState, setMlTestState] = useState<{
    isLoading: boolean;
    result: TestMlResult | null;
  }>({
    isLoading: false,
    result: null,
  });

  const [weatherTestState, setWeatherTestState] = useState<{
    isLoading: boolean;
    result: TestWeatherResult | null;
  }>({
    isLoading: false,
    result: null,
  });

  useEffect(() => {
    if (initialConfig) {
      setFormData({
        endpoints: {
          active_environment: initialConfig.endpoints?.active_environment || "development",
          development: {
            backend_api_url:
              initialConfig.endpoints?.development?.backend_api_url ||
              initialConfig.endpoints?.backend_api_url ||
              "http://localhost:8080/api/v2",
            ml_api_base_url:
              initialConfig.endpoints?.development?.ml_api_base_url ||
              initialConfig.endpoints?.ml_api_base_url ||
              "http://localhost:8000",
          },
          production: {
            backend_api_url:
              initialConfig.endpoints?.production?.backend_api_url ||
              "https://sentinel.angkasapura2.co.id/api/v2",
            ml_api_base_url:
              initialConfig.endpoints?.production?.ml_api_base_url ||
              "https://sentinel-ml.angkasapura2.co.id",
          },
          backend_api_url:
            initialConfig.endpoints?.backend_api_url || "http://localhost:8080/api/v2",
          ml_api_base_url: initialConfig.endpoints?.ml_api_base_url || "http://localhost:8000",
        },
        security: {
          jwt_secret: initialConfig.security?.jwt_secret || "",
          uploadthing_app_id: initialConfig.security?.uploadthing_app_id || "",
          uploadthing_secret: initialConfig.security?.uploadthing_secret || "",
          uploadthing_token: initialConfig.security?.uploadthing_token || "",
        },
        weather: {
          airport_name: initialConfig.weather?.airport_name || "Bandara Sultan Thaha Jambi",
          latitude: initialConfig.weather?.latitude ?? -1.63806,
          longitude: initialConfig.weather?.longitude ?? 103.6444,
          openweather_api_key: initialConfig.weather?.openweather_api_key || "",
        },
        dashboardCards: {
          electricityMeterIds: initialConfig.dashboardCards?.electricityMeterIds || [],
          waterMeterIds: initialConfig.dashboardCards?.waterMeterIds || [],
          fuelMeterIds: initialConfig.dashboardCards?.fuelMeterIds || [],
        },
        ai: {
          google_generative_ai_api_key: initialConfig.ai?.google_generative_ai_api_key || "",
        },
      });
    }
  }, [initialConfig]);

  const updateMutation = useMutation({
    mutationFn: updateSystemConfigApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemConfig"] });
      toast.success("Konfigurasi sistem berhasil disimpan");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal memperbarui konfigurasi");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleTestMl = async (urlToTest?: string) => {
    try {
      setMlTestState({ isLoading: true, result: null });
      const target =
        urlToTest ||
        (formData.endpoints.active_environment === "production"
          ? formData.endpoints.production.ml_api_base_url
          : formData.endpoints.development.ml_api_base_url);

      const res = await testMlConnectionApi(target);
      setMlTestState({
        isLoading: false,
        result: res.data || {
          status: "online",
          target_url: target,
          latency_ms: 25,
          message: res.status?.message || "Koneksi ML berhasil",
        },
      });
      toast.success(`Koneksi ke ML Service (${target}) normal`);
    } catch (err: any) {
      setMlTestState({
        isLoading: false,
        result: {
          status: "offline",
          target_url: urlToTest || formData.endpoints.ml_api_base_url || "",
          latency_ms: 0,
          message: "Tidak dapat terhubung ke ML Service",
          error_message: err?.response?.data?.message || err.message,
        },
      });
      toast.error("Gagal terhubung ke Microservice Machine Learning");
    }
  };

  const handleTestWeather = async () => {
    try {
      setWeatherTestState({ isLoading: true, result: null });
      const res = await testWeatherConnectionApi({
        latitude: Number(formData.weather.latitude),
        longitude: Number(formData.weather.longitude),
        apiKey: formData.weather.openweather_api_key,
      });

      setWeatherTestState({
        isLoading: false,
        result: res.data || {
          status: "success",
          latency_ms: 120,
          message: res.status?.message || "Koneksi OpenWeather terverifikasi",
        },
      });
      toast.success("Koneksi OpenWeather berhasil terverifikasi");
    } catch (err: any) {
      setWeatherTestState({
        isLoading: false,
        result: {
          status: "error",
          latency_ms: 0,
          message: "Koneksi cuaca gagal",
          error_message: err?.response?.data?.message || err.message,
        },
      });
      toast.error("Gagal memverifikasi API OpenWeather");
    }
  };

  const handleExportPackage = async () => {
    try {
      setIsExporting(true);
      const res = await exportMasterPackageApi();
      const pkg = (res as any)?.data || res;

      // Trigger safe download
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pkg, null, 2));
      const downloadAnchor = document.createElement("a");
      const envName = pkg?.environment || formData.endpoints.active_environment || "bundle";
      const filename = `sentinel_master_package_${envName}_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success(`Paket data master & kalkulasi berhasil diekspor (${filename})`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Gagal mengekspor paket data master."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        setImportJsonRaw(raw);
        const parsed = JSON.parse(raw);
        if (!parsed.data) {
          throw new Error("Format JSON tidak memiliki properti 'data'");
        }
        setParsedImportData(parsed);
        toast.success("File paket berhasil dimuat dan terverifikasi");
      } catch (err: any) {
        toast.error(`Format JSON tidak valid: ${err.message}`);
        setParsedImportData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!parsedImportData) {
      toast.error("Pilih file paket JSON data master terlebih dahulu");
      return;
    }

    try {
      setIsImporting(true);
      const res = await importMasterPackageApi({
        mode: importMode,
        package: parsedImportData,
      });

      toast.success(res.status?.message || "Sinkronisasi paket data master berhasil");
      setIsImportModalOpen(false);
      setParsedImportData(null);
      setImportJsonRaw("");
      queryClient.invalidateQueries();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengimpor paket data");
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-2">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  const isProd = formData.endpoints.active_environment === "production";

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12 text-xs">
      {/* HEADER SECTION - SOFT & CLEAN */}
      <div className="border-border/50 bg-card/60 flex flex-col gap-3.5 rounded-2xl border p-5 shadow-2xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-primary/10 text-primary border-primary/20 rounded-lg border p-1.5">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                isProd
                  ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
              )}
            >
              {isProd ? "Mode Production" : "Mode Development"}
            </Badge>
            {serverInfo && (
              <span className="text-muted-foreground font-mono text-[11px]">
                Port {serverInfo.port} • Uptime {Math.floor(serverInfo.uptime_seconds / 60)}m
              </span>
            )}
          </div>
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            Konfigurasi Sistem & Lingkungan
          </h1>
          <p className="text-muted-foreground text-xs font-normal">
            Kelola profil server (Dev/Prod), endpoint API, token UploadThing, cuaca bandara, dan
            sinkronisasi data master.
          </p>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportPackage}
            disabled={isExporting}
            className="border-border/60 hover:bg-muted/60 h-8 gap-1.5 text-xs font-medium"
            title="Ekspor Data Master & Template Kalkulasi ke file JSON"
          >
            {isExporting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="text-muted-foreground h-3.5 w-3.5" />
            )}
            Ekspor Paket
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="border-border/60 hover:bg-muted/60 h-8 gap-1.5 text-xs font-medium"
            title="Impor paket Data Master & Kalkulasi dari environment lain"
          >
            <Upload className="text-muted-foreground h-3.5 w-3.5" />
            Impor Paket
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-primary text-primary-foreground h-8 gap-1.5 text-xs font-medium shadow-2xs"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* MAIN TABS FORM */}
      <Tabs defaultValue="endpoints" className="w-full space-y-4">
        <TabsList className="bg-muted/40 border-border/40 grid h-auto w-full grid-cols-1 gap-1 rounded-xl border p-1 sm:grid-cols-3">
          <TabsTrigger
            value="endpoints"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 rounded-lg py-2 text-xs font-medium data-[state=active]:shadow-2xs"
          >
            <Globe className="text-primary h-3.5 w-3.5" />
            <span>Profil Dev & Prod</span>
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 rounded-lg py-2 text-xs font-medium data-[state=active]:shadow-2xs"
          >
            <KeyRound className="text-primary h-3.5 w-3.5" />
            <span>UploadThing & Token</span>
          </TabsTrigger>

          <TabsTrigger
            value="weather"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 rounded-lg py-2 text-xs font-medium data-[state=active]:shadow-2xs"
          >
            <CloudSun className="text-primary h-3.5 w-3.5" />
            <span>Cuaca Bandara</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFIL LINGKUNGAN (DEV & PROD) */}
        <TabsContent value="endpoints" className="space-y-4 pt-1">
          <Card className="border-border/50 bg-card/60 space-y-5 rounded-2xl p-5 shadow-2xs backdrop-blur-xs">
            {/* Active Environment Selector */}
            <div className="border-border/40 bg-muted/20 space-y-2.5 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Radio className="text-primary h-3.5 w-3.5" />
                  Lingkungan Aktif:
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    isProd
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                  )}
                >
                  Aktif: {formData.endpoints.active_environment}
                </Badge>
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed font-normal">
                Pilih profil target server yang digunakan aplikasi untuk endpoint API Backend dan
                Machine Learning.
              </p>

              <RadioGroup
                value={formData.endpoints.active_environment}
                onValueChange={(val: "development" | "production") =>
                  setFormData((prev) => ({
                    ...prev,
                    endpoints: {
                      ...prev.endpoints,
                      active_environment: val,
                      backend_api_url:
                        val === "production"
                          ? prev.endpoints.production.backend_api_url
                          : prev.endpoints.development.backend_api_url,
                      ml_api_base_url:
                        val === "production"
                          ? prev.endpoints.production.ml_api_base_url
                          : prev.endpoints.development.ml_api_base_url,
                    },
                  }))
                }
                className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2"
              >
                {/* Option 1: Development */}
                <Label
                  htmlFor="env-dev"
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs transition-all",
                    !isProd
                      ? "border-emerald-500/40 bg-emerald-500/5 shadow-2xs"
                      : "border-border/40 bg-card/40 hover:bg-muted/30"
                  )}
                >
                  <RadioGroupItem value="development" id="env-dev" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-foreground block font-medium">Development (Lokal)</span>
                    <p className="text-muted-foreground text-[11px] font-normal">
                      Server lokal Port 8080 (Express) & Port 8000 (FastAPI ML).
                    </p>
                  </div>
                </Label>

                {/* Option 2: Production */}
                <Label
                  htmlFor="env-prod"
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs transition-all",
                    isProd
                      ? "border-rose-500/40 bg-rose-500/5 shadow-2xs"
                      : "border-border/40 bg-card/40 hover:bg-muted/30"
                  )}
                >
                  <RadioGroupItem value="production" id="env-prod" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-foreground block font-medium">Production (Live)</span>
                    <p className="text-muted-foreground text-[11px] font-normal">
                      Domain operasional resmi dengan enkripsi HTTPS.
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Grid 2 Profil Endpoints */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Card 1: Development Endpoints */}
              <div className="border-border/50 bg-card/40 space-y-3 rounded-xl border p-4 shadow-2xs">
                <div className="border-border/40 flex items-center justify-between border-b pb-2">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                    <Code2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
                    Endpoints Development
                  </span>
                  {!isProd && (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-[10px] font-normal text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                    >
                      Aktif
                    </Badge>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground/90 text-[11px] font-medium">
                        Backend API URL
                      </Label>
                      <span className="text-muted-foreground font-mono text-[10px]">Port 8080</span>
                    </div>
                    <Input
                      value={formData.endpoints.development.backend_api_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endpoints: {
                            ...prev.endpoints,
                            development: {
                              ...prev.endpoints.development,
                              backend_api_url: e.target.value,
                            },
                            ...(!isProd && { backend_api_url: e.target.value }),
                          },
                        }))
                      }
                      className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
                      placeholder="http://localhost:8080/api/v2"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground/90 text-[11px] font-medium">
                        ML API Base URL
                      </Label>
                      <span className="text-muted-foreground font-mono text-[10px]">Port 8000</span>
                    </div>
                    <Input
                      value={formData.endpoints.development.ml_api_base_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endpoints: {
                            ...prev.endpoints,
                            development: {
                              ...prev.endpoints.development,
                              ml_api_base_url: e.target.value,
                            },
                            ...(!isProd && { ml_api_base_url: e.target.value }),
                          },
                        }))
                      }
                      className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
                      placeholder="http://localhost:8000"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestMl(formData.endpoints.development.ml_api_base_url)}
                    disabled={mlTestState.isLoading}
                    className="border-border/60 hover:bg-muted/40 h-7 w-full gap-1 text-[11px] font-medium"
                  >
                    <Activity className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Uji
                    Koneksi ML Dev
                  </Button>
                </div>
              </div>

              {/* Card 2: Production Endpoints */}
              <div className="border-border/50 bg-card/40 space-y-3 rounded-xl border p-4 shadow-2xs">
                <div className="border-border/40 flex items-center justify-between border-b pb-2">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                    <Globe className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Endpoints
                    Production
                  </span>
                  {isProd && (
                    <Badge
                      variant="outline"
                      className="border-rose-200 bg-rose-50 text-[10px] font-normal text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300"
                    >
                      Aktif
                    </Badge>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground/90 text-[11px] font-medium">
                        Backend API URL
                      </Label>
                      <span className="text-muted-foreground font-mono text-[10px]">HTTPS</span>
                    </div>
                    <Input
                      value={formData.endpoints.production.backend_api_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endpoints: {
                            ...prev.endpoints,
                            production: {
                              ...prev.endpoints.production,
                              backend_api_url: e.target.value,
                            },
                            ...(isProd && { backend_api_url: e.target.value }),
                          },
                        }))
                      }
                      className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
                      placeholder="https://sentinel.angkasapura2.co.id/api/v2"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground/90 text-[11px] font-medium">
                        ML API Base URL
                      </Label>
                      <span className="text-muted-foreground font-mono text-[10px]">HTTPS</span>
                    </div>
                    <Input
                      value={formData.endpoints.production.ml_api_base_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endpoints: {
                            ...prev.endpoints,
                            production: {
                              ...prev.endpoints.production,
                              ml_api_base_url: e.target.value,
                            },
                            ...(isProd && { ml_api_base_url: e.target.value }),
                          },
                        }))
                      }
                      className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
                      placeholder="https://sentinel-ml.angkasapura2.co.id"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestMl(formData.endpoints.production.ml_api_base_url)}
                    disabled={mlTestState.isLoading}
                    className="border-border/60 hover:bg-muted/40 h-7 w-full gap-1 text-[11px] font-medium"
                  >
                    <Activity className="h-3 w-3 text-rose-600 dark:text-rose-400" /> Uji Koneksi ML
                    Prod
                  </Button>
                </div>
              </div>
            </div>

            {/* Helper Box */}
            <div className="border-border/40 bg-muted/20 text-muted-foreground space-y-1 rounded-xl border p-3 text-[11px]">
              <span className="text-foreground/90 flex items-center gap-1 font-medium">
                <Info className="text-primary h-3 w-3" /> Catatan Endpoints:
              </span>
              <p>
                Gunakan <code>http://localhost:8080/api/v2</code> untuk pengujian backend lokal, dan
                pastikan domain production telah terpasang sertifikat SSL.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: UPLOADTHING & KEAMANAN JWT */}
        <TabsContent value="security" className="space-y-4 pt-1">
          <Card className="border-border/50 bg-card/60 space-y-4 rounded-2xl p-5 shadow-2xs backdrop-blur-xs">
            <div className="space-y-0.5">
              <h3 className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                <UploadCloud className="text-primary h-3.5 w-3.5" />
                Integrasi UploadThing Cloud & Token Otentikasi
              </h3>
              <p className="text-muted-foreground text-[11px] font-normal">
                Penyimpanan foto bukti fisik meteran, foto profil, dan lampiran tangkapan layar
                pengaduan bug.
              </p>
            </div>

            {/* FIELD 1: UploadThing App ID */}
            <div className="border-border/40 bg-muted/10 space-y-2 rounded-xl border p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-foreground/90 text-xs font-medium">
                  1. UploadThing App ID
                </Label>
                <span className="text-muted-foreground font-mono text-[10px]">
                  Format pendek (u0v89...)
                </span>
              </div>

              <Input
                value={formData.security.uploadthing_app_id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    security: { ...prev.security, uploadthing_app_id: e.target.value },
                  }))
                }
                placeholder="u0v89..."
                className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
              />

              <div className="bg-muted/30 text-muted-foreground border-border/30 space-y-0.5 rounded-lg border p-2.5 text-[11px]">
                <span className="text-foreground/80 flex items-center gap-1 font-medium">
                  <Info className="text-primary h-3 w-3" /> Panduan App ID:
                </span>
                <p>
                  Buka{" "}
                  <a
                    href="https://uploadthing.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    uploadthing.com/dashboard
                  </a>{" "}
                  ➔ Pilih Project ➔ Buka tab <strong>"API Keys"</strong> ➔ Salin nilai{" "}
                  <strong>App ID</strong>.
                </p>
              </div>
            </div>

            {/* FIELD 2: UploadThing Secret Token */}
            <div className="border-border/40 bg-muted/10 space-y-2 rounded-xl border p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-foreground/90 text-xs font-medium">
                  2. UploadThing Secret Key (sk_live_...)
                </Label>
                <span className="text-muted-foreground font-mono text-[10px]">sk_live_...</span>
              </div>

              <div className="relative">
                <Input
                  type={showSecrets.uploadthingSecret ? "text" : "password"}
                  value={formData.security.uploadthing_secret || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      security: { ...prev.security, uploadthing_secret: e.target.value },
                    }))
                  }
                  placeholder="sk_live_..."
                  className="bg-background/80 border-border/50 h-8 rounded-lg pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowSecrets((p) => ({ ...p, uploadthingSecret: !p.uploadthingSecret }))
                  }
                  className="text-muted-foreground hover:text-foreground absolute top-2 right-2.5"
                >
                  {showSecrets.uploadthingSecret ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="bg-muted/30 text-muted-foreground border-border/30 space-y-0.5 rounded-lg border p-2.5 text-[11px]">
                <span className="text-foreground/80 flex items-center gap-1 font-medium">
                  <Info className="text-primary h-3 w-3" /> Panduan Secret Key:
                </span>
                <p>
                  Di tab <strong>API Keys</strong> UploadThing ➔ Klik{" "}
                  <strong>"Reveal Secret Key"</strong> ➔ Salin token yang diawali{" "}
                  <code>sk_live_</code>.
                </p>
              </div>
            </div>

            {/* FIELD 3: UploadThing JWT Token */}
            <div className="border-border/40 bg-muted/10 space-y-2 rounded-xl border p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-foreground/90 text-xs font-medium">
                  3. UploadThing Token (v6/v7 Base64 Token)
                </Label>
                <span className="text-muted-foreground font-mono text-[10px]">eyJhcHBJZCI6...</span>
              </div>

              <div className="relative">
                <Input
                  type={showSecrets.uploadthingToken ? "text" : "password"}
                  value={formData.security.uploadthing_token || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      security: { ...prev.security, uploadthing_token: e.target.value },
                    }))
                  }
                  placeholder="eyJhcHBJZCI6..."
                  className="bg-background/80 border-border/50 h-8 rounded-lg pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowSecrets((p) => ({ ...p, uploadthingToken: !p.uploadthingToken }))
                  }
                  className="text-muted-foreground hover:text-foreground absolute top-2 right-2.5"
                >
                  {showSecrets.uploadthingToken ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="bg-muted/30 text-muted-foreground border-border/30 space-y-0.5 rounded-lg border p-2.5 text-[11px]">
                <span className="text-foreground/80 flex items-center gap-1 font-medium">
                  <Info className="text-primary h-3 w-3" /> Panduan Base64 Token:
                </span>
                <p>
                  Di tab <strong>API Keys</strong> ➔ Scroll ke bawah pada kotak{" "}
                  <strong>"UploadThing Token"</strong> ➔ Salin token panjang <code>eyJ...</code>.
                </p>
              </div>
            </div>

            {/* FIELD 4: JWT Secret Key */}
            <div className="border-border/40 bg-muted/10 space-y-2 rounded-xl border p-3.5">
              <Label className="text-foreground/90 text-xs font-medium">
                4. JWT Authentication Secret Key
              </Label>
              <div className="relative">
                <Input
                  type={showSecrets.jwt ? "text" : "password"}
                  value={formData.security.jwt_secret || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      security: { ...prev.security, jwt_secret: e.target.value },
                    }))
                  }
                  placeholder="SENTINELxANGKASAPURADJB"
                  className="bg-background/80 border-border/50 h-8 rounded-lg pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets((p) => ({ ...p, jwt: !p.jwt }))}
                  className="text-muted-foreground hover:text-foreground absolute top-2 right-2.5"
                >
                  {showSecrets.jwt ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="text-muted-foreground text-[11px] font-normal">
                Kunci rahasia internal untuk menandatangani token sesi login pengguna.
              </p>
            </div>

            {/* FIELD 5: Google AI Studio API Key */}
            <div className="border-border/40 bg-muted/10 space-y-2 rounded-xl border p-3.5">
              <Label className="text-foreground/90 text-xs font-medium">
                5. Google AI Studio API Key (Gemini)
              </Label>
              <div className="relative">
                <Input
                  type={showSecrets.ai ? "text" : "password"}
                  value={formData.ai.google_generative_ai_api_key || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, google_generative_ai_api_key: e.target.value },
                    }))
                  }
                  placeholder="AIzaSy..."
                  className="bg-background/80 border-border/50 h-8 rounded-lg pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets((p) => ({ ...p, ai: !p.ai }))}
                  className="text-muted-foreground hover:text-foreground absolute top-2 right-2.5"
                >
                  {showSecrets.ai ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="text-muted-foreground text-[11px] font-normal">
                Kunci API untuk integrasi agen AI (mis. Formula Copilot) menggunakan Google Gemini AI SDK.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: CUACA BANDARA (OPENWEATHER) */}
        <TabsContent value="weather" className="space-y-4 pt-1">
          <Card className="border-border/50 bg-card/60 space-y-4 rounded-2xl p-5 shadow-2xs backdrop-blur-xs">
            <div className="space-y-0.5">
              <h3 className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                <CloudSun className="text-primary h-3.5 w-3.5" />
                Telemetri Cuaca & OpenWeather API
              </h3>
              <p className="text-muted-foreground text-[11px] font-normal">
                Parameter suhu udara luar (°C) sebagai variabel input model Machine Learning AI.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-foreground/90 text-[11px] font-medium">
                  Nama Fasilitas / Bandara
                </Label>
                <Input
                  value={formData.weather.airport_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weather: { ...prev.weather, airport_name: e.target.value },
                    }))
                  }
                  placeholder="Bandara Sultan Thaha Jambi"
                  className="bg-background/80 border-border/50 h-8 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-foreground/90 text-[11px] font-medium">
                  Latitude (Lintang)
                </Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.weather.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weather: { ...prev.weather, latitude: Number(e.target.value) },
                    }))
                  }
                  className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-foreground/90 text-[11px] font-medium">
                  Longitude (Bujur)
                </Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.weather.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weather: { ...prev.weather, longitude: Number(e.target.value) },
                    }))
                  }
                  className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground/90 text-[11px] font-medium">
                    OpenWeather API Key
                  </Label>
                  <a
                    href="https://openweathermap.org/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary flex items-center gap-1 text-[10px] font-medium hover:underline"
                  >
                    Daftar API Key Gratis <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Input
                  value={formData.weather.openweather_api_key}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weather: { ...prev.weather, openweather_api_key: e.target.value },
                    }))
                  }
                  placeholder="6953d3a5c74bbd94157aa3455bd9dd87"
                  className="bg-background/80 border-border/50 h-8 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestWeather}
                disabled={weatherTestState.isLoading}
                className="border-border/60 hover:bg-muted/40 text-foreground h-8 gap-1.5 text-xs font-medium"
              >
                {weatherTestState.isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Thermometer className="text-primary h-3.5 w-3.5" />
                )}
                Uji Koneksi Cuaca
              </Button>
            </div>

            {weatherTestState.result && (
              <div
                className={cn(
                  "space-y-1 rounded-xl border p-3 text-xs font-normal",
                  weatherTestState.result.status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300"
                )}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  {weatherTestState.result.status === "success" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{weatherTestState.result.message}</span>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL IMPORT PAKET DATA MASTER & KALKULASI */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent
          maxWidth="4xl"
          className="bg-card text-card-foreground border-border/50 flex max-h-[90vh] w-[96vw] flex-col overflow-hidden rounded-2xl p-5 sm:max-w-2xl"
        >
          <DialogHeader className="border-border/40 shrink-0 border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 text-primary border-primary/20 shrink-0 rounded-xl border p-2">
                <ArrowDownUp className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-sm font-semibold">
                  Impor & Sinkronisasi Paket Data Master
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs font-normal">
                  Migrasikan data meter, tangki, rumus formula, skema tarif, dan lokasi
                  antar-lingkungan (Dev ↔ Prod).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="max-h-[calc(90vh-130px)] flex-1 space-y-3.5 overflow-y-auto pt-2 pr-1 text-xs">
            {/* File Upload Box */}
            <div className="border-border/70 bg-muted/20 hover:bg-muted/30 space-y-2 rounded-xl border border-dashed p-5 text-center transition-all">
              <FileJson className="text-primary/80 mx-auto h-8 w-8" />
              <div className="space-y-0.5">
                <span className="text-foreground block text-xs font-medium">
                  Pilih File Paket JSON (.json)
                </span>
                <p className="text-muted-foreground text-[11px] font-normal">
                  File <code>sentinel_master_package_*.json</code> hasil ekspor
                </p>
              </div>

              <input
                type="file"
                accept=".json"
                onChange={handleFileImportChange}
                className="hidden"
                id="package-file-input"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 cursor-pointer gap-1.5 text-xs font-medium"
              >
                <label htmlFor="package-file-input">
                  <FileUp className="h-3 w-3" /> Pilih File JSON
                </label>
              </Button>
            </div>

            {/* Mode Import Selector */}
            <div className="border-border/40 bg-card/40 space-y-2 rounded-xl border p-3.5">
              <Label className="text-foreground block text-xs font-medium">
                Mode Sinkronisasi Data:
              </Label>
              <RadioGroup
                value={importMode}
                onValueChange={(val: "MERGE_UPSERT" | "CLEAN_IMPORT") => setImportMode(val)}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                <Label
                  htmlFor="mode-merge"
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 transition-all",
                    importMode === "MERGE_UPSERT"
                      ? "border-primary/40 bg-primary/5 shadow-2xs"
                      : "border-border/40"
                  )}
                >
                  <RadioGroupItem value="MERGE_UPSERT" id="mode-merge" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-foreground block text-xs font-medium">
                      Merge & Upsert (Aman)
                    </span>
                    <p className="text-muted-foreground text-[10px] font-normal">
                      Update data yang cocok berdasarkan kode/nama dan insert data baru.
                    </p>
                  </div>
                </Label>

                <Label
                  htmlFor="mode-clean"
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 transition-all",
                    importMode === "CLEAN_IMPORT"
                      ? "border-primary/40 bg-primary/5 shadow-2xs"
                      : "border-border/40"
                  )}
                >
                  <RadioGroupItem value="CLEAN_IMPORT" id="mode-clean" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-foreground block text-xs font-medium">
                      Full Batch Update
                    </span>
                    <p className="text-muted-foreground text-[10px] font-normal">
                      Sinkronisasi penuh seluruh data master dan definisi rumus.
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Preview Breakdown Paket Data */}
            {parsedImportData && (
              <div className="border-primary/20 bg-primary/5 space-y-2 rounded-xl border p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-primary flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Pratinjau Isi Paket:
                  </span>
                  <Badge variant="outline" className="border-primary/30 font-mono text-[10px]">
                    {parsedImportData.environment?.toUpperCase() || "DEV"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div className="bg-card border-border/40 rounded-lg border p-2">
                    <span className="text-muted-foreground block text-[10px] font-normal">
                      Energi:
                    </span>
                    <strong className="text-foreground text-xs font-semibold">
                      {parsedImportData.data?.energies?.length || 0}
                    </strong>
                  </div>
                  <div className="bg-card border-border/40 rounded-lg border p-2">
                    <span className="text-muted-foreground block text-[10px] font-normal">
                      Meteran:
                    </span>
                    <strong className="text-foreground text-xs font-semibold">
                      {parsedImportData.data?.meters?.length || 0}
                    </strong>
                  </div>
                  <div className="bg-card border-border/40 rounded-lg border p-2">
                    <span className="text-muted-foreground block text-[10px] font-normal">
                      Formula:
                    </span>
                    <strong className="text-foreground text-xs font-semibold">
                      {parsedImportData.data?.calculation_templates?.length || 0}
                    </strong>
                  </div>
                  <div className="bg-card border-border/40 rounded-lg border p-2">
                    <span className="text-muted-foreground block text-[10px] font-normal">
                      Tarif:
                    </span>
                    <strong className="text-foreground text-xs font-semibold">
                      {parsedImportData.data?.price_schemes?.length || 0}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-border/40 flex items-center justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(false)}
              disabled={isImporting}
              className="h-8 text-xs font-normal"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleExecuteImport}
              disabled={!parsedImportData || isImporting}
              className="bg-primary text-primary-foreground h-8 gap-1.5 text-xs font-medium shadow-2xs"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Mengimpor...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Jalankan Sinkronisasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
