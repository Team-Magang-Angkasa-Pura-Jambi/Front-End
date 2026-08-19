import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Database, // <-- Import icon Database
  FunctionSquare,
  Info,
  Settings2,
  User,
  Zap,
} from "lucide-react";
import { useMemo } from "react";

import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Separator } from "@/common/components/ui/separator";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";

import { StatCard } from "@/modules/Dashboard/components/resourceConsumptionSummary/components/statCardSkeleton";
import { StatusIndicator } from "@/modules/NotificationCenter/components/notification-status";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useMeterQuery } from "../hooks/useMeterQuery";

interface ValidationRule {
  rule: string;
  error_message: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const MeterDetailSheet = ({ meterId }: { meterId: number }) => {
  const { useGetMeterDetail } = useMeterQuery();

  const { data: responseMeterDetail, isLoading, isError } = useGetMeterDetail(meterId);

  const data = useMemo(() => responseMeterDetail?.data || null, [responseMeterDetail]);

  if (isError) return <ErrorFetchData />;

  if (isLoading)
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );

  if (!data) return null;

  // Casting atau parse validations dari template jika ada
  const validations = (data.calculation_template?.validations || []) as unknown as ValidationRule[];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">{data.name}</h2>
            {data.is_virtual && (
              <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-blue-600">
                Virtual Device
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
              {data.meter_code}
            </code>
            <span className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3 text-yellow-500" />
              {data.energy_type?.name}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusIndicator status={data.status} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator />
      </motion.div>

      {/* SECTION 2: DASHBOARD GRIDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          icon={Zap}
          label="Standar Unit"
          value={data.energy_type?.unit_standard ?? "-"}
          unit="Metric"
          iconBgColor="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          label="Multiplier"
          value={`${data.multiplier}x`}
          unit="Factor"
          iconBgColor="bg-orange-500"
        />
        <StatCard
          icon={CalendarClock}
          label="Terakhir Update"
          value={
            data.updated_at ? format(new Date(data.updated_at), "dd MMM", { locale: id }) : "-"
          }
          unit={data.updated_at ? format(new Date(data.updated_at), "HH:mm") : ""}
          iconBgColor="bg-emerald-500"
        />
        <StatCard
          icon={User}
          label="Diupdate Oleh"
          value={data.updater?.full_name?.split(" ")[0] || "-"}
          unit="Staff"
          iconBgColor="bg-purple-500"
        />
      </motion.div>

      {/* SECTION 3: CONFIGURATION */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-muted/30 border-none shadow-none lg:col-span-2">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="text-primary h-4 w-4" />
              Konfigurasi Parameter
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.reading_configs?.map((config) => (
                <div
                  key={config.config_id}
                  className="bg-background hover:border-primary/50 flex items-center justify-between rounded-md border p-3 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-1.5 rounded-full ${config.is_active ? "bg-primary" : "bg-muted"}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{config.reading_type?.name}</span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        UNIT: {config.reading_type?.unit}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={config.is_active ? "outline" : "secondary"}
                    className="text-[10px]"
                  >
                    {config.is_active ? "Aktif" : "Non-Aktif"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 flex flex-col items-center justify-center border-none p-6 text-center shadow-none">
          <Info className="mb-2 h-8 w-8 opacity-50" />
          <p className="text-muted-foreground text-xs">Lokasi: {data.location?.name || "Jambi"}</p>
        </Card>
      </motion.div>

      {/* SECTION 4: TANK PROFILE (MUNUCL JIKA ADA DATA TANGKI) */}
      <AnimatePresence>
        {data.tank_profile && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="border-orange-200 bg-orange-50/30 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-orange-800">
                  <Database className="h-4 w-4" />
                  Profil Tangki BBM
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                      Bentuk
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {data.tank_profile.shape?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                      Kapasitas
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {data.tank_profile.capacity_liters} L
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                      Tinggi Max
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {data.tank_profile.height_max_cm} cm
                    </span>
                  </div>
                  {data.tank_profile.diameter_cm && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Diameter
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {data.tank_profile.diameter_cm} cm
                      </span>
                    </div>
                  )}
                  {data.tank_profile.length_cm && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Panjang
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {data.tank_profile.length_cm} cm
                      </span>
                    </div>
                  )}
                  {data.tank_profile.width_cm && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Lebar
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {data.tank_profile.width_cm} cm
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 5: CALCULATION & RULES */}
      <AnimatePresence>
        {data.calculation_template && (
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <FunctionSquare className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold">Logika Kalkulasi & Validasi</h3>
            </div>

            <Card className="border-muted overflow-hidden shadow-md">
              <Tabs
                defaultValue={data.calculation_template.definitions[0]?.name || "rules"}
                className="w-full"
              >
                <div className="bg-muted/30 border-b px-4 py-2">
                  <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                    {/* Render Tab untuk Rumus-rumus */}
                    {data.calculation_template.definitions.map((def: any, idx: number) => (
                      <TabsTrigger
                        key={idx}
                        value={def.name}
                        className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        {def.name}
                      </TabsTrigger>
                    ))}

                    {/* Tab Khusus untuk Validasi / Rules */}
                    <TabsTrigger
                      value="rules"
                      className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Rules Validasi
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Konten Tab Rumus */}
                {data.calculation_template.definitions.map((def: any, idx: number) => (
                  <TabsContent
                    key={idx}
                    value={def.name}
                    className="m-0 focus-visible:outline-none"
                  >
                    <div className="grid grid-cols-1 divide-y lg:grid-cols-5 lg:divide-x lg:divide-y-0">
                      <div className="p-6 lg:col-span-3">
                        <div className="group relative">
                          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
                          <div className="relative rounded-lg bg-slate-950 p-4">
                            <pre className="font-mono text-xs whitespace-pre-wrap text-slate-50">
                              {def.formula_items?.formula}
                            </pre>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/5 p-6 lg:col-span-2">
                        <div className="space-y-2">
                          {def.formula_items?.variables?.map((v: any, vIdx: number) => (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              key={vIdx}
                              className="flex items-center justify-between rounded-md border p-2 shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-2 w-2 rounded-full ${v.type === "reading" ? "bg-blue-400" : "bg-orange-400"}`}
                                />
                                <span className="font-mono text-xs font-bold">{v.label}</span>
                              </div>
                              {v.timeShift !== undefined && v.timeShift !== 0 && (
                                <Badge className="h-4 text-[9px]">
                                  t{v.timeShift > 0 ? `+${v.timeShift}` : v.timeShift}
                                </Badge>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}

                {/* KONTEN TAB RULES (VALIDASI) */}
                <TabsContent value="rules" className="m-0 p-6 focus-visible:outline-none">
                  {validations && validations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {validations.map((item, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="bg-background flex flex-col justify-between rounded-lg border p-4 shadow-sm"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div className="rounded bg-amber-100 p-1 text-amber-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-mono text-xs font-semibold text-slate-800">
                              Aturan #{rIdx + 1}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="rounded bg-slate-950 p-2.5">
                              <code className="font-mono text-xs font-bold text-amber-400">
                                {item.rule}
                              </code>
                            </div>
                            <p className="text-muted-foreground text-xs italic">
                              "{item.error_message}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center justify-center p-8 text-center text-xs">
                      <Info className="mb-2 h-6 w-6 opacity-40" />
                      Tidak ada aturan validasi khusus yang dikonfigurasi pada template ini.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
