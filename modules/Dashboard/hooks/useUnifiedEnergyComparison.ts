import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { ENERGY_TYPES } from "@/common/types/energy";
import { getUnifiedComparisonApi } from "../service/visualizations.service";
// Sesuaikan path import ini
// Pastikan punya konstan ini

// Definisi Tipe Data Respons API (Sesuaikan dengan backend)
interface UnifiedComparisonData {
  category: string;
  unit: string;
  weekday_cons: number;
  holiday_cons: number;
  weekday_cost: number;
  holiday_cost: number;
}

export const useUnifiedEnergyComparison = () => {
  // --- 1. STATE ---
  const [view, setView] = useState<"consumption" | "cost">("consumption");
  const isCost = view === "cost";

  const currentDate = new Date();
  const [year, setYear] = useState<string>(
    currentDate.getFullYear().toString()
  );
  const [month, setMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );

  // Helper untuk parsing ke number
  const queryParams = useMemo(
    () => ({
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    }),
    [year, month]
  );

  // --- 2. DATA FETCHING (Parallel) ---
  const results = useQueries({
    queries: [
      {
        queryKey: [
          "comparison",
          ENERGY_TYPES.ELECTRICITY,
          queryParams.year,
          queryParams.month,
        ],
        queryFn: () =>
          getUnifiedComparisonApi(
            ENERGY_TYPES.ELECTRICITY,
            queryParams.year,
            queryParams.month
          ),
        staleTime: 5 * 60 * 1000, // Cache 5 menit
      },
      {
        queryKey: [
          "comparison",
          ENERGY_TYPES.WATER,
          queryParams.year,
          queryParams.month,
        ],
        queryFn: () =>
          getUnifiedComparisonApi(
            ENERGY_TYPES.WATER,
            queryParams.year,
            queryParams.month
          ),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: [
          "comparison",
          ENERGY_TYPES.FUEL,
          queryParams.year,
          queryParams.month,
        ],
        queryFn: () =>
          getUnifiedComparisonApi(
            ENERGY_TYPES.FUEL,
            queryParams.year,
            queryParams.month
          ),
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  // --- 3. STATUS AGGREGATION ---
  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  // Ambil pesan error dari query pertama yang gagal (jika ada)
  const error = results.find((r) => r.error)?.error;

  // --- 4. DATA TRANSFORMATION ---
  const allEnergyData = useMemo(() => {
    // Mapping hasil query menjadi array data yang bersih
    return results
      .map((r) => r.data?.data) // Ambil properti .data dari response axios/api wrapper
      .filter((d): d is UnifiedComparisonData => !!d) // Type guard: filter null/undefined
      .map((d) => ({
        category: d.category, // Misal: "Listrik", "Air"
        unit: d.unit, // Misal: "kWh", "m3"

        // Data yang akan dipakai chart (Value)
        weekdayValue: isCost ? d.weekday_cost : d.weekday_cons,
        holidayValue: isCost ? d.holiday_cost : d.holiday_cons,

        // Simpan data mentah juga jika perlu tooltip detail
        raw: {
          weekday_cons: d.weekday_cons,
          holiday_cons: d.holiday_cons,
          weekday_cost: d.weekday_cost,
          holiday_cost: d.holiday_cost,
        },
      }));
  }, [results, isCost]); // Dependency ke isCost agar data berubah saat toggle view

  return {
    // State Controls
    view,
    setView,
    isCost,
    year,
    setYear,
    month,
    setMonth,

    // Data & Status
    data: allEnergyData,
    isLoading,
    isError,
    error,
  };
};
