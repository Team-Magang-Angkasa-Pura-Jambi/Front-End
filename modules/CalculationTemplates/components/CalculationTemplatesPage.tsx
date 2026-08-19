"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MasterDataDialog } from "@/modules/masterData/components/templates/MasterDataDialog";
import { SentinelAuditLog } from "@/modules/masterData/schemas/SentinelAuditLog";
import {
  CalculationTemplate,
  createCalculationTemplateApi,
  deleteCalculationTemplateApi,
  getCalculationTemplatesApi,
  updateCalculationTemplateApi,
} from "@/modules/masterData/services/calculationTemplate.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calculator,
  Code2,
  Cpu,
  Edit,
  Gauge,
  History,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormulaStudioCanvas } from "./FormulaStudioCanvas";

const fadeInDown = {
  initial: { opacity: 0, y: -15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const CalculationTemplatesPage = () => {
  const queryClient = useQueryClient();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CalculationTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<CalculationTemplate | null>(null);

  // Fetch list of templates
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["calculationTemplatesPageList"],
    queryFn: () => getCalculationTemplatesApi({ limit: 100 }),
  });

  const templates = data?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCalculationTemplateApi,
    onSuccess: () => {
      toast.success("Template formula perhitungan berhasil disimpan!");
      setIsStudioOpen(false);
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesPageList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplates"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.status?.message || "Gagal membuat formula kalkulasi.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateCalculationTemplateApi(id, payload),
    onSuccess: () => {
      toast.success("Template formula perhitungan berhasil diperbarui!");
      setIsStudioOpen(false);
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesPageList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplates"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.status?.message || "Gagal memperbarui template kalkulasi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCalculationTemplateApi,
    onSuccess: () => {
      toast.success("Template formula kalkulasi berhasil dihapus!");
      setDeletingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesPageList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplates"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.status?.message || "Gagal menghapus template.");
    },
  });

  const handleOpenCreateStudio = () => {
    setEditingTemplate(null);
    setIsStudioOpen(true);
  };

  const handleOpenEditStudio = (template: CalculationTemplate) => {
    setEditingTemplate(template);
    setIsStudioOpen(true);
  };

  const handleSaveStudio = (formData: any) => {
    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.template_id,
        payload: { template: formData },
      });
    } else {
      createMutation.mutate({
        template: formData,
      });
    }
  };

  // JIKA SEDANG DALAM MODE STUDIO (CREATE / EDIT FULL SCREEN)
  if (isStudioOpen) {
    return (
      <FormulaStudioCanvas
        initialData={editingTemplate}
        onBack={() => {
          setIsStudioOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveStudio}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER SECTION DENGAN ANIMASI DAN TEMA SENTINEL */}
      <motion.div
        className="border-border/60 bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm md:flex-row md:items-center md:justify-between"
        initial="initial"
        animate="animate"
        variants={fadeInDown}
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary border-primary/20 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-xs">
            <Calculator className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Formula & Kalkulasi Engine
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Pusat konfigurasi rumus matematika, stand selisih, profiling tangki BBM/Air, dan
              komputasi otomatis energi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audit Log Dialog */}
          <MasterDataDialog
            isOpen={isAuditOpen}
            onOpenChange={setIsAuditOpen}
            triggerLabel="Riwayat Audit"
            triggerIcon={<History className="mr-1.5 h-4 w-4" />}
            triggerClassName="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/60 transition-colors"
            title="Audit Log Formula Kalkulasi"
            description="Riwayat perubahan dan pembuatan formula matematika pada sistem."
            maxWidth="3xl"
          >
            <SentinelAuditLog
              entityTable="CalculationTemplate,FormulaDefinition"
              height="h-[65vh]"
            />
          </MasterDataDialog>

          {/* Full Screen Studio Trigger */}
          <Button
            type="button"
            className="shadow-primary/20 h-10 gap-2 px-4 font-bold shadow-md"
            onClick={handleOpenCreateStudio}
          >
            <Plus className="h-4 w-4" /> Buat Formula Baru
          </Button>
        </div>
      </motion.div>

      {/* TEMPLATES LIST */}
      <motion.div className="space-y-4" initial="initial" animate="animate" variants={fadeInUp}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Cpu className="text-primary h-4 w-4" />
            <h3 className="text-foreground text-sm font-bold">
              Daftar Formula Aktif ({templates.length})
            </h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 text-xs"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isFetching && "animate-spin")} />
            Segarkan
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-52 w-full rounded-2xl" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-card border-border/80 text-muted-foreground space-y-4 rounded-2xl border border-dashed p-16 text-center shadow-xs">
            <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
              <Calculator className="h-8 w-8" />
            </div>
            <div className="mx-auto max-w-md space-y-1">
              <h4 className="text-foreground text-base font-bold">Belum Ada Template Formula</h4>
              <p className="text-muted-foreground text-xs">
                Buat formula perhitungan konsumsi energi, volume tangki, atau selisih meter dengan
                menekan tombol di bawah.
              </p>
            </div>
            <Button
              type="button"
              className="shadow-primary/20 gap-2 font-bold shadow-md"
              onClick={handleOpenCreateStudio}
            >
              <Plus className="h-4 w-4" /> Buat Formula Baru Sekarang
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => {
              const mainDef = tpl.definitions?.find((d) => d.is_main) || tpl.definitions?.[0];
              const meterCount = tpl._count?.meters || 0;

              return (
                <Card
                  key={tpl.template_id}
                  className="border-border/60 bg-card hover:border-primary/40 group flex flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition-all hover:shadow-md"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="text-foreground group-hover:text-primary truncate text-base font-bold transition-colors">
                          {tpl.name}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground line-clamp-1 text-xs">
                          {tpl.description || "Formula kalkulasi pembacaan data meter."}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[10px] font-semibold",
                          meterCount > 0
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground border-border/50"
                        )}
                      >
                        <Gauge className="mr-1 h-3 w-3" />
                        {meterCount} Meter Terhubung
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs">
                    {/* Main Formula Preview Code Box */}
                    {mainDef && (
                      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono dark:bg-slate-950/90">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1.5 truncate">
                            <Code2 className="h-3 w-3 text-indigo-400" />
                            {mainDef.name}
                          </span>
                          {mainDef.is_main && (
                            <Badge className="bg-primary text-primary-foreground shrink-0 px-1.5 py-0 text-[9px] font-bold">
                              UTAMA
                            </Badge>
                          )}
                        </div>

                        <p className="truncate text-xs font-bold text-indigo-300 select-all dark:text-indigo-200">
                          {mainDef.formula_items?.formula || "-"}
                        </p>

                        {/* Variables Badges */}
                        {mainDef.formula_items?.variables &&
                          mainDef.formula_items.variables.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {mainDef.formula_items.variables.map((v, vIdx) => (
                                <span
                                  key={vIdx}
                                  className="rounded-md border border-slate-700 bg-slate-800/90 px-1.5 py-0.5 font-sans text-[9px] text-slate-300"
                                >
                                  {v.label} ({v.type})
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t pt-2">
                      <span className="text-[11px] font-medium">
                        {tpl.definitions?.length || 0} Sub-Kalkulasi
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10 h-7 gap-1 text-xs font-semibold"
                          onClick={() => handleOpenEditStudio(tpl)}
                        >
                          <Edit className="h-3 w-3" /> Edit Studio
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                          onClick={() => setDeletingTemplate(tpl)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* CONFIRM DELETE DIALOG */}
      <AlertDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Konfirmasi Hapus Formula
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus template formula{" "}
              <strong className="text-foreground">{deletingTemplate?.name}</strong>? Tindakan ini
              akan mempengaruhi komputasi otomatis meteran yang menggunakan template ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingTemplate) {
                  deleteMutation.mutate(deletingTemplate.template_id);
                }
              }}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Formula"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
