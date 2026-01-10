import { useQuery } from "@tanstack/react-query";
import { EnergyOutlookApi } from "../service/visualizations.service";
import { useMemo } from "react";

export const useMultiEnergyForecast = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["energyOutlook"],
    queryFn: EnergyOutlookApi,
    refetchOnWindowFocus: false,
  });

  const outlookData = useMemo(() => data?.data || [], []);

  const electricForecast = useMemo(() => outlookData, [outlookData]);
  return {
    outlookData,
    electricForecast,
    data,
    isLoading,
    isError,
    error,
  };
};
