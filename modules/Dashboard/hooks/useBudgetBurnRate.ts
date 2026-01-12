import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart"; // Helper currency
import { getBudgetBurnRateApi } from "../service/visualizations.service";
import { MONTH_CONFIG } from "../constants";

export const useBudgetBurnRateChart = () => {
  // --- 1. STATE MANAGEMENT ---
  const [year, setYear] = useState<string>(() =>
    new Date().getFullYear().toString()
  );

  const [month, setMonth] = useState<string>(() =>
    (new Date().getMonth() + 1).toString()
  );

  // --- 2. OPTIONS GENERATOR ---
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      {
        value: (currentYear - 1).toString(),
        label: (currentYear - 1).toString(),
      },
      { value: currentYear.toString(), label: currentYear.toString() },
      {
        value: (currentYear + 1).toString(),
        label: (currentYear + 1).toString(),
      },
    ];
  }, []);

  // --- 3. DATA FETCHING ---
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["budget-burn-rate", year, month],
    queryFn: () => getBudgetBurnRateApi(parseInt(year), parseInt(month)),
    // Menjaga data lama tetap tampil saat loading data baru (UX lebih halus)
    placeholderData: (previousData) => previousData,
  });

  const chartData = useMemo(() => apiResponse?.data || [], [apiResponse?.data]);

  // --- 4. SMART INSIGHT LOGIC ---
  const insight = useMemo(() => {
    if (!chartData.length) return null;

    // Cari data terakhir yang memiliki nilai aktual (progress terakhir)
    // Kita copy array dulu dengan [...chartData] agar tidak memutasi state asli saat reverse
    const lastEntry = [...chartData].reverse().find((d) => d.actual > 0);

    // Jika belum ada data aktual sama sekali
    if (!lastEntry) {
      return {
        type: "neutral",
        text: "Belum ada realisasi anggaran yang tercatat bulan ini.",
      };
    }

    const { actual, idea, efficent, dayDate } = lastEntry; // Typo 'efficent' dari API tetap dijaga, tapi logic diperbaiki

    const diff = actual - idea; // Selisih Aktual vs Ideal (Linear)
    const isOverBudget = diff > 0;

    // Hitung persentase penyimpangan
    const percentage =
      idea > 0 ? ((Math.abs(diff) / idea) * 100).toFixed(1) : "0";

    // Format tanggal untuk pesan (misal: "15 Jan")
    const dateStr = new Date(dayDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    const diffCurrency = formatCurrencySmart(Math.abs(diff)).val;

    // A. Kondisi Boros (Melebihi Ideal)
    if (isOverBudget) {
      return {
        type: "warning",
        title: "Peringatan Burn Rate",
        text: `Per ${dateStr}, realisasi anggaran melebihi laju ideal sebesar ${percentage}% (${diffCurrency}). Berpotensi over-budget di akhir bulan jika tidak direm.`,
        highlight: true,
      };
    }

    // B. Kondisi Sangat Efisien (Di bawah target efisiensi)
    // Asumsi: 'efficent' adalah batas bawah penghematan
    if (actual <= efficent) {
      return {
        type: "success",
        title: "Sangat Efisien",
        text: `Performa per ${dateStr} sangat baik. Penggunaan anggaran ${percentage}% lebih hemat dari proyeksi linear.`,
        highlight: false,
      };
    }

    // C. Kondisi Aman (On Track: Antara Efisien dan Ideal)
    return {
      type: "success",
      title: "On Track",
      text: `Realisasi anggaran per ${dateStr} masih dalam batas aman (sesuai jalur proyeksi).`,
      highlight: false,
    };
  }, [chartData]);

  // --- 5. RETURN OBJECT ---
  return {
    filters: {
      year,
      setYear,
      month,
      setMonth,
    },
    options: {
      years: yearOptions,
      months: MONTH_CONFIG, // Menggunakan config global
    },
    data: {
      chartData,
      insight,
    },
    status: {
      isLoading,
      isError,
      error,
    },
  };
};
