import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { getBudgetBurnRateApi } from "../service/visualizations.service";
import { MONTH_CONFIG } from "../constants";

export const useBudgetBurnRateChart = () => {
  const [year, setYear] = useState<string>(() =>
    new Date().getFullYear().toString()
  );

  const [month, setMonth] = useState<string>(() =>
    (new Date().getMonth() + 1).toString()
  );

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

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["budget-burn-rate", year, month],
    queryFn: () => getBudgetBurnRateApi(parseInt(year), parseInt(month)),

    placeholderData: (previousData) => previousData,
  });

  const chartData = useMemo(() => apiResponse?.data || [], [apiResponse?.data]);

  const insight = useMemo(() => {
    if (!chartData.length) return null;

    const lastEntry = [...chartData].reverse().find((d) => (d.actual ?? 0) > 0);

    if (!lastEntry) {
      return {
        type: "neutral",
        text: "Belum ada realisasi anggaran yang tercatat bulan ini.",
      };
    }

    const actual = lastEntry.actual ?? 0;
    const idea = lastEntry.idea ?? 0;
    const efficent = lastEntry.efficent ?? 0;
    const dayDate = lastEntry.dayDate;

    const diff = actual - idea;
    const isOverBudget = diff > 0;

    const percentage =
      idea > 0 ? ((Math.abs(diff) / idea) * 100).toFixed(1) : "0";

    const dateStr = new Date(dayDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    const diffCurrency = formatCurrencySmart(Math.abs(diff)).val;

    if (isOverBudget) {
      return {
        type: "warning",
        title: "Peringatan Burn Rate",
        text: `Per ${dateStr}, realisasi anggaran melebihi laju ideal sebesar ${percentage}% (${diffCurrency}). Berpotensi over-budget di akhir bulan jika tidak direm.`,
        highlight: true,
      };
    }

    if (actual <= efficent) {
      return {
        type: "success",
        title: "Sangat Efisien",
        text: `Performa per ${dateStr} sangat baik. Penggunaan anggaran ${percentage}% lebih hemat dari proyeksi linear.`,
        highlight: false,
      };
    }

    return {
      type: "success",
      title: "On Track",
      text: `Realisasi anggaran per ${dateStr} masih dalam batas aman (sesuai jalur proyeksi).`,
      highlight: false,
    };
  }, [chartData]);

  return {
    filters: {
      year,
      setYear,
      month,
      setMonth,
    },
    options: {
      years: yearOptions,
      months: MONTH_CONFIG,
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
