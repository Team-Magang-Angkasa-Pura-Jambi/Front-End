import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Activity, CalendarClock, FunctionSquare, Info, Settings2, User, Zap } from "lucide-react";
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

      {/* SECTION 2: DASHBOARD GRIDS - Sekarang menggunakan StatCard yang rapi */}
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

      {/* SECTION 5: CALCULATION */}
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
              <h3 className="text-sm font-bold">Logika Kalkulasi</h3>
            </div>

            <Card className="border-muted overflow-hidden shadow-md">
              <Tabs
                defaultValue={data.calculation_template.definitions[0]?.name}
                className="w-full"
              >
                <div className="bg-muted/30 border-b px-4 py-2">
                  <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                    {data.calculation_template.definitions.map((def, idx: number) => (
                      <TabsTrigger
                        key={idx}
                        value={def.name}
                        className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        {def.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {data.calculation_template.definitions.map((def, idx: number) => (
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
                          {def.formula_items?.variables?.map((v, vIdx: number) => (
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
                              {v.timeShift !== 0 && (
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
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
