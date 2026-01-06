import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns-tz";
import { annualBudgetApi } from "@/services/annualBudget.service";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";

export const useAnnualBudgetLogic = () => {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  
  const { data: parentBudgetsData, isLoading: isLoadingParents } = useQuery({
    queryKey: ["annualBudgets"],
    queryFn: annualBudgetApi.getParents,
  });

  const { data: childBudgetsData, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["childAnnualBudgets"],
    queryFn: annualBudgetApi.getAll,
  });

  
  const parentBudgets = useMemo(() => parentBudgetsData?.data || [], [parentBudgetsData]);
  const childBudgets = useMemo(() => childBudgetsData?.data || [], [childBudgetsData]);

  
  const createOrUpdateMutation = useMutation({
    mutationFn: ({ values, isEditing, id }: { values: AnnualBudgetFormValues; isEditing: boolean; id?: number }) => {
      
      const payload: AnnualBudgetFormValues = {
        ...values,
        period_start: new Date(format(values.period_start, "yyyy-MM-dd", { timeZone: "UTC" })),
        period_end: new Date(format(values.period_end, "yyyy-MM-dd", { timeZone: "UTC" })),
      };

      
      if ("budgetType" in payload) delete payload.budgetType;

      return isEditing && id
        ? annualBudgetApi.update(id, payload)
        : annualBudgetApi.create(payload);
    },
    onSuccess: (_, variables) => {
      const action = variables.isEditing ? "diperbarui" : "dibuat";
      toast.success(`Budget berhasil ${action}.`);
      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["childAnnualBudgets"] });
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyimpan: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => annualBudgetApi.delete(id),
    onSuccess: () => {
      toast.success("Budget berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });
      queryClient.invalidateQueries({ queryKey: ["childAnnualBudgets"] });
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  return {
    selectedYear,
    setSelectedYear,
    parentBudgets,
    childBudgets,
    isLoading: isLoadingParents || isLoadingChildren,
    createOrUpdateMutation,
    deleteMutation,
  };
};