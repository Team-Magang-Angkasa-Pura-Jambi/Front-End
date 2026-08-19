import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getYearlyAnalysisApi } from "../service/visualizations.service";

export const useAnalysisYearly = (energyId: number | null, year: number) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["yearlyAnalysis", energyId, year],
    queryFn: () => getYearlyAnalysisApi(energyId as number, year),
    enabled: energyId !== null && energyId > 0 && !!year,
    staleTime: 1000 * 60 * 5,
  });

  const chartData = useMemo(() => data?.data?.chartData || [], [data]);
  const summary = useMemo(() => data?.data?.summary || null, [data]);

  return {
    data,
    isLoading,
    isError,
    error,
    chartData,
    summary,
  };
};
