"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { AuditAction, AuditLog } from "@/common/types/audit-log";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import {
  Activity,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  History,
  PlusCircle,
  RotateCcw,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  title = "Riwayat Aktivitas",
  height = "h-[500px]",
  className,
}: SentinelAuditLogProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    if (startDate && endDate && isBefore(startOfDay(endDate), startOfDay(startDate))) {
      setEndDate(undefined);
    }
  }, [startDate, endDate]);

  const { data: logRes, isLoading } = useAuditLog({
    entityTable,
    start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  // Type Casting ke Record agar aman mengakses properti dinamis
  const logs = (logRes?.data || []) as AuditLog<Record<string, unknown>>[];

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getActionStyle = (action: AuditAction | string) => {
    switch (action) {
      case "CREATE":
        return {
          icon: <PlusCircle className="h-4 w-4" />,
          color: "text-emerald-500 bg-emerald-500/10",
          label: "Penambahan",
        };
      case "UPDATE":
        return {
          icon: <Edit className="h-4 w-4" />,
          color: "text-blue-500 bg-blue-500/10",
          label: "Pembaruan",
        };
      case "DELETE":
        return {
          icon: <Trash2 className="h-4 w-4" />,
          color: "text-red-500 bg-red-500/10",
          label: "Penghapusan",
        };
      default:
        return {
          icon: <Activity className="h-4 w-4" />,
          color: "text-slate-500 bg-slate-500/10",
          label: action,
        };
    }
  };

  if (isLoading) return <LogSkeleton />;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <History className="text-primary h-5 w-5" />
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 w-32.5 justify-start text-left text-[11px] font-normal", // canonical w-32.5
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Mulai"}
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
                    "h-8 w-32.5 justify-start text-left text-[11px] font-normal", // canonical w-32.5
                    !endDate && "text-muted-foreground",
                    !startDate && "cursor-not-allowed opacity-50"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Selesai"}
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
          </div>
        </div>
      </div>

      <ScrollArea className={cn("pr-4", height)}>
        <div className="before:from-border before:via-border relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:to-transparent">
          {logs.length === 0 ? (
            <div className="text-muted-foreground py-10 pl-12 text-sm italic">
              Belum ada riwayat aktivitas.
            </div>
          ) : (
            logs.map((log) => {
              const style = getActionStyle(log.action);

              // Safe access: Pastikan objek ada agar tidak crash saat akses .name
              const newVals = log.new_values || {};
              const oldVals = log.old_values || {};

              // Identifier utama: Cek name, meter_code, atau fallback ke entity_id
              const displayName =
                newVals.name ||
                oldVals.name ||
                newVals.meter_code ||
                oldVals.meter_code ||
                `ID: ${log.entity_id}`;

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

                  <div className="group bg-card hover:border-primary/20 rounded-xl border p-4 transition-all hover:shadow-md">
                    <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("border-none text-[10px] font-bold uppercase", style.color)}
                        >
                          {style.label}
                        </Badge>
                        <span className="text-foreground text-sm font-bold">
                          {displayName as string}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-3 flex items-center gap-1.5 text-sm">
                      <User className="h-3.5 w-3.5" />
                      Oleh{" "}
                      <span className="text-foreground font-semibold">
                        {log.user?.full_name || "System"}
                      </span>
                      <span className="ml-1 text-[10px] tabular-nums opacity-50">
                        ({log.ip_address})
                      </span>
                    </p>

                    {/* Diff Viewer untuk UPDATE */}
                    {log.action === "UPDATE" && log.old_values && log.new_values && (
                      <div className="bg-muted/30 mt-2 overflow-hidden rounded-lg border border-dashed p-3 font-mono text-[11px]">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-[9px] font-bold tracking-wider text-red-500 uppercase">
                              Sebelumnya
                            </p>
                            <p className="text-muted-foreground truncate italic">
                              {String(oldVals.name || oldVals.status || oldVals.meter_code || "-")}
                            </p>
                          </div>
                          <div className="border-t pt-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                            <p className="mb-1 text-[9px] font-bold tracking-wider text-emerald-500 uppercase">
                              Menjadi
                            </p>
                            <p className="text-foreground truncate font-bold">
                              {String(newVals.name || newVals.status || newVals.meter_code || "-")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
