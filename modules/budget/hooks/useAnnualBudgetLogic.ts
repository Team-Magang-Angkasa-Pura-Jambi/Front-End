import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns-tz";

import { getBudgetSummaryApi } from "@/services/analysis.service";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";

import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { AnnualBudget } from "@/common/types/budget";
import { yearOptionsApi } from "../services/annualBudget.service";
import { annualBudgetApi } from "@/services/annualBudget.service";

export const useAnnualBudgetLogic = () => {
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedEnergyType, setSelectedEnergyType] = useState<string>("all");

  const { data: yearsResponse, isLoading: isLoadingYears } = useQuery({
    queryKey: ["meta", "fiscal-years"],
    queryFn: yearOptionsApi,
    staleTime: Infinity,
  });

  const { data: energyTypesResponse, isLoading: isLoadingEnergyTypes } =
    useQuery({
      queryKey: ["master", "energy-types"],
      queryFn: () => getEnergyTypesApi(),
      staleTime: Infinity,
    });

  const { data: childBudgetsResponse, isLoading: isLoadingChildren } = useQuery(
    {
      queryKey: ["childAnnualBudgets", selectedYear],
      queryFn: () => annualBudgetApi.getAll(selectedYear),
      staleTime: 1000 * 60 * 1,
      placeholderData: (prev) => prev,
    }
  );

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["budgetSummary", selectedYear],
    queryFn: () => getBudgetSummaryApi(selectedYear),
    enabled: !!selectedYear,
    placeholderData: (prev) => prev,
  });

  const { data: parentsResponse, isLoading: isLoadingParents } = useQuery({
    queryKey: ["parentAnnualBudgets", selectedYear],
    queryFn: () => annualBudgetApi.getParents(), // Memanggil endpoint dengan parent_budget_id = null
    enabled: !!selectedYear,
  });

  const parentBudgets = useMemo(() => {
    return parentsResponse?.data || [];
  }, [parentsResponse]);

  const availableYears = useMemo(
    () => yearsResponse?.data?.availableYears || [],
    [yearsResponse]
  );

  const energyTypes = useMemo(
    () => energyTypesResponse?.data || [],
    [energyTypesResponse]
  );

  const childBudgets = useMemo(() => {
    const rawData = childBudgetsResponse?.data || [];

    if (selectedEnergyType === "all") {
      return rawData;
    }

    return rawData.filter(
      (budget: AnnualBudget) =>
        budget.energy_type.type_name === selectedEnergyType
    );
  }, [childBudgetsResponse, selectedEnergyType]);

  const summary = useMemo(() => summaryData || [], [summaryData]);

  const createOrUpdateMutation = useMutation({
    mutationFn: ({
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

      if ("budgetType" in payload) delete (payload as any).budgetType;

      return isEditing && id
        ? annualBudgetApi.update(id, payload)
        : annualBudgetApi.create(payload);
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Budget berhasil ${variables.isEditing ? "diperbarui" : "dibuat"}.`
      );

      queryClient.invalidateQueries({ queryKey: ["childAnnualBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Terjadi kesalahan.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => annualBudgetApi.delete(id),
    onSuccess: () => {
      toast.success("Budget berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["childAnnualBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menghapus budget.");
    },
  });

  return {
    selectedYear,
    setSelectedYear,
    selectedEnergyType,
    setSelectedEnergyType,

    availableYears,
    energyTypes,
    childBudgets,
    summaryData: summary,
    parentBudgets: parentBudgets,

    isLoading: isLoadingChildren || isLoadingYears || isLoadingEnergyTypes,
    isLoadingSummary,

    createOrUpdateMutation,
    deleteMutation,
  };
};
