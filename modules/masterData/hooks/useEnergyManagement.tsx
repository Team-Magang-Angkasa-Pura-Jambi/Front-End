"use client";

import { ApiErrorResponse } from "@/common/types/api";
import { EnergyType } from "@/common/types/energy";
import { AxiosError } from "axios";
import { Activity, Database, Droplets, Zap } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { EnergyTypeFormValues } from "../schemas/energyType.schema";
import { useEnergyQuery } from "./useEnergyQuery";

export const useEnergyManagement = () => {
  const { useGetEnergiesWithReadings, useUpsertEnergy, useDeleteEnergy } = useEnergyQuery();

  // --- UI States ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<EnergyType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<EnergyType | null>(null);

  // --- Data Queries ---
  const { data: energyRes, isLoading } = useGetEnergiesWithReadings();
  const energyData = useMemo(() => energyRes?.data || [], [energyRes]);

  // --- Mutations ---
  const { mutate: upsertMutate, isPending: isSaving } = useUpsertEnergy(
    editingData?.energy_type_id
  );
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteEnergy();

  // --- Handlers ---
  const handleAddNew = useCallback(() => {
    setEditingData(null);
    setIsFormOpen(true);
  }, []);

  const handleEditEnergy = useCallback((energy: EnergyType) => {
    setEditingData(energy);
    setIsFormOpen(true);
  }, []);

  const handleUpsert = (formData: EnergyTypeFormValues) => {
    upsertMutate(formData, {
      onSuccess: () => {
        toast.success(editingData ? "Data diperbarui" : "Data baru ditambahkan");
        setIsFormOpen(false);
        setEditingData(null);
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        toast.error(error.response?.data?.status?.message || "Gagal menyimpan data.");
      },
    });
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutate(itemToDelete.energy_type_id, {
        onSuccess: () => {
          toast.success("Tipe energi berhasil dihapus");
          setItemToDelete(null);
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
          toast.error(error.response?.data?.status?.message || "Gagal menghapus data.");
        },
      });
    }
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("elect")) return <Zap className="h-4 w-4 fill-yellow-500/20 text-yellow-500" />;
    if (n.includes("water")) return <Droplets className="h-4 w-4 fill-blue-500/20 text-blue-500" />;
    if (n.includes("fuel"))
      return <Database className="h-4 w-4 fill-orange-500/20 text-orange-500" />;
    return <Activity className="text-primary h-4 w-4" />;
  };

  return {
    // States
    energyData,
    isLoading,
    isSaving,
    isDeleting,
    isFormOpen,
    editingData,
    itemToDelete,

    // Actions
    setIsFormOpen,
    setItemToDelete,
    handleAddNew,
    handleEditEnergy,
    handleUpsert,
    handleConfirmDelete,
    getIcon,
  };
};
