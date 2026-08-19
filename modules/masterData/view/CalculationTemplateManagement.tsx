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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { CalculationTemplateForm } from "../components/organisms/calculationTemplate.form";
import { MasterDataDialog } from "../components/templates/MasterDataDialog";
import { PageHeader } from "../components/templates/PageHeader";
import { SentinelAuditLog } from "../schemas/SentinelAuditLog";
import {
  CalculationTemplate,
  createCalculationTemplateApi,
  deleteCalculationTemplateApi,
  getCalculationTemplatesApi,
  updateCalculationTemplateApi,
} from "../services/calculationTemplate.service";

export const CalculationTemplateManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CalculationTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<CalculationTemplate | null>(null);

  // Fetch list of templates
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["calculationTemplatesList"],
    queryFn: () => getCalculationTemplatesApi({ limit: 50 }),
  });

  const templates = data?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCalculationTemplateApi,
    onSuccess: () => {
      toast.success("Template rumus kalkulasi berhasil dibuat!");
      setIsFormOpen(false);
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplates"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.status?.message || "Gagal membuat template kalkulasi.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateCalculationTemplateApi(id, payload),
    onSuccess: () => {
      toast.success("Template rumus kalkulasi berhasil diperbarui!");
      setIsFormOpen(false);
      setEditingTemplate(null);
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
      toast.success("Template rumus kalkulasi berhasil dihapus!");
      setDeletingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["calculationTemplatesList"] });
      queryClient.invalidateQueries({ queryKey: ["calculationTemplates"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.status?.message || "Gagal menghapus template.");
    },
  });

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: CalculationTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
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

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-background/50 flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <PageHeader
          title="Kalkulasi & Formula Rumus"
          description="Konfigurasi rumus perhitungan pemakaian energi, pembacaan selisih meter, dan formula tangki BBM/Air."
          icon={Calculator}
          iconClassName="bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
        />

        <div className="flex items-center gap-2">
          {/* Audit Log Dialog */}
          <MasterDataDialog
            isOpen={isAuditOpen}
            onOpenChange={setIsAuditOpen}
            triggerLabel="Riwayat"
            triggerIcon={<History className="mr-1.5 h-4 w-4" />}
            triggerClassName="bg-slate-800 hover:bg-slate-900 text-white transition-colors"
            title="Audit Log Template Kalkulasi"
            description="Menampilkan jejak audit pembuatan dan modifikasi rumus kalkulasi energi."
            maxWidth="3xl"
          >
            <SentinelAuditLog
              entityTable="CalculationTemplate,FormulaDefinition"
              height="h-[65vh]"
            />
          </MasterDataDialog>

          {/* Form Create/Edit Dialog */}
          <MasterDataDialog
            isOpen={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) setEditingTemplate(null);
            }}
            triggerLabel="Tambah Rumus Baru"
            onTriggerClick={handleCreate}
            triggerIcon={<Plus className="mr-1.5 h-4 w-4" />}
            triggerClassName="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            title={
              editingTemplate
                ? `Edit Template: ${editingTemplate.name}`
                : "Buat Template Rumus Kalkulasi Baru"
            }
            description="Tentukan ekspresi matematika dan variabel bacaan sensor, parameter tangki, atau faktor kali."
            maxWidth="3xl"
          >
            <CalculationTemplateForm
              initialData={editingTemplate}
              onSubmit={handleFormSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </MasterDataDialog>
        </div>
      </div>

      {/* TEMPLATES LIST CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Cpu className="text-muted-foreground h-4 w-4" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Daftar Template Formula Aktif ({templates.length})
            </h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isFetching && "animate-spin")} />
            Segarkan
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-muted/20 text-muted-foreground space-y-3 rounded-2xl border border-dashed p-12 text-center">
            <Calculator className="mx-auto h-10 w-10 text-indigo-600 opacity-40" />
            <div className="space-y-1">
              <h4 className="text-foreground text-sm font-bold">Belum Ada Template Rumus</h4>
              <p className="text-xs">
                Klik tombol <strong>"Tambah Rumus Baru"</strong> di atas untuk membuat formula
                perhitungan energi.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {templates.map((tpl) => {
              const mainDef = tpl.definitions?.find((d) => d.is_main) || tpl.definitions?.[0];
              const meterCount = tpl._count?.meters || 0;

              return (
                <Card
                  key={tpl.template_id}
                  className="group flex flex-col justify-between rounded-2xl border-slate-200 shadow-xs transition-all hover:shadow-md dark:border-slate-800"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="flex items-center gap-2 truncate text-base font-bold text-slate-900 dark:text-slate-100">
                          <span>{tpl.name}</span>
                        </CardTitle>
                        <CardDescription className="line-clamp-1 text-xs">
                          {tpl.description || "Formula kalkulasi pembacaan data meter."}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[10px] font-semibold",
                          meterCount > 0
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Gauge className="mr-1 h-3 w-3" />
                        {meterCount} Meter Terhubung
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Main Formula Preview Box */}
                    {mainDef && (
                      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Code2 className="h-3 w-3 text-indigo-400" />
                            {mainDef.name}
                          </span>
                          {mainDef.is_main && (
                            <Badge className="bg-indigo-600 px-1 py-0 text-[9px] font-bold text-white">
                              METRIK UTAMA
                            </Badge>
                          )}
                        </div>

                        <p className="truncate text-xs font-bold text-indigo-300 select-all">
                          {mainDef.formula_items?.formula || "-"}
                        </p>

                        {/* Variables Pills */}
                        {mainDef.formula_items?.variables &&
                          mainDef.formula_items.variables.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {mainDef.formula_items.variables.map((v, vIdx) => (
                                <span
                                  key={vIdx}
                                  className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300"
                                >
                                  {v.label} ({v.type})
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Footer Info & Actions */}
                    <div className="text-muted-foreground flex items-center justify-between border-t border-slate-100 pt-1 text-xs dark:border-slate-800">
                      <div className="truncate text-[11px]">
                        {tpl.definitions?.length || 0} Sub-Rumus
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40"
                          onClick={() => handleEdit(tpl)}
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground h-7 w-7 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
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
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <AlertDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Konfirmasi Penghapusan Template Rumus
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus template rumus{" "}
              <strong className="text-foreground">{deletingTemplate?.name}</strong>? Tindakan ini
              tidak dapat dibatalkan dan akan mempengaruhi kalkulasi meteran yang terhubung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 font-bold text-white hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingTemplate) {
                  deleteMutation.mutate(deletingTemplate.template_id);
                }
              }}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Template"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
