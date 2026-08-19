"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { AuditAction, AuditLog } from "@/common/types/audit-log";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import {
  Activity,
  Calendar as CalendarIcon,
  Clock,
  Copy,
  Edit,
  Eye,
  History,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogSkeleton } from "../components/molecules/LogSkeleton";
import { useAuditLog } from "../hooks/useAuditLog";

interface SentinelAuditLogProps {
  entityTable: string;
  title?: string;
  height?: string;
  className?: string;
}

export const SentinelAuditLog = ({
  entityTable,
  title = "Riwayat Aktivitas & Perubahan Data",
  height = "h-[500px]",
  className,
}: SentinelAuditLogProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedLog, setSelectedLog] = useState<AuditLog<Record<string, unknown>> | null>(null);

  useEffect(() => {
    if (startDate && endDate && isBefore(startOfDay(endDate), startOfDay(startDate))) {
      setEndDate(undefined);
    }
  }, [startDate, endDate]);

  const { data: logRes, isLoading, isFetching, refetch } = useAuditLog({
    entityTable,
    start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const logs = (logRes?.data || []) as AuditLog<Record<string, unknown>>[];

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const copyToClipboard = (text: string, label: string = "Data") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  const getActionStyle = (action: AuditAction | string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return {
          icon: <PlusCircle className="h-4 w-4" />,
          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
          label: "Penambahan",
        };
      case "UPDATE":
        return {
          icon: <Edit className="h-4 w-4" />,
          color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
          label: "Pembaruan",
        };
      case "DELETE":
        return {
          icon: <Trash2 className="h-4 w-4" />,
          color: "text-red-500 bg-red-500/10 border-red-500/30",
          label: "Penghapusan",
        };
      case "UPSERT":
        return {
          icon: <Sparkles className="h-4 w-4" />,
          color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
          label: "Upsert",
        };
      default:
        return {
          icon: <Activity className="h-4 w-4" />,
          color: "text-slate-500 bg-slate-500/10 border-slate-500/30",
          label: action,
        };
    }
  };

  // Helper untuk mencari nama display yang informatif dari record
  const getRecordDisplayName = (log: AuditLog<Record<string, unknown>>) => {
    const newVals = (log.new_values || {}) as Record<string, any>;
    const oldVals = (log.old_values || {}) as Record<string, any>;

    const name =
      newVals.name ||
      oldVals.name ||
      newVals.meter_code ||
      oldVals.meter_code ||
      newVals.kpi_name ||
      oldVals.kpi_name ||
      newVals.full_name ||
      oldVals.full_name ||
      newVals.username ||
      oldVals.username ||
      newVals.title ||
      oldVals.title ||
      newVals.description ||
      oldVals.description ||
      `Record #${log.entity_id}`;

    return String(name);
  };

  // Helper untuk mendeteksi kunci yang berubah pada saat UPDATE
  const getChangedKeys = (oldVals: Record<string, any>, newVals: Record<string, any>) => {
    const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]));
    const ignoreKeys = ["updated_at", "created_at", "updated_by", "created_by", "password_hash"];

    return allKeys.filter((key) => {
      if (ignoreKeys.includes(key)) return false;
      return JSON.stringify(oldVals[key]) !== JSON.stringify(newVals[key]);
    });
  };

  if (isLoading) return <LogSkeleton />;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header & Date Filter Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Menampilkan {logs.length} riwayat mutasi untuk tabel <strong className="font-mono text-indigo-600 dark:text-indigo-400">{entityTable}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 w-32 justify-start text-left text-[11px] font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Dari Tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  locale={id}
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground text-[10px]">s/d</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!startDate}
                  className={cn(
                    "h-8 w-32 justify-start text-left text-[11px] font-normal",
                    !endDate && "text-muted-foreground",
                    !startDate && "cursor-not-allowed opacity-50"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Sampai Tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  locale={id}
                  disabled={(date) =>
                    startDate ? isBefore(startOfDay(date), startOfDay(startDate)) : false
                  }
                />
              </PopoverContent>
            </Popover>

            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground h-8 w-8 hover:text-red-500"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <History className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* TIMELINE LIST */}
      <ScrollArea className={cn("pr-4", height)}>
        <div className="before:from-border before:via-border relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:to-transparent">
          {logs.length === 0 ? (
            <div className="text-muted-foreground py-12 pl-12 text-sm italic">
              Belum ada riwayat aktivitas yang tercatat untuk kategori ini.
            </div>
          ) : (
            logs.map((log) => {
              const style = getActionStyle(log.action);
              const newVals = (log.new_values || {}) as Record<string, any>;
              const oldVals = (log.old_values || {}) as Record<string, any>;
              const displayName = getRecordDisplayName(log);
              const changedKeys = log.action === "UPDATE" ? getChangedKeys(oldVals, newVals) : [];

              return (
                <div key={log.log_id} className="relative pb-2 pl-12">
                  <div
                    className={cn(
                      "bg-background absolute top-1 left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-transform",
                      style.color
                    )}
                  >
                    {style.icon}
                  </div>

                  <div className="group bg-card hover:border-primary/30 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-all hover:shadow-md space-y-2.5">
                    {/* Row 1: Action Badge, Display Name, and Timestamp */}
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-bold uppercase", style.color)}
                        >
                          {style.label}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-[10px] bg-muted/40">
                          {log.entity_table} #{log.entity_id}
                        </Badge>
                        <span className="text-foreground text-sm font-bold truncate max-w-xs sm:max-w-md">
                          {displayName}
                        </span>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-mono shrink-0">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Row 2: Actor Info & Detail Button */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-500" />
                        Oleh <strong className="text-slate-900 dark:text-slate-100 font-semibold">{log.user?.full_name || `User ID #${log.user_id}`}</strong>
                        <span className="text-[10px] font-mono opacity-60">({log.ip_address || "127.0.0.1"})</span>
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-semibold"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-3 w-3" /> Lihat Diff Lengkap
                      </Button>
                    </div>

                    {/* Quick Diff Preview untuk UPDATE */}
                    {log.action === "UPDATE" && changedKeys.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-2.5 font-mono text-[11px] space-y-1.5">
                        {changedKeys.slice(0, 3).map((key) => (
                          <div key={key} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            <div className="text-red-500/90 truncate">
                              <span className="font-bold text-muted-foreground uppercase">{key}:</span> {String(oldVals[key] ?? "-")}
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
                              → {String(newVals[key] ?? "-")}
                            </div>
                          </div>
                        ))}
                        {changedKeys.length > 3 && (
                          <p className="text-[9px] text-muted-foreground italic">
                            +{changedKeys.length - 3} field perubahan lainnya...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* MODAL DIFF INSPECTOR */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedLog && getActionStyle(selectedLog.action).icon}
              <DialogTitle className="text-base font-bold">
                Detail Perubahan Data Audit ({selectedLog?.entity_table} #{selectedLog?.entity_id})
              </DialogTitle>
            </div>
            <DialogDescription className="font-mono text-xs">
              Audit ID: {selectedLog?.log_id} | Waktu: {selectedLog?.created_at}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Petugas Box */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-muted/40 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Petugas:</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedLog.user?.full_name || `User ID #${selectedLog.user_id}`}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Alamat IP:</span>
                  <p className="font-mono text-slate-900 dark:text-slate-100">
                    {selectedLog.ip_address || "127.0.0.1"}
                  </p>
                </div>
              </div>

              {/* Diff Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Old Values */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[10px]">
                      ◀ Nilai Sebelumnya (Old Values):
                    </span>
                    {selectedLog.old_values && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedLog.old_values, null, 2),
                            "Old Values"
                          )
                        }
                      >
                        <Copy className="mr-1 h-3 w-3" /> Salin
                      </Button>
                    )}
                  </div>
                  {selectedLog.old_values ? (
                    <pre className="rounded-lg bg-slate-950 p-2.5 text-amber-300 font-mono text-[11px] overflow-x-auto max-h-72">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground italic">
                      Tidak ada data sebelumnya (Operasi CREATE / Data Baru).
                    </div>
                  )}
                </div>

                {/* New Values */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px]">
                      ▶ Nilai Sesudah (New Values):
                    </span>
                    {selectedLog.new_values && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedLog.new_values, null, 2),
                            "New Values"
                          )
                        }
                      >
                        <Copy className="mr-1 h-3 w-3" /> Salin
                      </Button>
                    )}
                  </div>
                  {selectedLog.new_values ? (
                    <pre className="rounded-lg bg-slate-950 p-2.5 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-72">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground italic">
                      Data telah dihapus (Operasi DELETE).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
