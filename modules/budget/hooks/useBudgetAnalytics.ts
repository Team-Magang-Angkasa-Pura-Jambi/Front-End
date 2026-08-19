"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MONTH_CONFIG } from "../../Dashboard/constants";
import { getBudgetTrackingApi } from "../services/annualBudget.service";

export const useBudgetAnalytics = (year: number, energyTypeId: number) => {
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["budgetTracking", year, energyTypeId],
    queryFn: () => getBudgetTrackingApi(year, energyTypeId),
    enabled: !!year && !!energyTypeId,
    staleTime: 1000 * 60 * 5,
  });

  const analytics = useMemo(() => {
    // Pastikan data benar-benar ada
    if (!apiResponse?.data || !apiResponse.data.initial) return null;

    const rawData = apiResponse.data;

    // Nilai murni dalam Rupiah
    const initial = Number(rawData.initial) || 0;
    const used = rawData.used?.map(Number) || [];
    const saved = rawData.saved?.map(Number) || [];

    const totalUsed = used.reduce((a, b) => a + (b || 0), 0);
    const totalSaved = saved.reduce((a, b) => a + (b || 0), 0);
    const remaining = Math.max(0, initial - totalUsed);

    // ==========================================
    // 1. FORMAT WATERFALL CHART (BALOK MENGAMBANG)
    // ==========================================
    let currentBalance = initial;
    const waterfallData = [{ name: "Awal", value: initial, type: "initial" }];

    used.forEach((val, i) => {
      const expense = val || 0;
      currentBalance -= expense; // Saldo berkurang seiring pemakaian tiap bulan

      waterfallData.push({
        name: MONTH_CONFIG[i]?.shortCut || `Bln ${i + 1}`,
        value: expense, // Nilai pengeluaran bulan tersebut
        type: expense > 0 ? "expense" : "empty", // Beri tipe kosong jika 0
      });
    });

    waterfallData.push({ name: "Sisa", value: Math.max(0, currentBalance), type: "remaining" });

    // ==========================================
    // 2. FORMAT SAVED CHART (PENGHEMATAN)
    // ==========================================
    const savedData = saved
      .map((val, i) => ({
        name: MONTH_CONFIG[i]?.shortCut || `Bln ${i + 1}`,
        amount: val, // Jaga-jaga jika chart butuh key 'amount'
        saved: val, // Jaga-jaga jika chart butuh key 'saved'
      }))
      .filter((item) => item.saved > 0); // Buang bulan yang 0 agar chart bersih

    return {
      totals: { initial, totalUsed, totalSaved, remaining },
      charts: { waterfallData, savedData },
    };
  }, [apiResponse?.data]);

  return {
    isLoading,
    isError,
    error,
    data: analytics,
  };
};
