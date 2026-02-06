import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns-tz";
import { AxiosError } from "axios";

import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";

import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { AnnualBudget } from "@/common/types/budget";
import {
  annualBudgetApi,
  getAnnualBudgetApi,
  yearOptionsApi,
} from "@/modules/budget/services/annualBudget.service";
import { budgetApi } from "../services/budget.service";

export const useAnnualBudgetLogic = () => {
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedEnergyType, setSelectedEnergyType] = useState<string>("all");

  const handleApiError = (err: unknown, defaultMsg: string) => {
    const error = err as AxiosError<{ message: string }>;
    const message = error.response?.data.message || defaultMsg;
    toast.error(message);
  };

  const { data: yearsRes, isLoading: isLoadingYears } = useQuery({
    queryKey: ["meta", "fiscal-years"],
    queryFn: yearOptionsApi,
    staleTime: Infinity,
  });

  const { data: energyRes, isLoading: isLoadingEnergyTypes } = useQuery({
    queryKey: ["master", "energy-types"],
    queryFn: () => getEnergyTypesApi(),
    staleTime: Infinity,
  });

  const { data: childBudgetsRes, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["childAnnualBudgets", selectedYear],
    queryFn: () => getAnnualBudgetApi(selectedYear),
    staleTime: 1000 * 60,
  });

  const { data: parentsRes, isLoading: isLoadingParents } = useQuery({
    queryKey: ["parentAnnualBudgets", selectedYear],
    queryFn: () => annualBudgetApi.getParents(),
    enabled: !!selectedYear,
  });

  const { data: summaryRes, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["budgetSummary", selectedYear],
    queryFn: () => budgetApi.getSummary(selectedYear),
    enabled: !!selectedYear,
  });

  const availableYears = useMemo(
    () => yearsRes?.data?.availableYears || [],
    [yearsRes]
  );
  const energyTypes = useMemo(() => energyRes?.data || [], [energyRes]);
  const parentBudgets = useMemo(() => parentsRes?.data || [], [parentsRes]);
  const summaryData = useMemo(() => summaryRes || [], [summaryRes]);

  const childBudgets = useMemo(() => {
    const data = childBudgetsRes?.data || [];
    if (selectedEnergyType === "all") return data;
    return data.filter(
      (b: AnnualBudget) => b.energy_type?.type_name === selectedEnergyType
    );
  }, [childBudgetsRes, selectedEnergyType]);

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
        ...values,
        period_start: new Date(
          format(values.period_start, "yyyy-MM-dd", { timeZone: "UTC" })
        ),
        period_end: new Date(
          format(values.period_end, "yyyy-MM-dd", { timeZone: "UTC" })
        ),
      };

      if ("budgetType" in payload)
        delete (payload as Partial<AnnualBudgetFormValues>).budgetType;

      return isEditing && id
        ? annualBudgetApi.update(id, payload)
        : annualBudgetApi.create(payload);
    },
    onSuccess: (_, vars) => {
      toast.success(
        `Budget berhasil ${vars.isEditing ? "diperbarui" : "dibuat"}.`
      );
      queryClient.invalidateQueries({ queryKey: ["childAnnualBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["parentAnnualBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] });
    },
    onError: (err) => handleApiError(err, "Gagal menyimpan budget."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => annualBudgetApi.delete(id),
    onSuccess: () => {
      toast.success("Budget berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["childAnnualBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] });
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
    parentBudgets,
    summaryData,

    isLoading:
      isLoadingChildren ||
      isLoadingYears ||
      isLoadingEnergyTypes ||
      isLoadingParents,
    isLoadingSummary,

    createOrUpdateMutation,
    deleteMutation,
  };
};
