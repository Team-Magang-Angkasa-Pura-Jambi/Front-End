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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BugCategory,
  BugReportItem,
  BugSeverity,
  BugStatus,
  deleteBugReportApi,
  getBugReportsApi,
  updateBugReportStatusApi,
} from "@/modules/BugReport/services/bugReport.service";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  Loader2,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export const BugReportManagementPage = () => {
  const [reports, setReports] = useState<BugReportItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 10, total: 0, total_pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // Inspector Modal State
  const [selectedReport, setSelectedReport] = useState<BugReportItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<BugStatus>("OPEN");
  const [devResponse, setDevResponse] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await getBugReportsApi({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        severity: severityFilter !== "ALL" ? severityFilter : undefined,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      });

      setReports(res.data || []);
      setMeta(res.meta);
      if (res.meta?.summary) {
        setSummary(res.meta.summary);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memuat log pengaduan bug.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter, severityFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleOpenInspector = (report: BugReportItem) => {
    setSelectedReport(report);
    setUpdatingStatus(report.status);
    setDevResponse(report.developer_response || "");
    setIsInspectorOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedReport) return;
    try {
      setIsSavingStatus(true);
      const __updated = await updateBugReportStatusApi(selectedReport.report_id, {
        status: updatingStatus,
        developer_response: devResponse.trim() ? devResponse.trim() : null,
      });

      toast.success(`Status laporan diperbarui ke ${updatingStatus}!`);
      setIsInspectorOpen(false);
      fetchReports();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui status laporan.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deleteBugReportApi(deletingId);
      toast.success("Laporan bug berhasil dihapus.");
      setDeletingId(null);
      fetchReports();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus laporan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  const getSeverityBadge = (sev: BugSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <Badge className="border-red-500/30 bg-red-500/15 font-bold text-red-600 dark:text-red-400">
            🔴 CRITICAL
          </Badge>
        );
      case "HIGH":
        return (
          <Badge className="border-amber-500/30 bg-amber-500/15 font-bold text-amber-600 dark:text-amber-400">
            🟠 HIGH
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="border-yellow-500/30 bg-yellow-500/15 font-bold text-yellow-600 dark:text-yellow-400">
            🟡 MEDIUM
          </Badge>
        );
      case "LOW":
      default:
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400">
            🟢 LOW
          </Badge>
        );
    }
  };

  const getStatusBadge = (st: BugStatus) => {
    switch (st) {
      case "OPEN":
        return (
          <Badge className="border-blue-500/30 bg-blue-500/15 font-bold text-blue-600 dark:text-blue-400">
            BARU (OPEN)
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="border-purple-500/30 bg-purple-500/15 font-bold text-purple-600 dark:text-purple-400">
            SEDANG DIPERBAIKI
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400">
            SELESAI (RESOLVED)
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="border-slate-500/30 bg-slate-500/15 font-bold text-slate-600 dark:text-slate-400">
            DITOLAK
          </Badge>
        );
    }
  };

  const getCategoryLabel = (cat: BugCategory) => {
    switch (cat) {
      case "UI_BUG":
        return "🎨 Tampilan / Layout";
      case "CALCULATION_ERROR":
        return "🧮 Rumus / Kalkulasi";
      case "API_FAILURE":
        return "⚡ Request / API Error";
      case "DATA_MISMATCH":
        return "📊 Selisih Stand Data";
      case "PERFORMANCE":
        return "⏱️ Performa / Lemot";
      case "FEATURE_REQUEST":
        return "✨ Usulan Fitur Baru";
      case "OTHER":
      default:
        return "❓ Masalah Lain";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* HEADER BAR */}
      <div className="border-border/60 bg-card flex flex-col gap-4 rounded-3xl border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-600 dark:text-red-400">
              <Bug className="h-5 w-5" />
            </div>
            <Badge
              variant="outline"
              className="border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400"
            >
              LOG PENGADUAN DEVELOPER
            </Badge>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Laporan Bug & Pengaduan Error
          </h1>
          <p className="text-muted-foreground text-xs">
            Pusat penanganan bug, pelacakan kendala teknis, dan catatan resolusi tim pengembang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={isLoading}
            className="border-border/60 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Segarkan
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border/60 gap-1.5 text-xs font-bold"
          >
            <Link href="/server-monitoring">
              <Activity className="text-primary h-3.5 w-3.5" />
              Monitoring Server
            </Link>
          </Button>
        </div>
      </div>

      {/* STATS METRIC CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border/60 bg-card space-y-1 rounded-2xl p-4 shadow-xs">
          <span className="text-muted-foreground flex items-center justify-between text-[11px] font-bold">
            <span>TOTAL LAPORAN</span>
            <Bug className="text-primary h-4 w-4 opacity-60" />
          </span>
          <p className="text-foreground text-2xl font-black">
            {summary?.total_all ?? meta?.total ?? 0}
          </p>
          <span className="text-muted-foreground text-[10px]">Seluruh masukan user</span>
        </Card>

        <Card className="border-border/60 bg-card space-y-1 rounded-2xl border-l-4 border-l-blue-500 p-4 shadow-xs">
          <span className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
            <span>BARU MASUK (OPEN)</span>
            <AlertCircle className="h-4 w-4 opacity-60" />
          </span>
          <p className="text-foreground text-2xl font-black">{summary?.OPEN ?? 0}</p>
          <span className="text-muted-foreground text-[10px]">Menunggu ditinjau developer</span>
        </Card>

        <Card className="border-border/60 bg-card space-y-1 rounded-2xl border-l-4 border-l-purple-500 p-4 shadow-xs">
          <span className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
            <span>SEDANG DIPERBAIKI</span>
            <Clock className="h-4 w-4 opacity-60" />
          </span>
          <p className="text-foreground text-2xl font-black">{summary?.IN_PROGRESS ?? 0}</p>
          <span className="text-muted-foreground text-[10px]">Proses patch / investigasi</span>
        </Card>

        <Card className="border-border/60 bg-card space-y-1 rounded-2xl border-l-4 border-l-emerald-500 p-4 shadow-xs">
          <span className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span>SELESAI (RESOLVED)</span>
            <CheckCircle2 className="h-4 w-4 opacity-60" />
          </span>
          <p className="text-foreground text-2xl font-black">{summary?.RESOLVED ?? 0}</p>
          <span className="text-muted-foreground text-[10px]">Bug telah tuntas diperbaiki</span>
        </Card>
      </div>

      {/* FILTER TOOLBAR */}
      <Card className="border-border/60 bg-card rounded-2xl p-4 shadow-xs">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col items-center justify-between gap-3 md:flex-row"
        >
          <div className="relative w-full flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, kata kunci deskripsi, URL halaman, atau nama pelapor..."
              className="bg-background border-border/60 h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-background border-border/60 h-9 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="OPEN">Baru (Open)</SelectItem>
                <SelectItem value="IN_PROGRESS">Sedang Dikerjakan</SelectItem>
                <SelectItem value="RESOLVED">Selesai</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select
              value={severityFilter}
              onValueChange={(v) => {
                setSeverityFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-background border-border/60 h-9 w-[130px] text-xs">
                <SelectValue placeholder="Urgensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Urgensi</SelectItem>
                <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                <SelectItem value="HIGH">🟠 High</SelectItem>
                <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                <SelectItem value="LOW">🟢 Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-background border-border/60 h-9 w-[140px] text-xs">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kategori</SelectItem>
                <SelectItem value="UI_BUG">🎨 Tampilan</SelectItem>
                <SelectItem value="CALCULATION_ERROR">🧮 Rumus</SelectItem>
                <SelectItem value="API_FAILURE">⚡ API Error</SelectItem>
                <SelectItem value="DATA_MISMATCH">📊 Data Selisih</SelectItem>
                <SelectItem value="PERFORMANCE">⏱️ Performa</SelectItem>
                <SelectItem value="FEATURE_REQUEST">✨ Usulan Fitur</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground h-9 gap-1 text-xs font-bold"
            >
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* BUG REPORTS LIST */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 p-12 text-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="text-xs">Memuat daftar laporan bug...</span>
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-border/80 bg-card text-muted-foreground space-y-3 rounded-2xl border-dashed p-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 opacity-60" />
            <div className="space-y-1">
              <h4 className="text-foreground text-base font-bold">Tidak Ada Laporan Bug</h4>
              <p className="text-xs">
                Tidak ada laporan bug yang cocok dengan kriteria filter saat ini.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="border-border/60 bg-card hover:border-primary/40 space-y-3 rounded-2xl border p-4 shadow-xs transition-all"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(report.severity)}
                    {getStatusBadge(report.status)}
                    <Badge variant="outline" className="border-border font-mono text-[10px]">
                      {getCategoryLabel(report.category)}
                    </Badge>
                    {report.page_url && (
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        📍 {report.page_url}
                      </Badge>
                    )}
                  </div>

                  <span className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(report.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                {/* Judul & Deskripsi */}
                <div className="space-y-1">
                  <h3 className="text-foreground text-sm leading-snug font-bold">{report.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Developer Response Banner (Jika Ada) */}
                {report.developer_response && (
                  <div className="space-y-1 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-2.5 text-xs">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="h-3 w-3" /> Tanggapan / Resolusi Developer:
                    </span>
                    <p className="text-muted-foreground text-[11px]">{report.developer_response}</p>
                  </div>
                )}

                {/* Footer Bar: Reporter info & Action Buttons */}
                <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-t pt-2 text-xs">
                  <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                    <User className="text-primary h-3.5 w-3.5" />
                    <span>
                      Dilaporkan oleh:{" "}
                      <strong className="text-foreground">
                        {report.reporter?.username || "Pengguna"}
                      </strong>{" "}
                      ({report.reporter?.role?.role_name || "USER"})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInspector(report)}
                      className="border-border/60 hover:bg-primary/10 hover:text-primary h-7 gap-1 text-xs font-bold"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspeksi & Tanggapi
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(report.report_id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {meta?.total_pages > 1 && (
              <div className="text-muted-foreground flex items-center justify-between pt-2 text-xs">
                <span>
                  Halaman {meta.page} dari {meta.total_pages} ({meta.total} Laporan)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-border/60 h-8 gap-1 text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-border/60 h-8 gap-1 text-xs"
                  >
                    Selanjutnya <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INSPECTOR & DEVELOPER RESPONSE MODAL */}
      <Dialog open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
        <DialogContent
          maxWidth="4xl"
          className="bg-card text-card-foreground border-border/60 flex max-h-[92vh] w-[96vw] flex-col overflow-hidden p-6 sm:max-w-4xl"
        >
          {selectedReport && (
            <>
              <DialogHeader className="border-border/50 shrink-0 border-b pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-2xl border border-red-500/20 bg-red-500/10 p-2.5 text-red-600 dark:text-red-400">
                      <Bug className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(selectedReport.severity)}
                        <Badge variant="outline" className="font-mono text-[10px]">
                          ID: #{selectedReport.report_id.slice(0, 8)}
                        </Badge>
                      </div>
                      <DialogTitle className="text-foreground mt-0.5 text-base font-bold">
                        {selectedReport.title}
                      </DialogTitle>
                    </div>
                  </div>

                  <span className="text-muted-foreground font-mono text-xs">
                    {new Date(selectedReport.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
              </DialogHeader>

              <div className="max-h-[calc(92vh-140px)] flex-1 space-y-4 overflow-y-auto pt-3 pr-2 text-xs">
                {/* Info Pelapor & URL */}
                <div className="border-border/60 bg-muted/30 grid grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-[11px] font-bold">
                      Pelapor:
                    </span>
                    <p className="text-foreground font-bold">
                      {selectedReport.reporter?.username} ({selectedReport.reporter?.email})
                    </p>
                    <span className="text-primary font-mono text-[10px]">
                      Role: {selectedReport.reporter?.role?.role_name || "USER"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-[11px] font-bold">
                      Halaman Kejadian:
                    </span>
                    <p className="text-foreground font-mono font-bold">
                      {selectedReport.page_url || "-"}
                    </p>
                    {selectedReport.page_url && (
                      <Link
                        href={selectedReport.page_url}
                        target="_blank"
                        className="text-primary flex items-center gap-1 text-[10px] font-semibold hover:underline"
                      >
                        Buka Halaman <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Deskripsi Masalah */}
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs font-bold">
                    Deskripsi Kejadian & Reproduksi:
                  </Label>
                  <div className="border-border/60 bg-card text-foreground rounded-xl border p-3 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.description}
                  </div>
                </div>

                {/* Error Stack Trace (Jika Ada) */}
                {selectedReport.error_stack && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                        <Code2 className="h-3.5 w-3.5" />
                        Captured Error Stack Trace:
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-primary h-6 gap-1 text-[10px]"
                        onClick={() => copyToClipboard(selectedReport.error_stack!, "Stack Trace")}
                      >
                        <Copy className="h-3 w-3" /> Salin Stack
                      </Button>
                    </div>
                    <pre className="max-h-[160px] overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[10px] text-red-300">
                      {selectedReport.error_stack}
                    </pre>
                  </div>
                )}

                {/* Screenshot URL & Image Preview */}
                {selectedReport.screenshot_url && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground text-xs font-bold">
                        Lampiran Tangkapan Layar (Screenshot):
                      </Label>
                      <a
                        href={selectedReport.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
                      >
                        Buka Gambar Ukuran Penuh <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="group border-border/80 relative flex max-h-[320px] items-center justify-center overflow-hidden rounded-2xl border bg-black/5 p-2">
                      <img
                        src={selectedReport.screenshot_url}
                        alt="Screenshot Bug"
                        className="max-h-[300px] w-auto cursor-pointer rounded-xl object-contain shadow-sm"
                        onClick={() => window.open(selectedReport.screenshot_url!, "_blank")}
                      />
                    </div>
                  </div>
                )}

                {/* Browser Metadata */}
                {selectedReport.browser_info && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold">
                        <Globe className="h-3.5 w-3.5" />
                        Browser & Hardware Metadata:
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-primary h-6 gap-1 text-[10px]"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedReport.browser_info, null, 2),
                            "Metadata"
                          )
                        }
                      >
                        <Copy className="h-3 w-3" /> Salin JSON
                      </Button>
                    </div>
                    <pre className="bg-muted/40 text-muted-foreground border-border/50 overflow-x-auto rounded-xl border p-2.5 font-mono text-[10px]">
                      {JSON.stringify(selectedReport.browser_info, null, 2)}
                    </pre>
                  </div>
                )}

                {/* FORM TANGGAPAN DEVELOPER & UBAH STATUS */}
                <div className="border-border/50 bg-primary/5 border-primary/20 space-y-3 rounded-2xl border border-t p-4 pt-3">
                  <span className="text-primary flex items-center gap-1.5 text-xs font-bold">
                    <MessageSquare className="h-4 w-4" />
                    Tindak Lanjut & Tanggapan Tim Developer:
                  </span>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-foreground text-xs font-bold">
                        Ubah Status Laporan
                      </Label>
                      <Select
                        value={updatingStatus}
                        onValueChange={(v: BugStatus) => setUpdatingStatus(v)}
                      >
                        <SelectTrigger className="bg-background border-border/60 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">🔵 Baru (Open)</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            🟣 Sedang Diperbaiki (In Progress)
                          </SelectItem>
                          <SelectItem value="RESOLVED">🟢 Selesai (Resolved)</SelectItem>
                          <SelectItem value="REJECTED">⚪ Ditolak (Rejected)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-foreground text-xs font-bold">
                        Catatan / Solusi Developer
                      </Label>
                      <Textarea
                        rows={3}
                        value={devResponse}
                        onChange={(e) => setDevResponse(e.target.value)}
                        placeholder="Tuliskan catatan perbaikan, nomor commit, atau panduan alternatif untuk pelapor..."
                        className="bg-background border-border/60 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-border/50 flex items-center justify-between gap-2 border-t pt-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInspectorOpen(false)}
                  disabled={isSavingStatus}
                  className="h-8 text-xs"
                >
                  Tutup
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveStatus}
                  disabled={isSavingStatus}
                  className="bg-primary text-primary-foreground h-8 gap-1.5 text-xs font-bold shadow-sm"
                >
                  {isSavingStatus ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Simpan Status & Tanggapan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent maxWidth="sm" className="bg-card text-card-foreground border-border/60">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-base font-bold">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Hapus Laporan
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Apakah Anda yakin ingin menghapus laporan bug ini? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingId(null)}
              disabled={isDeleting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1 text-xs font-bold"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Hapus Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
