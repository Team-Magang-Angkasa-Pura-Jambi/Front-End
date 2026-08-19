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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Database,
  Download,
  Filter,
  HardDrive,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Terminal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  clearServerLogsApi,
  getServerLogsApi,
  getServerMetricsApi,
  ServerLogEntry,
  ServerSystemMetrics,
} from "../services/serverMonitoring.service";

export const ServerMonitoringPage = () => {
  const queryClient = useQueryClient();

  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(3000); // 3 seconds
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<ServerLogEntry | null>(null);

  // 1. Fetch System Metrics
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["serverMetrics"],
    queryFn: getServerMetricsApi,
    refetchInterval: isPaused ? false : autoRefreshInterval,
  });

  const metrics: ServerSystemMetrics | undefined = metricsData?.data;

  // 2. Fetch Server Logs
  const {
    data: logsData,
    isLoading: __isLoadingLogs,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["serverLogs", selectedLevel, searchKeyword],
    queryFn: () =>
      getServerLogsApi({
        level: selectedLevel === "ALL" ? undefined : selectedLevel,
        search: searchKeyword || undefined,
        limit: 200,
      }),
    refetchInterval: isPaused ? false : autoRefreshInterval,
  });

  const logsList: ServerLogEntry[] = logsData?.data?.logs || [];
  const totalLogs: number = logsData?.data?.total || 0;

  // 3. Mutation: Clear Logs
  const { mutate: clearLogs, isPending: isClearing } = useMutation({
    mutationFn: clearServerLogsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serverLogs"] });
      queryClient.invalidateQueries({ queryKey: ["serverMetrics"] });
      toast.success("Buffer log server berhasil dibersihkan!");
    },
    onError: (err: any) => {
      toast.error("Gagal membersihkan log server", {
        description: err.response?.data?.message || err.message,
      });
    },
  });

  const handleExportLogs = () => {
    if (logsList.length === 0) {
      toast.info("Tidak ada log untuk diekspor");
      return;
    }
    const jsonStr = JSON.stringify(logsList, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `server-logs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File log server berhasil diunduh");
  };

  const copyToClipboard = (text: string, label: string = "Data") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "ERROR":
        return (
          <Badge className="border-red-500/30 bg-red-500/10 text-[10px] font-bold text-red-600 dark:text-red-400">
            ERROR
          </Badge>
        );
      case "WARN":
        return (
          <Badge className="border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            WARN
          </Badge>
        );
      case "HTTP":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            HTTP
          </Badge>
        );
      case "DB":
        return (
          <Badge className="border-purple-500/30 bg-purple-500/10 text-[10px] font-bold text-purple-600 dark:text-purple-400">
            DB
          </Badge>
        );
      default:
        return (
          <Badge className="border-blue-500/30 bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            INFO
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto space-y-8 p-4 pb-24 md:p-8">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-lg ring-1 shadow-indigo-600/30 ring-indigo-400/30">
              <Server className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Monitoring Server & Industrial Log Viewer
                </h1>
                <Badge
                  variant="outline"
                  className="border-indigo-400/40 bg-indigo-500/20 text-xs font-bold text-indigo-300"
                >
                  Standar Industri
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Pemantauan metrik server, beban CPU/RAM, status database, microservice ML, dan live
                console log real-time.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPaused((p) => !p)}
              className="h-9 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              {isPaused ? (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                  Resume Live
                </>
              ) : (
                <>
                  <Pause className="mr-1.5 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  Pause Live
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              className="h-9 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export Log (JSON)
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isClearing || logsList.length === 0}
              onClick={() => clearLogs()}
              className="h-9 bg-red-600/80 text-white hover:bg-red-600"
            >
              {isClearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Clear Logs
            </Button>
          </div>
        </div>

        {/* Live Stream Indicator Status */}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isPaused ? "bg-amber-400" : "bg-emerald-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2.5 w-2.5 rounded-full",
                  isPaused ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
            </span>
            <span className="font-semibold text-slate-200">
              {isPaused
                ? "Stream Dipause"
                : `Live Streaming Server Logs (Refresh ${autoRefreshInterval / 1000}s)`}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span>
              Uptime: <strong className="text-white">{metrics?.server.uptime_human || "-"}</strong>
            </span>
            <span>
              PID: <strong className="font-mono text-white">{metrics?.server.pid || "-"}</strong>
            </span>
            <span>
              Node:{" "}
              <strong className="font-mono text-white">
                {metrics?.server.node_version || "-"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* METRICS CARDS ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: RAM & Heap */}
        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Memori RAM & Heap
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
              <HardDrive className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {metrics?.memory.heap_used_mb}{" "}
                  <span className="text-muted-foreground text-sm font-normal">MB Used</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  RSS: <strong>{metrics?.memory.rss_mb} MB</strong> / Heap Total:{" "}
                  {metrics?.memory.heap_total_mb} MB
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${metrics?.memory.system_usage_percent || 10}%` }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 2: CPU Cores & Load */}
        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              CPU & System Load
            </CardTitle>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600">
              <Cpu className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {metrics?.cpu.cores}{" "}
                  <span className="text-muted-foreground text-sm font-normal">CPU Cores</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Load Avg:{" "}
                  <strong className="font-mono">{metrics?.cpu.load_avg.join(", ")}</strong>
                </p>
                <p className="text-muted-foreground mt-1 truncate text-[11px]">
                  {metrics?.cpu.model}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 3: Database PostgreSQL */}
        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              PostgreSQL Database
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 uppercase dark:text-slate-100">
                    {metrics?.health?.database.status === "healthy" ? "Online" : "Degraded"}
                  </span>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold",
                      metrics?.health?.database.status === "healthy"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                        : "border-red-500/30 bg-red-500/10 text-red-600"
                    )}
                  >
                    {metrics?.health?.database.status === "healthy" ? "Healthy" : "Error"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Query Latency:{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {metrics?.health?.database.latency_ms} ms
                  </strong>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 4: Machine Learning Microservice */}
        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              FastAPI ML Service
            </CardTitle>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 uppercase dark:text-slate-100">
                    {metrics?.health?.machine_learning.status === "online" ? "Online" : "Offline"}
                  </span>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold",
                      metrics?.health?.machine_learning.status === "online"
                        ? "border-purple-500/30 bg-purple-500/10 text-purple-600"
                        : "border-slate-500/30 bg-slate-500/10 text-slate-500"
                    )}
                  >
                    {metrics?.health?.machine_learning.status === "online" ? "Active" : "Offline"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Ping Latency:{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {metrics?.health?.machine_learning.latency_ms} ms
                  </strong>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* INDUSTRIAL LOG CONSOLE & VIEWER */}
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-900 p-2 text-white dark:bg-slate-800">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  Console Log Aktivitas & Error Debugger
                </CardTitle>
                <CardDescription>
                  Menampilkan {logsList.length} dari total {totalLogs} log rekaman server dalam
                  memory circular buffer.
                </CardDescription>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Cari URL, error, query..."
                  className="h-9 pl-8 text-xs"
                />
              </div>

              {/* Log Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <Filter className="text-muted-foreground mr-1.5 h-3.5 w-3.5" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Level</SelectItem>
                  <SelectItem value="ERROR">🔴 ERROR</SelectItem>
                  <SelectItem value="WARN">🟡 WARN</SelectItem>
                  <SelectItem value="HTTP">🟢 HTTP</SelectItem>
                  <SelectItem value="INFO">🔵 INFO</SelectItem>
                  <SelectItem value="DB">🟣 DB Query</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh Interval */}
              <Select
                value={autoRefreshInterval.toString()}
                onValueChange={(val) => setAutoRefreshInterval(parseInt(val, 10))}
              >
                <SelectTrigger className="h-9 w-[110px] text-xs">
                  <Clock className="text-muted-foreground mr-1.5 h-3.5 w-3.5" />
                  <SelectValue placeholder="Refresh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1 Detik</SelectItem>
                  <SelectItem value="3000">3 Detik</SelectItem>
                  <SelectItem value="5000">5 Detik</SelectItem>
                  <SelectItem value="10000">10 Detik</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => refetchLogs()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[520px] w-full bg-slate-950 font-mono text-xs text-slate-300">
            {logsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-500">
                <Terminal className="mb-2 h-10 w-10 opacity-40" />
                <p className="text-sm font-semibold">
                  Tidak ada log server yang cocok dengan filter
                </p>
                <p className="mt-1 text-xs">Ganti kata kunci pencarian atau pilih 'Semua Level'</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {logsList.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="flex cursor-pointer items-start justify-between gap-4 p-3 transition-colors hover:bg-slate-900/90"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="shrink-0 pt-0.5 text-[11px] text-slate-500 select-none">
                        {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>

                      <div className="shrink-0">{getLevelBadge(log.level)}</div>

                      {log.request?.method && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-slate-700 bg-slate-800 text-[10px] font-bold text-slate-300"
                        >
                          {log.request.method}
                        </Badge>
                      )}

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-xs font-semibold",
                            log.level === "ERROR"
                              ? "text-red-400"
                              : log.level === "WARN"
                                ? "text-amber-400"
                                : log.level === "HTTP"
                                  ? "text-emerald-300"
                                  : "text-slate-200"
                          )}
                        >
                          {log.message}
                        </p>
                        {log.error?.name && (
                          <p className="mt-0.5 truncate text-[11px] text-red-500/80">
                            💥 {log.error.name}: {log.error.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-[11px] text-slate-400">
                      {log.durationMs !== undefined && (
                        <span className="text-slate-500">{log.durationMs}ms</span>
                      )}
                      {log.source && (
                        <span className="font-sans text-[10px] text-slate-600 uppercase">
                          [{log.source}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* DEV DEBUG INSPECTOR MODAL */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent
          maxWidth="4xl"
          className="flex max-h-[92vh] w-[96vw] flex-col overflow-hidden p-6 sm:max-w-6xl"
        >
          <DialogHeader className="border-border/40 shrink-0 border-b pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedLog && getLevelBadge(selectedLog.level)}
                {selectedLog?.statusCode && (
                  <Badge
                    className={cn(
                      "text-[10px] font-bold",
                      selectedLog.statusCode >= 500
                        ? "border-red-500/30 bg-red-500/10 text-red-600"
                        : selectedLog.statusCode >= 400
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                    )}
                  >
                    HTTP {selectedLog.statusCode}
                  </Badge>
                )}
                {selectedLog?.durationMs !== undefined && (
                  <Badge variant="outline" className="font-mono text-[10px]">
                    ⏱️ {selectedLog.durationMs}ms
                  </Badge>
                )}
                <DialogTitle className="ml-1 text-base font-bold">
                  Detail Log & Request/Response Inspector
                </DialogTitle>
              </div>

              <div className="text-muted-foreground font-mono text-[11px]">
                ID: #{selectedLog?.id} | {selectedLog?.timestamp}
              </div>
            </div>
          </DialogHeader>

          {selectedLog && (
            <div className="max-h-[calc(92vh-120px)] flex-1 space-y-4 overflow-y-auto pt-1 pr-2 text-xs">
              {/* Endpoint Hit Banner */}
              <div className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-white shadow-inner sm:flex-row sm:items-center dark:border-slate-800">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Badge className="shrink-0 bg-indigo-600 font-mono text-xs font-bold text-white">
                    {selectedLog.request?.method || "GET"}
                  </Badge>
                  <span className="truncate font-mono text-xs font-semibold text-indigo-300 select-all">
                    {selectedLog.endpoint || selectedLog.request?.url || selectedLog.message}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 shrink-0 border-slate-700 bg-slate-800 text-[11px] text-slate-200 hover:bg-slate-700"
                  onClick={() =>
                    copyToClipboard(
                      selectedLog.endpoint || selectedLog.request?.url || "",
                      "Endpoint URL"
                    )
                  }
                >
                  <Copy className="mr-1 h-3 w-3" /> Salin URL
                </Button>
              </div>

              {/* Tabbed Inspector */}
              <Tabs defaultValue="request" className="w-full">
                <TabsList className="grid h-9 w-full grid-cols-3">
                  <TabsTrigger value="request" className="text-xs font-semibold">
                    📤 Request Payload ({selectedLog.request?.method || "HTTP"})
                  </TabsTrigger>
                  <TabsTrigger value="response" className="text-xs font-semibold">
                    📥 Response Body ({selectedLog.statusCode || "200"})
                  </TabsTrigger>
                  <TabsTrigger value="error" className="text-xs font-semibold">
                    💥 Error & Stack Trace {selectedLog.error ? "🔴" : ""}
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: REQUEST */}
                <TabsContent value="request" className="space-y-3 pt-3">
                  {selectedLog.request ? (
                    <>
                      {/* Query Parameters */}
                      {selectedLog.request.query &&
                        Object.keys(selectedLog.request.query).length > 0 && (
                          <div className="space-y-2 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-700 uppercase dark:text-slate-300">
                                Query Parameters (URL Search):
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() =>
                                  copyToClipboard(
                                    JSON.stringify(selectedLog.request?.query, null, 2),
                                    "Query Params"
                                  )
                                }
                              >
                                <Copy className="mr-1 h-3 w-3" /> Salin
                              </Button>
                            </div>
                            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400">
                              {JSON.stringify(selectedLog.request.query, null, 2)}
                            </pre>
                          </div>
                        )}

                      {/* Request Body */}
                      <div className="space-y-2 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-700 uppercase dark:text-slate-300">
                            Request Payload Body:
                          </span>
                          {selectedLog.request.body && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px]"
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(selectedLog.request?.body, null, 2),
                                  "Request Body"
                                )
                              }
                            >
                              <Copy className="mr-1 h-3 w-3" /> Salin Body
                            </Button>
                          )}
                        </div>
                        {selectedLog.request.body &&
                        Object.keys(selectedLog.request.body).length > 0 ? (
                          <pre className="max-h-[420px] overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-blue-400">
                            {JSON.stringify(selectedLog.request.body, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-muted-foreground text-xs italic">
                            Tidak ada payload body pada request ini (GET request atau empty body).
                          </p>
                        )}
                      </div>

                      {/* Headers & Client Info */}
                      <div className="bg-muted/30 text-muted-foreground space-y-1.5 rounded-xl border border-slate-200 p-3.5 text-[11px] dark:border-slate-800">
                        <div>
                          Client IP:{" "}
                          <strong className="font-mono text-slate-900 dark:text-slate-100">
                            {selectedLog.request.ip || "127.0.0.1"}
                          </strong>
                        </div>
                        {selectedLog.request.headers?.["user-agent"] && (
                          <div className="truncate">
                            User Agent:{" "}
                            <span className="font-mono">
                              {selectedLog.request.headers["user-agent"]}
                            </span>
                          </div>
                        )}
                        {selectedLog.request.headers?.["content-type"] && (
                          <div>
                            Content-Type:{" "}
                            <span className="font-mono">
                              {selectedLog.request.headers["content-type"]}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground p-8 text-center">
                      Tidak ada detail request yang tercatat.
                    </div>
                  )}
                </TabsContent>

                {/* TAB 2: RESPONSE */}
                <TabsContent value="response" className="space-y-3 pt-3">
                  <div className="space-y-2 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700 uppercase dark:text-slate-300">
                        Response Payload dari Server:
                      </span>
                      {selectedLog.response?.body && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px]"
                          onClick={() =>
                            copyToClipboard(
                              typeof selectedLog.response?.body === "string"
                                ? selectedLog.response.body
                                : JSON.stringify(selectedLog.response?.body, null, 2),
                              "Response Body"
                            )
                          }
                        >
                          <Copy className="mr-1 h-3 w-3" /> Salin Response
                        </Button>
                      )}
                    </div>

                    {selectedLog.response?.body ? (
                      <pre className="max-h-[500px] overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300">
                        {typeof selectedLog.response.body === "string"
                          ? selectedLog.response.body
                          : JSON.stringify(selectedLog.response.body, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">
                        Response body tidak tersedia atau data bertipe binary/stream.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 3: ERROR & STACK */}
                <TabsContent value="error" className="space-y-3 pt-3">
                  {selectedLog.error ? (
                    <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-red-600" />
                          <span className="text-[10px] font-bold text-red-700 uppercase dark:text-red-400">
                            Error Stack Trace ({selectedLog.error.name})
                          </span>
                        </div>
                        {selectedLog.error.stack && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 border-red-200 text-[10px] dark:border-red-900"
                            onClick={() =>
                              copyToClipboard(selectedLog.error?.stack || "", "Stack Trace")
                            }
                          >
                            <Copy className="mr-1 h-3 w-3" /> Salin Stack
                          </Button>
                        )}
                      </div>

                      <p className="font-mono text-sm font-semibold text-red-600 dark:text-red-300">
                        {selectedLog.error.message}
                      </p>

                      {selectedLog.error.stack && (
                        <pre className="mt-1 max-h-[450px] overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-red-400">
                          {selectedLog.error.stack}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground p-8 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500 opacity-60" />
                      <p className="text-xs font-semibold">
                        Tidak ada error pada eksekusi request ini (Status{" "}
                        {selectedLog.statusCode || 200} OK).
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
