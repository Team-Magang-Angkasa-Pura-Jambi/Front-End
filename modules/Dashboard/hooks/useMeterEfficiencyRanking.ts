import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MeterRankApi } from "../service/visualizations.service";
import { getStatusConfig } from "../constants";

export const useMeterEfficiencyRanking = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["meterEfficiencyRanking"],
    queryFn: MeterRankApi,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const meters = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const statistics = useMemo(() => {
    if (!meters.length) return null;

    const totalMeters = meters.length;

    const criticalCount = meters.filter(
      (m) => m.insight.percentage_used > 100
    ).length;

    const efficientCount = totalMeters - criticalCount;

    return {
      total: totalMeters,
      critical: criticalCount,
      efficient: efficientCount,
      hasCritical: criticalCount > 0,
    };
  }, [meters]);

  return {
    meters,
    statistics,
    isLoading,
    isError,
    error,
    refetch,
    getStatusConfig,
  };
};
