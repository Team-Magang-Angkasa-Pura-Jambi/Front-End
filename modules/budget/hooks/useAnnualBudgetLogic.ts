"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AnnualBudget } from "@/common/types/budget";
import {
  annualBudgetApi,
  getAnnualBudgetApi,
} from "@/modules/budget/services/annualBudget.service";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";

export const useAnnualBudgetLogic = () => {
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedEnergyType, setSelectedEnergyType] = useState<string>("all");

  const handleApiError = (err: unknown, defaultMsg: string) => {
    const message =
      axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : defaultMsg;
    toast.error(message);
  };

  const { data: energyRes, isLoading: isLoadingEnergyTypes } = useQuery({
    queryKey: ["master", "energy-types"],
    queryFn: () => getEnergyTypesApi(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });

  const { data: budgetsRes, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["annualBudgets", selectedYear],
    queryFn: () => getAnnualBudgetApi(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  const energyTypes = useMemo(() => energyRes?.data || [], [energyRes?.data]);

  const filteredBudgets = useMemo(() => {
    const budgets = budgetsRes?.data || [];

    if (selectedEnergyType === "all") return budgets;
    return budgets.filter((b: AnnualBudget) => b.energy_type_id.toString() === selectedEnergyType);
  }, [budgetsRes?.data, selectedEnergyType]);

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
      if (isEditing && id) return annualBudgetApi.update(id, values);
      return annualBudgetApi.create(values);
    },
    onSuccess: (_, { isEditing, id }) => {
      toast.success(`Anggaran berhasil ${isEditing ? "diperbarui" : "dibuat"}.`);

      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });

      if (isEditing && id) {
        queryClient.invalidateQueries({ queryKey: ["annualBudgetDetail", id] });
        queryClient.invalidateQueries({ queryKey: ["annualBudgetRemaining", id] });
      }
    },
    onError: (err) => handleApiError(err, "Gagal menyimpan data anggaran."),
  });

  const deleteMutation = useMutation({
    mutationFn: annualBudgetApi.delete,
    onSuccess: () => {
      toast.success("Anggaran berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });
    },
    onError: (err) => handleApiError(err, "Gagal menghapus anggaran."),
  });

  return {
    selectedYear,
    setSelectedYear,
    selectedEnergyType,
    setSelectedEnergyType,
    energyTypes,
    filteredBudgets,
    isLoading: isLoadingBudgets || isLoadingEnergyTypes,
    createOrUpdateMutation,
    deleteMutation,
  };
};
