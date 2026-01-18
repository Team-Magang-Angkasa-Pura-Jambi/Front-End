import React, { useEffect, useMemo } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Form } from "@/common/components/ui/form";
import { BudgetForm } from "./BudgetForm";
import { AnnualBudget } from "@/common/types/budget";
import {
  AnnualBudgetFormValues,
  annualBudgetFormSchema,
} from "../schemas/annualBudget.schema";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { useQuery } from "@tanstack/react-query";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { getprepareNextPeriodBudgetApi } from "../services/analytics.service";

interface AnnualBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBudget: AnnualBudget | null;
  parentBudgets: AnnualBudget[];
  onSubmit: (values: AnnualBudgetFormValues) => void;
  isSubmitting: boolean;
}

const DEFAULT_VALUES: Partial<AnnualBudgetFormValues> = {
  budgetType: "parent",
  total_budget: 0,
  efficiency_tag: 0,
  allocations: [],
  parent_budget_id: null,
  energy_type_id: undefined,
};

export const AnnualBudgetDialog = ({
  open,
  onOpenChange,
  editingBudget,
  parentBudgets,
  onSubmit,
  isSubmitting,
}: AnnualBudgetDialogProps) => {
  const form = useForm<AnnualBudgetFormValues>({
    resolver: zodResolver(
      annualBudgetFormSchema
    ) as Resolver<AnnualBudgetFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const budgetType = useWatch({ control: form.control, name: "budgetType" });
  const selectedEnergyTypeId = useWatch({
    control: form.control,
    name: "energy_type_id",
  });
  const parentBudgetId = useWatch({
    control: form.control,
    name: "parent_budget_id",
  });
  const allocations = form.watch("allocations") || [];
  const totalWeight = allocations.reduce(
    (sum, item) => sum + (parseFloat(String(item.weight || 0)) || 0),
    0
  );

  const targetTotal = 1; // Asumsi input user adalah angka persen (contoh: 25, 50, 25)
  const isValidTotal = Math.abs(totalWeight - targetTotal) < 1;
  useEffect(() => {
    if (open) {
      if (editingBudget) {
        const isChild = !!editingBudget.parent_budget_id;

        if (isChild) {
          form.reset({
            budgetType: "child",
            period_start: new Date(editingBudget.period_start),
            period_end: new Date(editingBudget.period_end),

            parent_budget_id: editingBudget.parent_budget_id!,
            allocations:
              editingBudget.allocations?.map((alloc) => ({
                meter_id: alloc.meter.meter_id,
                weight: alloc.weight,
              })) || [],

            total_budget: undefined,
            efficiency_tag: undefined,
            energy_type_id: undefined,
          });
        } else {
          form.reset({
            budgetType: "parent",
            period_start: new Date(editingBudget.period_start),
            period_end: new Date(editingBudget.period_end),

            total_budget: editingBudget.total_budget ?? 0,
            efficiency_tag: editingBudget.efficiency_tag ?? 0,
            energy_type_id: editingBudget.energy_type?.energy_type_id,

            parent_budget_id: null,
            allocations: [],
          });
        }
      } else {
        form.reset(DEFAULT_VALUES);
      }
    }
  }, [open, editingBudget, form]);

  const { data: energyTypesResponse, isLoading: isLoadingEnergy } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
    enabled: open,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const energyTypes = useMemo(
    () => energyTypesResponse?.data || [],
    [energyTypesResponse]
  );
  const selectedEnergyTypeName = useMemo(
    () =>
      energyTypes.find((et) => et.energy_type_id === selectedEnergyTypeId)
        ?.type_name,
    [selectedEnergyTypeId, energyTypes]
  );

  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["meters", selectedEnergyTypeName],
    queryFn: () => getMetersApi(selectedEnergyTypeName),
    enabled: open && !!selectedEnergyTypeName,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: nextBudgetAnalysis } = useQuery({
    queryKey: ["prepareNextPeriodBudget", parentBudgetId],
    queryFn: () => getprepareNextPeriodBudgetApi(parentBudgetId),
    enabled: open && !!parentBudgetId && budgetType === "child",
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (budgetType === "parent") {
      form.setValue("parent_budget_id", null);
      form.setValue("allocations", []);
    }
  }, [budgetType, form]);

  useEffect(() => {
    if (budgetType === "child" && parentBudgetId) {
      const selectedParent = parentBudgets.find(
        (p) => p.budget_id === parentBudgetId
      );
      if (selectedParent?.energy_type?.energy_type_id) {
        form.setValue(
          "energy_type_id",
          selectedParent.energy_type.energy_type_id
        );
      }
    }
  }, [parentBudgetId, budgetType, parentBudgets, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingBudget ? "Edit" : "Tambah"} Budget</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BudgetForm
              budgetType={budgetType}
              setBudgetType={(val) => form.setValue("budgetType", val)}
              editingBudget={editingBudget}
              isSubmitting={isSubmitting}
              parentBudgets={parentBudgets}
              energyTypes={energyTypes}
              meters={metersResponse?.data || []}
              isLoadingMeters={isLoadingMeters}
              isLoadingEnergyTypes={isLoadingEnergy}
              prepareNextPeriodBudget={nextBudgetAnalysis}
              selectedEnergyTypeName={selectedEnergyTypeName}
              isValidTotal={isValidTotal}
              totalWeight={totalWeight}
              targetTotal={targetTotal}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
