import { useQuery } from "@tanstack/react-query";
import { yearlyHeatmapApi } from "../service/visualizations.service";

export type UsageCategory =
  | "SANGAT_EFISIEN"
  | "NORMAL"
  | "MENDEKATI_LIMIT"
  | "OVER_BUDGET"
  | "UNKNOWN";

export type HeatmapDay = {
  id: string;
  dateDisplay: string;
  status: UsageCategory;
  confidence: string | null;
  color: string;
};

export type HeatmapMonthGroup = {
  monthName: string;
  offset: number;
  days: HeatmapDay[];
};

export type EfficiencyStats = {
  SANGAT_EFISIEN: number;
  NORMAL: number;
  MENDEKATI_LIMIT: number;
  OVER_BUDGET: number;
  UNKNOWN?: number;
};

export type YearlyHeatmapResponse = {
  groupedData: HeatmapMonthGroup[];
  statsSummary: EfficiencyStats;
  totalDays: number;
};

export const useModernEfficiency = (selectedMeterId: number, selectedYear: string) => {
  const {
    data: heatmapResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["yearlyHeatmap", selectedMeterId, selectedYear],
    queryFn: () => yearlyHeatmapApi(Number(selectedMeterId), Number(selectedYear)),
    enabled: !!selectedMeterId && !!selectedYear,
    staleTime: 1000 * 60 * 5,
  });

  const groupedData = heatmapResponse?.data?.groupedData || [];
  const statsSummary = heatmapResponse?.data?.statsSummary || {
    SANGAT_EFISIEN: 0,
    NORMAL: 0,
    MENDEKATI_LIMIT: 0,
    OVER_BUDGET: 0,
    UNKNOWN: 0,
  };
  const totalDays = heatmapResponse?.data?.totalDays || 0;

  return {
    groupedData,
    statsSummary,
    totalDays,

    isLoading,
    isError,
    error,
  };
};
