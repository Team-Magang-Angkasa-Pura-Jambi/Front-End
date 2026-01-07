import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns-tz";

// Services

import { getBudgetSummaryApi } from "@/services/analysis.service";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";

// Schemas & Types
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { AnnualBudget } from "@/common/types/budget"; // Pastikan import type ini ada
import { yearOptionsApi } from "../services/annualBudget.service";
import { annualBudgetApi } from "@/services/annualBudget.service";

export const useAnnualBudgetLogic = () => {
  const queryClient = useQueryClient();

  // --- 1. State ---
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedEnergyType, setSelectedEnergyType] = useState<string>("all");

  // --- 2. Queries (Read Data) ---

  // A. List Tahun (Untuk Dropdown)
  const { data: yearsResponse, isLoading: isLoadingYears } = useQuery({
    queryKey: ["meta", "fiscal-years"],
    queryFn: yearOptionsApi,
    staleTime: Infinity, // Data tahun jarang berubah
  });

  // B. List Tipe Energi (Untuk Dropdown)
  const { data: energyTypesResponse, isLoading: isLoadingEnergyTypes } =
    useQuery({
      queryKey: ["master", "energy-types"],
      queryFn: () => getEnergyTypesApi(),
      staleTime: Infinity,
    });

  // C. Main Table Data (List Budget)
  // Strategi: Ambil SEMUA data 1 tahun, filter di frontend.
  const { data: childBudgetsResponse, isLoading: isLoadingChildren } = useQuery(
    {
      queryKey: ["childAnnualBudgets", selectedYear], // Key hanya TAHUN
      queryFn: () => annualBudgetApi.getAll(selectedYear), // Fetch semua tipe energi
      staleTime: 1000 * 60 * 1, // Cache 1 menit
      placeholderData: (prev) => prev, // Keep data lama saat ganti tahun biar smooth
    }
  );

  // D. Summary Data (Carousel)
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["budgetSummary", selectedYear],
    queryFn: () => getBudgetSummaryApi(selectedYear),
    enabled: !!selectedYear,
    placeholderData: (prev) => prev,
  });

  // --- 3. Derived State (Memoization & Filtering) ---

  const availableYears = useMemo(
    () => yearsResponse?.data?.availableYears || [],
    [yearsResponse]
  );

  const energyTypes = useMemo(
    () => energyTypesResponse?.data || [],
    [energyTypesResponse]
  );

  // 🔥 FILTERING LOGIC (Client-Side)
  // User ganti dropdown -> useMemo jalan -> UI update (Tanpa loading server)
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

  // --- 4. Mutations (Write Data) ---

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
      // Normalisasi Tanggal ke UTC agar konsisten di DB
      const payload = {
        ...values,
        period_start: new Date(
          format(values.period_start, "yyyy-MM-dd", { timeZone: "UTC" })
        ),
        period_end: new Date(
          format(values.period_end, "yyyy-MM-dd", { timeZone: "UTC" })
        ),
      };

      // Hapus properti dummy jika ada
      if ("budgetType" in payload) delete (payload as any).budgetType;

      return isEditing && id
        ? annualBudgetApi.update(id, payload)
        : annualBudgetApi.create(payload);
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Budget berhasil ${variables.isEditing ? "diperbarui" : "dibuat"}.`
      );
      // Refresh data tabel & summary
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

  // --- 5. Return Value ---
  return {
    // State Controls
    selectedYear,
    setSelectedYear,
    selectedEnergyType,
    setSelectedEnergyType,

    // Data Sources
    availableYears,
    energyTypes,
    childBudgets, // Sudah terfilter
    summaryData: summary,
    parentBudgets: [], // Placeholder jika nanti butuh

    // Loading States
    isLoading: isLoadingChildren || isLoadingYears || isLoadingEnergyTypes,
    isLoadingSummary,

    // Actions
    createOrUpdateMutation,
    deleteMutation,
  };
};
