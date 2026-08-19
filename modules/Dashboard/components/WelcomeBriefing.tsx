"use client";

import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bug,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Server,
  ShieldAlert,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/common/components/ui/button";
import api from "@/lib/api";
import { BugReportSummary, getBugReportsApi } from "@/modules/BugReport/services/bugReport.service";
import {
  getServerMetricsApi,
  ServerSystemMetrics,
} from "@/modules/ServerMonitoring/services/serverMonitoring.service";

// ─── Types ───────────────────────────────────────────────────
interface BriefingCardData {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string; // tailwind bg color class
  iconColor: string; // tailwind text color
}

// ─── Fetch helpers ───────────────────────────────────────────
const getOverviewStats = async () => {
  // Parallel lightweight calls for counts
  const [meters, energies, users, audits] = await Promise.allSettled([
    api.get("/meters", { params: { limit: 1 } }),
    api.get("/energies", { params: { limit: 1 } }),
    api.get("/users", { params: { limit: 1 } }),
    api.get("/audit-logs", { params: { limit: 1 } }),
  ]);

  return {
    meterCount: meters.status === "fulfilled" ? (meters.value.data?.meta?.total ?? 0) : 0,
    energyCount: energies.status === "fulfilled" ? (energies.value.data?.meta?.total ?? 0) : 0,
    userCount: users.status === "fulfilled" ? (users.value.data?.meta?.total ?? 0) : 0,
    auditCount: audits.status === "fulfilled" ? (audits.value.data?.meta?.total ?? 0) : 0,
  };
};

// ─── Component ───────────────────────────────────────────────
export const WelcomeBriefing = () => {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-dismiss after session (check sessionStorage)
    const key = `briefing_dismissed_${user?.id}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) {
      setDismissed(true);
    }
  }, [user?.id]);

  const role = user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";

  // ─── Data queries (conditional per role) ─────────────────
  const { data: metrics } = useQuery({
    queryKey: ["welcome-metrics"],
    queryFn: getServerMetricsApi,
    enabled: mounted && !dismissed && isSuperAdmin,
    staleTime: 60_000,
  });

  const { data: bugRes } = useQuery({
    queryKey: ["welcome-bugs"],
    queryFn: () => getBugReportsApi({ limit: 1 }),
    enabled: mounted && !dismissed && (isSuperAdmin || isAdmin),
    staleTime: 60_000,
  });

  const { data: overviewStats } = useQuery({
    queryKey: ["welcome-overview"],
    queryFn: getOverviewStats,
    enabled: mounted && !dismissed,
    staleTime: 60_000,
  });

  if (!mounted || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    const key = `briefing_dismissed_${user?.id}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(key, "1");
    }
  };

  const sysMetrics: ServerSystemMetrics | undefined = metrics?.data;
  const bugSummary: BugReportSummary | undefined = bugRes?.meta?.summary;

  // ─── Build cards per role ────────────────────────────────
  const cards: BriefingCardData[] = [];

  if (isSuperAdmin) {
    // Server Status
    const dbStatus = sysMetrics?.health?.database?.status ?? "unknown";
    const mlStatus = sysMetrics?.health?.machine_learning?.status ?? "unknown";
    const isHealthy = dbStatus === "healthy" && (mlStatus === "online" || mlStatus === "unknown");

    cards.push({
      icon: <Server className="h-4 w-4" />,
      label: "Status Server",
      value: isHealthy ? "Operasional" : "Gangguan",
      sub: `DB: ${dbStatus} • ML: ${mlStatus}`,
      color: isHealthy ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30",
      iconColor: isHealthy ? "text-emerald-600" : "text-red-600",
    });

    // Memory
    if (sysMetrics?.memory) {
      cards.push({
        icon: <Activity className="h-4 w-4" />,
        label: "Penggunaan RAM",
        value: `${sysMetrics.memory.system_usage_percent}%`,
        sub: `${sysMetrics.memory.heap_used_mb.toFixed(0)} MB heap digunakan`,
        color:
          sysMetrics.memory.system_usage_percent > 80
            ? "bg-amber-50 dark:bg-amber-950/30"
            : "bg-sky-50 dark:bg-sky-950/30",
        iconColor: sysMetrics.memory.system_usage_percent > 80 ? "text-amber-600" : "text-sky-600",
      });
    }

    // Log Errors
    if (sysMetrics?.logs_stats) {
      cards.push({
        icon: <ShieldAlert className="h-4 w-4" />,
        label: "Error di Log",
        value: sysMetrics.logs_stats.error_count,
        sub: `${sysMetrics.logs_stats.warn_count} peringatan • ${sysMetrics.logs_stats.total} total`,
        color:
          sysMetrics.logs_stats.error_count > 0
            ? "bg-red-50 dark:bg-red-950/30"
            : "bg-emerald-50 dark:bg-emerald-950/30",
        iconColor: sysMetrics.logs_stats.error_count > 0 ? "text-red-600" : "text-emerald-600",
      });
    }

    // Bug Reports
    if (bugSummary) {
      const openBugs = (bugSummary.OPEN ?? 0) + (bugSummary.IN_PROGRESS ?? 0);
      cards.push({
        icon: <Bug className="h-4 w-4" />,
        label: "Laporan Bug Aktif",
        value: openBugs,
        sub: `${bugSummary.RESOLVED ?? 0} terselesaikan • ${bugSummary.total_all ?? 0} total`,
        color:
          openBugs > 0
            ? "bg-orange-50 dark:bg-orange-950/30"
            : "bg-emerald-50 dark:bg-emerald-950/30",
        iconColor: openBugs > 0 ? "text-orange-600" : "text-emerald-600",
      });
    }

    // Uptime
    if (sysMetrics?.server) {
      cards.push({
        icon: <Clock className="h-4 w-4" />,
        label: "Uptime Server",
        value: sysMetrics.server.uptime_human,
        sub: `Node ${sysMetrics.server.node_version} • PID ${sysMetrics.server.pid}`,
        color: "bg-indigo-50 dark:bg-indigo-950/30",
        iconColor: "text-indigo-600",
      });
    }

    // Users
    if (overviewStats) {
      cards.push({
        icon: <Users className="h-4 w-4" />,
        label: "Total Pengguna",
        value: overviewStats.userCount,
        sub: "Pengguna aktif terdaftar di sistem",
        color: "bg-violet-50 dark:bg-violet-950/30",
        iconColor: "text-violet-600",
      });
    }
  }

  if (isAdmin) {
    // Data Master
    if (overviewStats) {
      cards.push({
        icon: <Database className="h-4 w-4" />,
        label: "Data Master",
        value: `${overviewStats.meterCount} Meter`,
        sub: `${overviewStats.energyCount} jenis energi terdaftar`,
        color: "bg-sky-50 dark:bg-sky-950/30",
        iconColor: "text-sky-600",
      });

      cards.push({
        icon: <Users className="h-4 w-4" />,
        label: "Total Pengguna",
        value: overviewStats.userCount,
        sub: "Pengguna aktif di sistem",
        color: "bg-violet-50 dark:bg-violet-950/30",
        iconColor: "text-violet-600",
      });
    }

    // Bug Reports
    if (bugSummary) {
      const openBugs = (bugSummary.OPEN ?? 0) + (bugSummary.IN_PROGRESS ?? 0);
      cards.push({
        icon: <Bug className="h-4 w-4" />,
        label: "Bug Dilaporkan",
        value: openBugs > 0 ? `${openBugs} aktif` : "Aman",
        sub: `${bugSummary.total_all ?? 0} total laporan`,
        color:
          openBugs > 0
            ? "bg-orange-50 dark:bg-orange-950/30"
            : "bg-emerald-50 dark:bg-emerald-950/30",
        iconColor: openBugs > 0 ? "text-orange-600" : "text-emerald-600",
      });
    }

    // Audit
    if (overviewStats) {
      cards.push({
        icon: <FileText className="h-4 w-4" />,
        label: "Log Audit",
        value: overviewStats.auditCount,
        sub: "Total riwayat mutasi data",
        color: "bg-slate-100 dark:bg-slate-800/50",
        iconColor: "text-slate-600",
      });
    }
  }

  if (isTechnician) {
    // Simplified view for technician
    if (overviewStats) {
      cards.push({
        icon: <Zap className="h-4 w-4" />,
        label: "Meter Aktif",
        value: overviewStats.meterCount,
        sub: "Total meter yang perlu dipantau",
        color: "bg-amber-50 dark:bg-amber-950/30",
        iconColor: "text-amber-600",
      });

      cards.push({
        icon: <Database className="h-4 w-4" />,
        label: "Jenis Energi",
        value: overviewStats.energyCount,
        sub: "Tipe energi yang tercatat",
        color: "bg-sky-50 dark:bg-sky-950/30",
        iconColor: "text-sky-600",
      });
    }

    cards.push({
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Tugas Hari Ini",
      value: "Input Data",
      sub: "Pastikan data pembacaan meter terupdate",
      color: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600",
    });
  }

  // ─── Role label ──────────────────────────────────────────
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Administrator",
    ADMIN: "Administrator",
    TECHNICIAN: "Teknisi Lapangan",
  };

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    TECHNICIAN: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-white shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950">
            {/* Subtle decoration */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-200/30 to-sky-200/20 blur-3xl dark:from-emerald-900/20 dark:to-sky-900/10" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-tr from-violet-200/20 to-transparent blur-2xl dark:from-violet-900/10" />

            <div className="relative p-5">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Briefing Hari Ini
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${roleBadgeColors[role || ""] || "bg-slate-100 text-slate-600"}`}
                      >
                        {roleLabels[role || ""] || role}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date().toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="h-7 w-7 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {cards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className={`group relative flex flex-col gap-1.5 rounded-xl border border-slate-200/60 p-3 transition-all duration-200 hover:shadow-md dark:border-slate-700/40 ${card.color}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`${card.iconColor}`}>{card.icon}</div>
                      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        {card.label}
                      </span>
                    </div>
                    <p className="text-lg leading-tight font-black text-slate-800 dark:text-slate-100">
                      {card.value}
                    </p>
                    {card.sub && (
                      <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                        {card.sub}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
