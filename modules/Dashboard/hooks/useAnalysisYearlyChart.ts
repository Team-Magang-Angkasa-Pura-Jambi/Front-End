import { useQuery } from "@tanstack/react-query";
import { getYearlyAnalysisApi } from "../service/visualizations.service";
import { useMemo } from "react";
import { EnergyTypeName } from "@/common/types/energy";

export const useAnalysisYearly = (energyType: EnergyTypeName, year: number) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["yearlyAnalysis", energyType, year],
    queryFn: () => getYearlyAnalysisApi(energyType, year),
  });

  const chartData = useMemo(() => data?.data.chartData || [], [data?.data]);
  const summary = useMemo(() => data?.data.summary || null, [data?.data]);

  const volumeUnit = useMemo(() => {
    switch (energyType) {
      case "Electricity":
        return "kWh";
      case "Water":
        return "m³";
      case "Fuel":
        return "L";
      default:
        return "Unit";
    }
  }, [energyType]);

  return {
    data,
    isLoading,
    isError,
    error,
    volumeUnit,
    chartData,
    summary,
  };
};
