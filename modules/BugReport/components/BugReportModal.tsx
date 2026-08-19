"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
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
import { UploadDropzone } from "@/lib/uploadthing";
import {
  BugCategory,
  BugSeverity,
  createBugReportApi,
} from "@/modules/BugReport/services/bugReport.service";
import { useAuthStore } from "@/stores/authStore";
import { Bug, Code2, ExternalLink, Globe, ImageIcon, Loader2, Send, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface BugReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultErrorStack?: string | null;
  defaultTitle?: string;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({
  open,
  onOpenChange,
  defaultErrorStack,
  defaultTitle,
}) => {
  const token = useAuthStore((state) => state.token);
  const pathname = usePathname();
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BugCategory>("UI_BUG");
  const [severity, setSeverity] = useState<BugSeverity>("MEDIUM");
  const [errorStack, setErrorStack] = useState(defaultErrorStack || "");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserInfo({
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        url: window.location.href,
        pathname: pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [open, pathname]);

  useEffect(() => {
    if (defaultErrorStack) setErrorStack(defaultErrorStack);
    if (defaultTitle) setTitle(defaultTitle);
  }, [defaultErrorStack, defaultTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul pengaduan bug wajib diisi.");
      return;
    }
    if (!description.trim()) {
      toast.error("Deskripsi masalah wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createBugReportApi({
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        page_url: pathname,
        browser_info: browserInfo,
        error_stack: errorStack.trim() ? errorStack.trim() : null,
        screenshot_url: screenshotUrl.trim() ? screenshotUrl.trim() : null,
      });

      toast.success("Laporan bug berhasil dikirim ke Developer!");
      setTitle("");
      setDescription("");
      setErrorStack("");
      setScreenshotUrl("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengirim laporan bug.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        maxWidth="3xl"
        className="bg-card text-card-foreground border-border/60 flex max-h-[92vh] w-[94vw] flex-col overflow-hidden p-6 sm:max-w-2xl"
      >
        <DialogHeader className="border-border/50 shrink-0 border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-2xl border border-red-500/20 bg-red-500/10 p-2.5 text-red-600 dark:text-red-400">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-red-500/30 font-mono text-[10px] text-red-600 dark:text-red-400"
                >
                  DEVELOPER BUG TRACKER
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {pathname}
                </Badge>
              </div>
              <DialogTitle className="text-foreground mt-0.5 text-base font-bold">
                Pengaduan Bug & Error ke Developer
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Laporan Anda akan otomatis tercatat ke server log dan ditinjau langsung oleh tim
                pengembang.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-130px)] flex-1 space-y-4 overflow-y-auto pt-3 pr-2 text-xs"
        >
          {/* Baris Kategori & Tingkat Urgensi */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-bold">Kategori Masalah</Label>
              <Select value={category} onValueChange={(val: BugCategory) => setCategory(val)}>
                <SelectTrigger className="bg-background border-border/60 h-9 text-xs">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UI_BUG">🎨 Tampilan / UI Error / Layout Rusak</SelectItem>
                  <SelectItem value="CALCULATION_ERROR">
                    🧮 Kesalahan Rumus / Hasil Kalkulasi
                  </SelectItem>
                  <SelectItem value="API_FAILURE">⚡ Gagal Simpan / Request API Error</SelectItem>
                  <SelectItem value="DATA_MISMATCH">
                    📊 Data Tidak Sesuai / Selisih Stand
                  </SelectItem>
                  <SelectItem value="PERFORMANCE">⏱️ Sistem Lambat / Loading Lama</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">
                    ✨ Usulan Fitur Baru / Peningkatan
                  </SelectItem>
                  <SelectItem value="OTHER">❓ Masalah Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-bold">
                Tingkat Urgensi (Severity)
              </Label>
              <Select value={severity} onValueChange={(val: BugSeverity) => setSeverity(val)}>
                <SelectTrigger className="bg-background border-border/60 h-9 text-xs">
                  <SelectValue placeholder="Pilih Urgensi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">🟢 Low (Gangguan Kecil / Tidak Urgent)</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium (Fungsi Terganggu Sebagian)</SelectItem>
                  <SelectItem value="HIGH">🟠 High (Fungsi Utama Gagal Digunakan)</SelectItem>
                  <SelectItem value="CRITICAL">
                    🔴 Critical (Sistem Crash / Data Corrupt)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Judul Pengaduan */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs font-bold">
              Judul Masalah <span className="text-red-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tombol simpan data meter gagal merespons saat input solar..."
              className="bg-background border-border/60 h-9 text-xs font-medium"
              required
            />
          </div>

          {/* Deskripsi & Langkah Reproduksi */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs font-bold">
              Deskripsi Masalah & Langkah Kejadian <span className="text-red-500">*</span>
            </Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan apa yang Anda lakukan sebelum error muncul, hasil yang diharapkan vs hasil yang sebenarnya..."
              className="bg-background border-border/60 text-xs leading-relaxed"
              required
            />
          </div>

          {/* Error Stack Trace (Opsional / Terisi Otomatis Jika Terjadi Crash) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                <Code2 className="h-3.5 w-3.5 text-red-500" />
                Pesan Error / Console Log (Opsional)
              </Label>
              <span className="text-muted-foreground text-[10px]">
                Jika ada kode error dari browser
              </span>
            </div>
            <Textarea
              rows={2}
              value={errorStack}
              onChange={(e) => setErrorStack(e.target.value)}
              placeholder="Contoh: TypeError: Cannot read properties of undefined..."
              className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] text-red-300"
            />
          </div>

          {/* TANGKAPAN LAYAR / SCREENSHOT UPLOADTHING INTEGRATION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                <ImageIcon className="text-primary h-3.5 w-3.5" />
                Lampiran Tangkapan Layar (Screenshot)
              </Label>
              <span className="text-muted-foreground text-[10px]">
                UploadThing Cloud (Maks. 4MB)
              </span>
            </div>

            {screenshotUrl ? (
              <div className="border-border/80 bg-muted/30 relative space-y-2 rounded-2xl border p-3">
                <div className="group border-border/60 relative flex max-h-[220px] items-center justify-center overflow-hidden rounded-xl border bg-black/5">
                  <img
                    src={screenshotUrl}
                    alt="Screenshot Bug"
                    className="max-h-[200px] w-auto rounded-lg object-contain shadow-sm"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 gap-1 text-xs font-bold shadow-md"
                      onClick={() => window.open(screenshotUrl, "_blank")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Buka Full
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-7 gap-1 text-xs font-bold shadow-md"
                      onClick={() => setScreenshotUrl("")}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </Button>
                  </div>
                </div>

                <div className="text-muted-foreground flex items-center justify-between px-1 font-mono text-[10px]">
                  <span className="max-w-[300px] truncate">{screenshotUrl}</span>
                  <button
                    type="button"
                    onClick={() => setScreenshotUrl("")}
                    className="font-bold text-red-500 hover:underline"
                  >
                    Ganti Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-border/80 bg-muted/20 hover:bg-muted/30 rounded-2xl border-2 border-dashed p-4 transition-all">
                <UploadDropzone
                  endpoint="imageUploader"
                  headers={{
                    Authorization: `Bearer ${token}`,
                  }}
                  appearance={{
                    container: "border-none p-0",
                    button:
                      "bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-xl hover:bg-primary/90 h-8",
                    label: "text-xs font-medium text-muted-foreground hover:text-foreground",
                    allowedContent: "text-[10px] text-muted-foreground mt-0.5",
                  }}
                  content={{
                    label: "Tarik & Lepas screenshot bug ke sini, atau klik untuk memilih file",
                    allowedContent: "Gambar PNG, JPG, JPEG hingga 4MB",
                    button: ({ isUploading }) =>
                      isUploading ? "Mengunggah..." : "Pilih File Gambar",
                  }}
                  onClientUploadComplete={(res: any) => {
                    const uploadedUrl = res?.[0]?.ufsUrl || res?.[0]?.url;
                    if (uploadedUrl) {
                      setScreenshotUrl(uploadedUrl);
                      toast.success("Tangkapan layar berhasil diunggah via UploadThing!");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Gagal upload screenshot: ${error.message}`);
                    console.error("UploadThing Bug Screenshot Error:", error);
                  }}
                />

                {/* Alternatif input URL langsung */}
                <div className="border-border/40 mt-3 flex items-center gap-2 border-t pt-3">
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    Atau masukkan URL gambar:
                  </span>
                  <Input
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-background border-border/60 h-7 font-mono text-[11px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Metadata Otomatis Terlampir */}
          <div className="border-border/60 bg-muted/40 space-y-1.5 rounded-xl border p-3">
            <span className="text-foreground flex items-center gap-1.5 text-[11px] font-bold">
              <Globe className="text-primary h-3.5 w-3.5" />
              Informasi Lingkungan yang Otomatis Dilampirkan:
            </span>
            <div className="text-muted-foreground grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div>
                📍 Halaman: <strong className="text-foreground">{pathname}</strong>
              </div>
              <div>
                🖥️ Resolusi:{" "}
                <strong className="text-foreground">
                  {browserInfo?.screenWidth}x{browserInfo?.screenHeight}
                </strong>
              </div>
            </div>
          </div>

          <DialogFooter className="border-border/50 flex items-center justify-between gap-2 border-t pt-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 gap-1.5 bg-red-600 text-xs font-bold text-white shadow-sm hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mengirim Laporan...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Kirim ke Developer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
