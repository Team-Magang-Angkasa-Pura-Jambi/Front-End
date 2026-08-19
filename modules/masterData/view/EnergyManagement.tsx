"use client";

import {
  AlertTriangle,
  Edit3,
  GaugeCircle,
  History,
  Info,
  MonitorDot,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { SentinelAuditLog } from "../schemas/SentinelAuditLog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/common/components/ui/accordion";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { LoadingSkeleton } from "../components/molecules/LoadingSkeleton";
import { EnergyTypeForm } from "../components/organisms/energyType.form";
import { ReadingTypeForm } from "../components/organisms/readingType.form";
import { MasterDataDialog } from "../components/templates/MasterDataDialog";
import { useEnergyManagement } from "../hooks/useEnergyManagement";
import { ApiErrorResponse } from "../hooks/useResource";
import { deleteReadingTypeApi } from "../services/readingsType.service";
import { EnergyType } from "../types";

// ============================================================================
// 1. TYPE DEFINITIONS (PRO-DEV PRACTICE)
// Pastikan tipe ini ada di "../types" Anda. Jika belum, deklarasikan seperti ini:
// ============================================================================
export interface MeterConfig {
  meter?: {
    name: string;
    meter_code: string;
  };
}

export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  unit: string;
  meter_configs?: MeterConfig[];
}

// Tipe khusus untuk state penghapusan agar propertinya ketat (strict)
interface ReadingToDelete {
  id: number;
  name: string;
}

export const UnifiedEnergyManagement = () => {
  const queryClient = useQueryClient();

  // 1. Hook Induk (Energy Management)
  const {
    energyData,
    isLoading,
    isSaving,
    isDeleting: isDeletingEnergy, // Re-name agar tidak bingung dengan loading delete reading type
    isFormOpen,
    editingData,
    itemToDelete,
    setIsFormOpen,
    setItemToDelete,
    handleAddNew,
    handleEditEnergy,
    handleUpsert,
    handleConfirmDelete,
    getIcon,
  } = useEnergyManagement();

  // 2. State Lokal dengan Typing yang Ketat
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isReadingFormOpen, setIsReadingFormOpen] = useState<boolean>(false);
  const [readingToDelete, setReadingToDelete] = useState<ReadingToDelete | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyType | null>(null);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);

  // 3. Handlers untuk Reading Type (Menggunakan tipe objek yang tepat)
  const   handleAddReadingType = (energy: EnergyType) => {
    setSelectedEnergy(energy);
    setSelectedReadingType(null); // Mode Create
    setIsReadingFormOpen(true);
  };

  const handleEditReadingType = (readingType: ReadingType, energy: EnergyType) => {
    setSelectedEnergy(energy);
    setSelectedReadingType(readingType); // Mode Edit
    setIsReadingFormOpen(true);
  };

  const handleDeleteReadingType = (readingTypeId: number, typeName: string) => {
    setReadingToDelete({ id: readingTypeId, name: typeName });
  };

  // 4. Mutasi Delete dengan Destructuring isPending
  const { mutate: deleteReadingType, isPending: isDeletingReadingType } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (typeReadingId: number) => deleteReadingTypeApi(typeReadingId),
    onSuccess: () => {
      toast.success("Parameter berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
      setReadingToDelete(null); // Tutup modal otomatis saat sukses
    },
    onError: (error) => {
      toast.error("Terjadi Kesalahan", {
        description: error?.response?.data?.message || "Gagal menghapus data.",
      });
    },
  });

  // Handler konfirmasi delete tidak perlu parameter, langsung ambil dari state.
  // Ini menghindari error TS: argumen "number | undefined" saat dipanggil di JSX.
  const confirmDeleteReadingType = () => {
    if (!readingToDelete) return;
    deleteReadingType(readingToDelete.id);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <>
      <Card className="bg-background/50 border-none shadow-sm">
        <CardHeader className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Konfigurasi Parameter Energi
            </CardTitle>
            <CardDescription className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
              <Info className="h-3.5 w-3.5" />
              Kelola tipe energi utama dan parameter bacaan sensor.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <MasterDataDialog
              isOpen={isAuditOpen}
              onOpenChange={setIsAuditOpen}
              triggerLabel="Riwayat"
              triggerIcon={<History className="mr-1.5 h-4 w-4" />}
              triggerClassName="bg-slate-800 hover:bg-slate-900 text-white transition-colors"
              title="Audit Log Parameter Energi"
              description="Menampilkan jejak audit perubahan konfigurasi pada Tipe Energi & Parameter Bacaan."
              maxWidth="3xl"
            >
              <SentinelAuditLog entityTable="EnergyType,ReadingType" height="h-[65vh]" />
            </MasterDataDialog>

            <MasterDataDialog
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
              onTriggerClick={handleAddNew}
              triggerLabel="Tipe Baru"
              title={
                editingData ? `Edit Konfigurasi ${editingData.name}` : "Registrasi Tipe Energi Baru"
              }
              description="Sesuaikan nama energi, unit standar, dan daftar parameter bacaan."
              maxWidth="2xl"
            >
              <EnergyTypeForm
                initialData={editingData}
                onSubmit={handleUpsert}
                isLoading={isSaving}
              />
            </MasterDataDialog>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Accordion type="multiple" className="space-y-4">
            {energyData.map((energy) => (
              <AccordionItem
                key={energy.energy_type_id}
                value={`energy-${energy.energy_type_id}`}
                className="bg-card hover:border-primary/30 overflow-hidden rounded-2xl border shadow-sm transition-all"
              >
                <AccordionTrigger className="group p-5 hover:no-underline">
                  <div className="flex items-center gap-5 text-left">
                    <div className="border-border/50 bg-muted/50 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105">
                      {getIcon(energy.name)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{energy.name}</span>
                        <Badge
                          variant="secondary"
                          className="border-primary/20 bg-primary/5 text-primary h-5 px-2 py-0 font-mono text-[10px]"
                        >
                          {energy.unit_standard}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                        {energy.reading_types?.length || 0} Parameter Terintegrasi
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pt-2 pb-6">
                  <div className="ml-0 space-y-4">
                    <div className="flex items-center justify-between border-b border-dashed pb-2">
                      <h4 className="text-muted-foreground/70 text-[10px] font-black tracking-[0.2em] uppercase">
                        Reading Types & Meter Terkait
                      </h4>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEditEnergy(energy)}
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/5 h-7 text-[10px] font-bold"
                        >
                          <Settings2 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button
                          onClick={() => setItemToDelete(energy)}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] font-bold text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="mr-1 h-3 w-3" /> Hapus
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {energy.reading_types?.map((param) => (
                        <div
                          key={param.reading_type_id}
                          className="group bg-muted/20 hover:border-border hover:bg-muted/40 flex flex-col gap-3 rounded-xl border border-transparent p-4 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GaugeCircle className="text-muted-foreground/60 h-4 w-4" />
                              <span className="text-foreground/80 text-sm font-bold">
                                {param.type_name}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-muted-foreground/20 text-muted-foreground h-4 px-1.5 font-mono text-[9px]"
                              >
                                {param.unit}
                              </Badge>
                            </div>

                            <div className="flex transform gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                              <Button
                                onClick={() => handleEditReadingType(param, energy)}
                                variant="ghost"
                                size="icon"
                                className="hover:border-border hover:bg-background h-8 w-8 rounded-full border border-transparent"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDeleteReadingType(param.reading_type_id, param.type_name)
                                }
                                variant="ghost"
                                size="icon"
                                className="hover:border-border hover:bg-background h-8 w-8 rounded-full border border-transparent"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {param.meter_configs && param.meter_configs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {param.meter_configs.map((config, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-background/50 text-muted-foreground hover:bg-background flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] transition-colors"
                                >
                                  <MonitorDot className="h-2.5 w-2.5 text-emerald-500" />
                                  <span className="font-medium">{config.meter?.name || "N/A"}</span>
                                  <span className="opacity-50">
                                    ({config.meter?.meter_code || "N/A"})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        onClick={() => handleAddReadingType(energy)}
                        size="lg"
                        className="group hover:bg-muted/50 flex justify-start gap-3"
                      >
                        <div className="bg-muted-foreground/10 group-hover:bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full transition-colors">
                          <Plus className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all duration-300 group-hover:rotate-90" />
                        </div>
                        <span className="text-muted-foreground group-hover:text-primary text-xs font-semibold tracking-wide transition-colors">
                          Tambah Parameter Baru
                        </span>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* MODAL: FORM READING TYPE */}
      <Dialog open={isReadingFormOpen} onOpenChange={setIsReadingFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReadingType
                ? `Edit Parameter: ${selectedReadingType.type_name}`
                : "Registrasi Parameter Baru"}
            </DialogTitle>
            <DialogDescription>
              Kelola tipe pembacaan untuk energi {selectedEnergy?.name || ""}.
            </DialogDescription>
          </DialogHeader>

          {selectedEnergy && (
            <ReadingTypeForm
              energyId={selectedEnergy.energy_type_id}
              readingTypeId={selectedReadingType?.reading_type_id}
              onSuccessCallback={() => setIsReadingFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: HAPUS ENERGY TYPE */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Hapus Tipe Energi?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm">
              Menghapus <strong>{itemToDelete?.name}</strong> akan menghapus seluruh parameter
              bacaan di dalamnya. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingEnergy}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeletingEnergy}
            >
              {isDeletingEnergy ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL: HAPUS READING TYPE */}
      <AlertDialog
        open={!!readingToDelete}
        onOpenChange={(open) => !open && setReadingToDelete(null)}
      >
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Hapus Parameter Bacaan?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm">
              Menghapus parameter <strong>{readingToDelete?.name}</strong>. Aksi ini tidak dapat
              dibatalkan dan akan gagal jika parameter ini masih terikat pada konfigurasi meteran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingReadingType}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteReadingType();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeletingReadingType} // Loading state milik ReadingType
            >
              {isDeletingReadingType ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
