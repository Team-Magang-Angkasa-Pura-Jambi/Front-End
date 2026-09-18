"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  X,
  Gauge,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Badge } from "@/common/components/ui/badge";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { EnergyType } from "@/common/types/energy";
import { useAuthStore } from "@/stores/authStore";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import {
  downloadImportTemplateApi,
  uploadImportDataApi,
  ImportResultSummary,
} from "../services/import.service";

interface ImportMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  typesEnergies: EnergyType[];
}

export const ImportMeterModal: React.FC<ImportMeterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  typesEnergies,
}) => {
  const { user } = useAuthStore();

  const [selectedEnergyTypeId, setSelectedEnergyTypeId] = useState<number | undefined>(
    typesEnergies[0]?.energy_type_id
  );
  const [selectedMeterId, setSelectedMeterId] = useState<number | undefined>(undefined);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResultSummary | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch meters for selected energy type
  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["metersForImportModal", selectedEnergyTypeId],
    queryFn: () => getMetersApi(selectedEnergyTypeId as number),
    enabled: isOpen && !!selectedEnergyTypeId,
  });

  const meters = useMemo(() => metersResponse?.data?.meter || [], [metersResponse]);

  const selectedEnergy = useMemo(
    () => typesEnergies?.find((e) => e.energy_type_id === selectedEnergyTypeId),
    [typesEnergies, selectedEnergyTypeId]
  );

  const selectedMeter = useMemo(
    () => meters.find((m) => m.meter_id === selectedMeterId),
    [meters, selectedMeterId]
  );

  // RBAC check
  if (user?.role !== "SUPER_ADMIN") {
    return null;
  }

  const handleDownloadTemplate = async () => {
    if (!selectedEnergyTypeId) {
      toast.error("Silakan pilih jenis energi terlebih dahulu.");
      return;
    }

    try {
      setIsDownloading(true);
      const blob = await downloadImportTemplateApi(selectedEnergyTypeId, selectedMeterId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const filename = selectedMeter
        ? `Template_Import_Meter_${selectedMeter.meter_code}.xlsx`
        : `Template_Import_Utilitas_${selectedEnergy?.name || "Energy"}.xlsx`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Templat spreadsheet berhasil diunduh.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengunduh templat import.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".csv")
      ) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        toast.error("Format file harus berupa .xlsx atau .csv");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".csv")
      ) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        toast.error("Format file harus berupa .xlsx atau .csv");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedEnergyTypeId) {
      toast.error("Silakan pilih jenis energi terlebih dahulu.");
      return;
    }
    if (!selectedFile) {
      toast.error("Pilih file spreadsheet yang ingin diimpor.");
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadImportDataApi(
        selectedEnergyTypeId,
        selectedFile,
        selectedMeterId
      );
      setImportResult(res.data);

      if (res.data.failed_count === 0 && res.data.success_count > 0) {
        toast.success(`Berhasil mengimpor ${res.data.success_count} data pencatatan!`);
        if (onSuccess) onSuccess();
      } else if (res.data.success_count > 0) {
        toast.warning(
          `Impor selesai sebagian: ${res.data.success_count} berhasil, ${res.data.failed_count} gagal.`
        );
        if (onSuccess) onSuccess();
      } else {
        toast.error("Seluruh baris data gagal diimpor. Silakan periksa daftar error.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengunggah data import.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-3xl border-slate-200 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-slate-800 text-white shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                Import Data Angka Meteran
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Pengisian massal historis berbasis templat dinamis & kalkulasi otomatis Formula Engine.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Energy Type & Meter Selection Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Pilih Jenis Energi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Jenis Energi / Utilitas
              </label>
              <Select
                value={selectedEnergyTypeId?.toString()}
                onValueChange={(val) => {
                  setSelectedEnergyTypeId(Number(val));
                  setSelectedMeterId(undefined);
                  setImportResult(null);
                }}
              >
                <SelectTrigger className="w-full bg-slate-50/80 border-slate-200 h-11 font-medium text-slate-800">
                  <SelectValue placeholder="Pilih Jenis Energi" />
                </SelectTrigger>
                <SelectContent>
                  {typesEnergies?.map((energy) => (
                    <SelectItem key={energy.energy_type_id} value={energy.energy_type_id.toString()}>
                      {energy.name} ({energy.unit_standard})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Pilih Meteran Spesifik */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-600" /> 2. Pilih Meteran (Spesifik)
              </label>
              <Select
                value={selectedMeterId ? selectedMeterId.toString() : "all"}
                onValueChange={(val) => {
                  setSelectedMeterId(val === "all" ? undefined : Number(val));
                  setImportResult(null);
                }}
                disabled={isLoadingMeters || !selectedEnergyTypeId}
              >
                <SelectTrigger className="w-full bg-slate-50/80 border-slate-200 h-11 font-medium text-slate-800">
                  <SelectValue placeholder="Semua Meteran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Semua Meteran ({selectedEnergy?.name || "Energi"})
                  </SelectItem>
                  {meters.map((meter) => (
                    <SelectItem key={meter.meter_id} value={meter.meter_id.toString()}>
                      [{meter.meter_code}] {meter.name ?? meter.meter_code} ({meter.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Download Template Step */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600" /> Unduh Templat Sesuai Skema
              </h4>
              <p className="text-xs text-slate-500">
                {selectedMeter
                  ? `Templat khusus meteran "${selectedMeter.meter_code}" (${selectedMeter.category}) dengan kolom pembacaan aktif.`
                  : "Templat berisi seluruh kolom pembacaan yang berlaku untuk energi ini."}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isDownloading || !selectedEnergyTypeId}
              className="shrink-0 font-medium border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Unduh .xlsx
            </Button>
          </div>

          {/* Upload Dropzone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Unggah File Data Spreadsheet (.xlsx / .csv)
            </label>

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/40"
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-white rounded-full shadow-sm text-slate-500 border border-slate-200">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      Klik untuk memilih file
                    </span>{" "}
                    <span className="text-sm text-slate-500">atau tarik file ke sini</span>
                  </div>
                  <p className="text-xs text-slate-400">Format yang didukung: .xlsx atau .csv (Maks. 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Import Result Feedback */}
          {importResult && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Hasil Eksekusi Import
                </h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-slate-100 text-slate-700">
                    Total: {importResult.total_rows} Baris
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Sukses: {importResult.success_count}
                  </Badge>
                  {importResult.failed_count > 0 && (
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                      <XCircle className="w-3 h-3 mr-1" /> Gagal: {importResult.failed_count}
                    </Badge>
                  )}
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Laporan Detail Baris Error ({importResult.errors.length}):
                  </p>
                  <ScrollArea className="h-40 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                    <div className="space-y-1.5 text-xs">
                      {importResult.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-white border border-red-100 text-slate-800 flex items-start gap-2"
                        >
                          <Badge variant="outline" className="bg-red-50 text-red-700 shrink-0 font-mono">
                            Baris {err.row}
                          </Badge>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900">
                              [{err.meter_code || "Unknown Meter"}] {err.reading_date}
                            </span>
                            <p className="text-red-600">{err.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Tutup
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || !selectedEnergyTypeId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses Import & Formula...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> Eksekusi Import
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
