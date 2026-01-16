import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBudgetTrackingApi } from "../service/visualizations.service";
import { EnergyTypeName } from "@/common/types/energy";
import { MONTH_CONFIG } from "../constants";

export const useBudgetAnalytics = (
  year: string,
  energyType: EnergyTypeName
) => {
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["budgetTracking"],
    queryFn: getBudgetTrackingApi,
    staleTime: 1000 * 60 * 5,
  });

  const analytics = useMemo(() => {
    if (!apiResponse?.data) return null;

    const found = apiResponse.data.find(
      (item) => item.year === year && item.energyType === energyType
    );

    if (!found) return null;

    const rawData = found;

    const toMillions = (val: number) => val / 1_000_000;

    const initial = toMillions(rawData.initial);
    const used = (rawData.used || []).map(toMillions);
    const saved = (rawData.saved || []).map(toMillions);

    const totalUsed = used.reduce((a, b) => a + b, 0);
    const totalSaved = saved.reduce((a, b) => a + b, 0);
    const remaining = initial - totalUsed;

    const waterfallData = [
      { name: "Initial", value: initial, type: "initial" },
      ...used.map((val, i) => ({
        name: MONTH_CONFIG[i]?.shortCut || `Bulan ${i + 1}`,
        value: val,
        type: "expense",
      })),
      { name: "Sisa", value: Math.max(0, remaining), type: "remaining" },
    ];

    const savedData = saved.map((val, i) => ({
      name: MONTH_CONFIG[i]?.shortCut || `Bulan ${i + 1}`,
      amount: val,
    }));

    return {
      totals: { initial, totalUsed, totalSaved, remaining },
      charts: { waterfallData, savedData },
    };
  }, [apiResponse, year, energyType]);

  return {
    isLoading,
    isError,
    error,
    data: analytics,
  };
};
