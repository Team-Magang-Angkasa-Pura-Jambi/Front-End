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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Filter,
  History,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AuditLogItem, getAuditLogsApi } from "../services/auditLog.service";

const ENTITY_OPTIONS = [
  { value: "ALL", label: "Semua Entitas Data" },
  { value: "ReadingSession", label: "⚡ Sesi Input Meter (ReadingSession)" },
  { value: "MeterReading", label: "📊 Detail Angka Meter (MeterReading)" },
  { value: "DailySummary", label: "📅 Ringkasan Harian (DailySummary)" },
  { value: "MonthlySummary", label: "🗓️ Ringkasan Bulanan (MonthlySummary)" },
  { value: "MlPrediction", label: "🤖 Prediksi AI ML (MlPrediction)" },
  { value: "PriceScheme", label: "💰 Skema Tarif Energi (PriceScheme)" },
  { value: "SchemeRate", label: "🏷️ Rincian Tarif (SchemeRate)" },
  { value: "AnnualBudget", label: "💼 Anggaran Tahunan (AnnualBudget)" },
  { value: "BudgetAllocation", label: "📈 Alokasi Anggaran (BudgetAllocation)" },
  { value: "EfficiencyTarget", label: "🎯 Target Efisiensi KPI" },
  { value: "SystemSetting", label: "⚙️ Konfigurasi Sistem & Dashboard" },
  { value: "Meter", label: "📟 Master Meteran Energi" },
  { value: "User", label: "👤 Master Pengguna (User)" },
  { value: "Role", label: "🛡️ Hak Akses (Role)" },
  { value: "Location", label: "📍 Lokasi Gedung / Ruangan" },
  { value: "Tenant", label: "🏢 Master Tenant / Penyewa" },
  { value: "PaxData", label: "👥 Data Penumpang (PAX)" },
];

export const AuditLogPage = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, __setLimit] = useState<number>(15);

  const [selectedAudit, setSelectedAudit] = useState<AuditLogItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["auditLogs", selectedEntity, selectedAction, startDate, endDate, currentPage, limit],
    queryFn: () =>
      getAuditLogsApi({
        page: currentPage,
        limit,
        entity_table: selectedEntity === "ALL" ? undefined : selectedEntity,
        action: selectedAction === "ALL" ? undefined : selectedAction,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }),
  });

  const auditItems: AuditLogItem[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 15, total_pages: 1 };

  // Client-side search filtering if keyword exists
  const filteredItems = useMemo(() => {
    if (!searchKeyword) return auditItems;
    const q = searchKeyword.toLowerCase();
    return auditItems.filter(
      (item) =>
        item.entity_table.toLowerCase().includes(q) ||
        item.entity_id.toLowerCase().includes(q) ||
        item.user?.full_name.toLowerCase().includes(q) ||
        item.user?.username.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.ip_address?.toLowerCase().includes(q)
    );
  }, [auditItems, searchKeyword]);

  const copyToClipboard = (text: string, label: string = "Data") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  const handleExportJSON = () => {
    if (filteredItems.length === 0) {
      toast.info("Tidak ada data audit untuk diekspor");
      return;
    }
    const jsonStr = JSON.stringify(filteredItems, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File riwayat audit log (JSON) berhasil diunduh");
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            CREATE
          </Badge>
        );
      case "UPDATE":
        return (
          <Badge className="border-blue-500/30 bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            UPDATE
          </Badge>
        );
      case "DELETE":
        return (
          <Badge className="border-red-500/30 bg-red-500/10 text-[10px] font-bold text-red-600 dark:text-red-400">
            DELETE
          </Badge>
        );
      case "UPSERT":
        return (
          <Badge className="border-purple-500/30 bg-purple-500/10 text-[10px] font-bold text-purple-600 dark:text-purple-400">
            UPSERT
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-bold">
            {action}
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
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Riwayat Audit Log & Integritas Data
                </h1>
                <Badge
                  variant="outline"
                  className="border-indigo-400/40 bg-indigo-500/20 text-xs font-bold text-indigo-300"
                >
                  Bahan Audit Standar Industri
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Rekaman komprehensif seluruh perubahan data, input data meteran,
                klasifikasi/prediksi AI, tarif, dan konfigurasi sistem.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="h-9 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export Audit Log (JSON)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-9 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Audit Compliance Info */}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>
              Audit Trail Dilindungi: Log tidak dapat dimodifikasi atau dihapus (Immutable Audit
              Trail).
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>
              Total Catatan Audit: <strong className="font-mono text-white">{meta.total}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-sm font-bold">Filter & Parameter Audit</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Filter 1: Entity Table */}
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-semibold uppercase">
                Tabel / Entitas
              </label>
              <Select
                value={selectedEntity}
                onValueChange={(val) => {
                  setSelectedEntity(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Entitas" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {ENTITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter 2: Action */}
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-semibold uppercase">
                Aksi Mutasi
              </label>
              <Select
                value={selectedAction}
                onValueChange={(val) => {
                  setSelectedAction(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">
                    Semua Aksi
                  </SelectItem>
                  <SelectItem value="CREATE" className="text-xs">
                    🟢 CREATE (Tambah Data)
                  </SelectItem>
                  <SelectItem value="UPDATE" className="text-xs">
                    🔵 UPDATE (Ubah Data)
                  </SelectItem>
                  <SelectItem value="DELETE" className="text-xs">
                    🔴 DELETE (Hapus Data)
                  </SelectItem>
                  <SelectItem value="UPSERT" className="text-xs">
                    🟣 UPSERT (Update/Insert)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter 3: Start Date */}
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-semibold uppercase">
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 text-xs"
              />
            </div>

            {/* Filter 4: End Date */}
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-semibold uppercase">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 text-xs"
              />
            </div>

            {/* Filter 5: Search Input */}
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-semibold uppercase">
                Cari Petugas / ID
              </label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Nama petugas, ID record..."
                  className="h-9 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AUDIT LOG TABLE CARD */}
      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            <div>
              <CardTitle className="text-base font-bold">Daftar Rekaman Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Menampilkan halaman {meta.page} dari total {meta.total_pages} halaman ({meta.total}{" "}
                catatan).
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs">
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead className="w-44">Waktu Audit</TableHead>
                <TableHead className="w-24 text-center">Aksi</TableHead>
                <TableHead className="w-48">Entitas / Tabel</TableHead>
                <TableHead className="w-28 text-center">ID Record</TableHead>
                <TableHead>Petugas (Pengubah)</TableHead>
                <TableHead className="w-36">Alamat IP</TableHead>
                <TableHead className="w-28 text-right">Aksi Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={8} className="py-4">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-16 text-center">
                    <ShieldCheck className="mx-auto mb-2 h-10 w-10 text-indigo-500 opacity-40" />
                    <p className="text-sm font-semibold">Tidak ada riwayat audit yang cocok</p>
                    <p className="mt-1 text-xs">
                      Coba sesuaikan filter entitas atau rentang tanggal.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => (
                  <TableRow
                    key={item.log_id}
                    className="hover:bg-muted/30 text-xs transition-colors"
                  >
                    <TableCell className="text-muted-foreground text-center font-mono">
                      {(meta.page - 1) * meta.limit + index + 1}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-center">{getActionBadge(item.action)}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        {item.entity_table}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        #{item.entity_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-600">
                          {item.user?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.user?.full_name || `User ID #${item.user_id}`}
                          </div>
                          {item.user?.username && (
                            <div className="text-muted-foreground font-mono text-[10px]">
                              @{item.user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-[11px]">
                      {item.ip_address || "127.0.0.1"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 border-slate-200 text-xs hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:hover:bg-indigo-950/50"
                        onClick={() => setSelectedAudit(item)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Diff
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* PAGINATION FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs dark:border-slate-800">
            <div className="text-muted-foreground">
              Total <strong>{meta.total}</strong> catatan data audit.
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={meta.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-mono text-xs font-semibold">
                Hal {meta.page} / {meta.total_pages || 1}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={meta.page >= meta.total_pages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VISUAL DIFF INSPECTOR MODAL */}
      <Dialog open={!!selectedAudit} onOpenChange={(open) => !open && setSelectedAudit(null)}>
        <DialogContent className="max-h-[95vh] overflow-y-auto" maxWidth="4xl">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              {selectedAudit && getActionBadge(selectedAudit.action)}
              <Badge className="border-indigo-500/30 bg-indigo-500/10 font-mono text-[10px] font-bold text-indigo-600">
                {selectedAudit?.entity_table} #{selectedAudit?.entity_id}
              </Badge>
              <DialogTitle className="ml-1 text-base font-bold">
                Inspeksi Diff Perubahan Data Audit
              </DialogTitle>
            </div>
            <DialogDescription className="pt-1 font-mono text-xs">
              Log ID: {selectedAudit?.log_id} | Tanggal: {selectedAudit?.created_at}
            </DialogDescription>
          </DialogHeader>

          {selectedAudit && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Petugas & Metadata Box */}
              <div className="bg-muted/40 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-3.5 sm:grid-cols-3 dark:border-slate-800">
                <div>
                  <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                    Petugas / Akun:
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedAudit.user?.full_name || `User ID #${selectedAudit.user_id}`}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                    Alamat IP Client:
                  </span>
                  <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {selectedAudit.ip_address || "127.0.0.1"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                    User Agent Client:
                  </span>
                  <p className="text-muted-foreground truncate font-mono text-[11px]">
                    {selectedAudit.user_agent || "Web Browser"}
                  </p>
                </div>
              </div>

              {/* SIDE-BY-SIDE DIFF INSPECTOR */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Left: OLD VALUES */}
                <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-700 uppercase dark:text-amber-400">
                      ◀ Nilai Sebelum Perubahan (Old Values):
                    </span>
                    {selectedAudit.old_values && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedAudit.old_values, null, 2),
                            "Old Values"
                          )
                        }
                      >
                        <Copy className="mr-1 h-3 w-3" /> Salin
                      </Button>
                    )}
                  </div>

                  {selectedAudit.old_values ? (
                    <pre className="max-h-[60vh] overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-amber-300">
                      {JSON.stringify(selectedAudit.old_values, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-muted-foreground p-8 text-center italic">
                      Tidak ada data sebelumnya (Operasi CREATE / Data Baru).
                    </div>
                  )}
                </div>

                {/* Right: NEW VALUES */}
                <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase dark:text-emerald-400">
                      ▶ Nilai Sesudah Perubahan (New Values):
                    </span>
                    {selectedAudit.new_values && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedAudit.new_values, null, 2),
                            "New Values"
                          )
                        }
                      >
                        <Copy className="mr-1 h-3 w-3" /> Salin
                      </Button>
                    )}
                  </div>

                  {selectedAudit.new_values ? (
                    <pre className="max-h-[60vh] overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-300">
                      {JSON.stringify(selectedAudit.new_values, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-muted-foreground p-8 text-center italic">
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
