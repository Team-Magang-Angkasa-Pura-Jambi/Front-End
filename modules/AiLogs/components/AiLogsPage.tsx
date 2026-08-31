"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Bot, CheckCircle2, XCircle, Clock, ChevronRight, FileJson, BotIcon } from "lucide-react";

import { Card } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

import { getAiLogsApi, AiAgentLog } from "../services/aiLogs.service";
import { PageHeader } from "@/modules/masterData/components/templates/PageHeader";


export const AiLogsPage = () => {
  const [page] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AiAgentLog | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["aiLogs", page],
    queryFn: () => getAiLogsApi(page, 50),
    refetchInterval: 10000, // auto refresh every 10s
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Aktivitas AI Copilot"
        description="Riwayat eksekusi prompt AI dan response Generative Model (Gemini)."
        icon={BotIcon}
      />

      <Card className="border-border/50 bg-card/40 rounded-2xl p-5 shadow-2xs backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground border-border/50 border-b text-xs uppercase">
              <tr>
                <th className="pb-3 pr-4 font-medium">Waktu</th>
                <th className="pb-3 pr-4 font-medium">Status & Sesi</th>
                <th className="pb-3 pr-4 font-medium">Prompt</th>
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Model & Latency</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-border/30 divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 text-right"><Skeleton className="ml-auto h-6 w-16" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-rose-500">
                    Gagal memuat data log.
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Belum ada riwayat aktivitas AI.
                  </td>
                </tr>
              ) : (
                data?.data.map((log) => (
                  <tr key={log.log_id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4 text-[11px] whitespace-nowrap">
                      {format(new Date(log.created_at), "dd MMM yyyy HH:mm:ss", { locale: id })}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {log.is_success ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1 pl-1 text-[10px]">
                              <CheckCircle2 className="h-3 w-3" /> Sukses
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 gap-1 pl-1 text-[10px]">
                              <XCircle className="h-3 w-3" /> Error
                            </Badge>
                          )}
                          {log.response_json?.cached && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">
                              ⚡ Cached
                            </Badge>
                          )}
                        </div>
                        {log.session_id && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {log.session_id.substring(0, 10)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 max-w-[250px] truncate" title={log.prompt}>
                      {log.prompt}
                    </td>
                    <td className="py-3 pr-4 text-xs font-medium">
                      {log.user ? log.user.full_name || log.user.username : "System"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Badge variant="secondary" className="text-[9px] h-4 rounded-sm">{log.model_used}</Badge>
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {log.latency_ms}ms</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => setSelectedLog(log)}
                      >
                        Detail <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL DETAIL LOG */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> Detail Transaksi AI
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-xl border border-border/50 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Waktu Eksekusi</p>
                  <p className="font-medium">{format(new Date(selectedLog.created_at), "dd MMMM yyyy HH:mm:ss")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Sesi ID</p>
                  <p className="font-medium font-mono">{selectedLog.session_id || "Tidak Ada"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Model AI</p>
                  <p className="font-medium">{selectedLog.model_used}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Latency (Waktu Tunggu)</p>
                  <p className="font-medium text-amber-600">{selectedLog.latency_ms} ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Status</p>
                  <p className="flex items-center gap-2">
                    <span className={selectedLog.is_success ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                      {selectedLog.is_success ? "Berhasil" : "Gagal"}
                    </span>
                    {selectedLog.response_json?.cached && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">
                        ⚡ Cached
                      </Badge>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1.5">
                  Transkrip Percakapan
                </h4>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap">
                  {selectedLog.response_json?.full_transcript || selectedLog.prompt}
                </div>
              </div>

              {selectedLog.is_success ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1.5">
                    <FileJson className="h-3.5 w-3.5" /> Output JSON Structured
                  </h4>
                  <div className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-[11px] font-mono whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(selectedLog.response_json, null, 2)}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide text-rose-500">
                    Pesan Error
                  </h4>
                  <div className="bg-rose-950/20 text-rose-500 border border-rose-500/20 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
