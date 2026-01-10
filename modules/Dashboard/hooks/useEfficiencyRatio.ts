import { useQuery } from "@tanstack/react-query";
import { is } from "date-fns/locale";
import { getEfficiencyRatioApi } from "../service/visualizations.service";
import { useMemo } from "react";

// --- FETCH DATA ---

export const useEfficiencyRatio = (year, month) => {
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["efficiency-ratio", year, month],
    queryFn: () => getEfficiencyRatioApi(parseInt(year), parseInt(month)),
    refetchOnWindowFocus: false,
  });

  const chartData = useMemo(() => apiResponse?.data || [], [apiResponse]);

  return {
    error,
    isError,
    isLoading,
    chartData,
  };
};
