import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getEnergyPaxCorrelationApi } from "../service/visualizations.service";

export interface UnifiedEnergyData {
  category: string;
  weekdayValue: number;
  holidayValue: number;
  unit?: string;
}

export interface DailyPaxData {
  name: string;
  date: string | Date;
  avgPax: number;
}

export const useEnergyPaxCorrelation = () => {
  const [month, setMonth] = useState<string>(new Date().getMonth().toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const {
    data: responseData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["energyPaxCorrelation", year, month],
    queryFn: () => getEnergyPaxCorrelationApi(Number(year), Number(month)),

    enabled: !!year && !!month,
    staleTime: 5 * 60 * 1000,
  });

  const energyData: UnifiedEnergyData[] = useMemo(() => {
    return responseData?.data?.energyComparison || [];
  }, [responseData]);

  const paxData: DailyPaxData[] = useMemo(() => {
    return responseData?.data?.paxTrend || [];
  }, [responseData]);

  return {
    year,
    setYear,
    month,
    setMonth,

    data: energyData,
    paxData,

    isLoading,
    isError,
    error,
  };
};
