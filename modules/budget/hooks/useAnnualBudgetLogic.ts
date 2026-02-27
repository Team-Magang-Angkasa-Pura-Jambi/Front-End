"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AnnualBudget } from "@/common/types/budget";
import {
  annualBudgetApi,
  getAnnualBudgetApi,
  yearOptionsApi,
} from "@/modules/budget/services/annualBudget.service";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";

export const useAnnualBudgetLogic = () => {
  const queryClient = useQueryClient();

  // State Filter
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedEnergyType, setSelectedEnergyType] = useState<string>("all");

  const handleApiError = (err: unknown, defaultMsg: string) => {
    const error = err as AxiosError<{ message: string }>;
    const message = error.response?.data.message || defaultMsg;
    toast.error(message);
  };

  // 1. Fetch Pilihan Tahun - Set staleTime Infinity karena data ini jarang berubah
  const { data: yearsRes, isLoading: isLoadingYears } = useQuery({
    queryKey: ["meta", "fiscal-years"],
    queryFn: yearOptionsApi,
    staleTime: Infinity, // Tidak akan fetch ulang selama aplikasi running
    gcTime: 1000 * 60 * 60, // Simpan di cache 1 jam
  });

  // 2. Fetch Tipe Energi - Set staleTime Infinity
  const { data: energyRes, isLoading: isLoadingEnergyTypes } = useQuery({
    queryKey: ["master", "energy-types"],
    queryFn: () => getEnergyTypesApi(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });

  // 3. Fetch List Anggaran - Gunakan staleTime 5 menit agar tidak fetch tiap ganti tab
  const { data: budgetsRes, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["annualBudgets", selectedYear], // Akan fetch ulang HANYA jika tahun ganti
    queryFn: () => getAnnualBudgetApi(selectedYear),
    staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
    refetchOnWindowFocus: false, // Jangan fetch ulang saat user balik ke browser tab ini
  });

  const availableYears = useMemo(() => yearsRes?.data?.availableYears || [], [yearsRes]);
  const energyTypes = useMemo(() => energyRes?.data || [], [energyRes]);

  // Filter Client-Side tetap di useMemo agar tidak berat
  const childBudgets = useMemo(() => {
    const data = budgetsRes?.data || [];
    if (selectedEnergyType === "all") return data;
    return data.filter((b: AnnualBudget) => b.energy_type_id.toString() === selectedEnergyType);
  }, [budgetsRes, selectedEnergyType]);

  const createOrUpdateMutation = useMutation({
    mutationFn: async ({
      values,
      isEditing,
      id,
    }: {
      values: AnnualBudgetFormValues;
      isEditing: boolean;
      id?: number;
    }) => {
      const payload = {
        budget: {
          ...values,
          allocations: isEditing
            ? {
                upsert: values.allocations.map((alloc) => ({
                  where: { allocation_id: alloc.allocation_id || 0 },
                  update: {
                    allocated_amount: alloc.allocated_amount,
                    allocated_volume: alloc.allocated_volume,
                  },
                  create: {
                    meter_id: alloc.meter_id,
                    allocated_amount: alloc.allocated_amount,
                    allocated_volume: alloc.allocated_volume,
                  },
                })),
              }
            : {
                create: values.allocations.map((alloc) => ({
                  meter_id: alloc.meter_id,
                  allocated_amount: alloc.allocated_amount,
                  allocated_volume: alloc.allocated_volume,
                })),
              },
        },
      };

      return isEditing && id
        ? annualBudgetApi.update(id, payload)
        : annualBudgetApi.create(payload);
    },
    onSuccess: (_, vars) => {
      toast.success(`Budget berhasil ${vars.isEditing ? "diperbarui" : "dibuat"}.`);
      // Invalidate cache secara spesifik
      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });
      // Jika ada query detail, invalidate juga
      queryClient.invalidateQueries({ queryKey: ["annualBudgetDetail"] });
    },
    onError: (err) => handleApiError(err, "Gagal menyimpan budget."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => annualBudgetApi.delete(id),
    onSuccess: () => {
      toast.success("Budget berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });
    },
    onError: (err) => handleApiError(err, "Gagal menghapus budget."),
  });

  return {
    selectedYear,
    setSelectedYear,
    selectedEnergyType,
    setSelectedEnergyType,
    availableYears,
    energyTypes,
    childBudgets,
    isLoading: isLoadingBudgets || isLoadingYears || isLoadingEnergyTypes,
    createOrUpdateMutation,
    deleteMutation,
  };
};
