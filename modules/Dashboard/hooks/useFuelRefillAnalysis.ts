import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { MeterType } from "@/common/types/meters";
import { useMeterQuery } from "@/modules/masterData/hooks/useMeterQuery";
import { getFuelRefillAnalysisApi } from "../service/visualizations.service";

export interface FuelMonthRecord {
  month: string;
  consumption: number;
  refill: number;
  remainingStock: number;
}

export interface FuelSummary {
  totalConsumption: number;
  totalRefill: number;
  balance: number;
  lastRefill: string;
  status: "Safe" | "Critical";
}

export const useFuelRefillAnalysis = () => {
  const [year, setYear] = useState<string>(() => new Date().getFullYear().toString());
  const [meterId, setMeterId] = useState<string>("");

  const yearOptions = useMemo(() => {
    const curr = new Date().getFullYear();
    return [curr - 1, curr, curr + 1].map(String);
  }, []);

  const { useGetMeters } = useMeterQuery();

  const { data: meterDataResponse, isLoading: isMeterLoading } = useGetMeters();

  const meterData: MeterType[] = useMemo(() => {
    const rawData = meterDataResponse?.data;

    const finalArray = Array.isArray(rawData)
      ? rawData
      : rawData && typeof rawData === "object" && "meter" in rawData && Array.isArray(rawData.meter)
        ? rawData.meter
        : [];

    return finalArray.filter((meter: MeterType) => !!meter.tank_profile);
  }, [meterDataResponse]);

  useEffect(() => {
    if (meterData.length > 0 && !meterId) {
      setMeterId(String(meterData[0].meter_id));
    }
  }, [meterData, meterId]);

  useEffect(() => {
    if (meterData.length > 0 && !meterId) {
      setMeterId(String(meterData[0].meter_id));
    }
  }, [meterData, meterId]);

  const {
    data: apiResponse,
    isLoading: isAnalysisLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["fuel-refill-analysis", year, meterId],
    queryFn: () => getFuelRefillAnalysisApi(parseInt(year), parseInt(meterId)),
    enabled: !!meterId,
    staleTime: 5 * 60 * 1000,
  });

  const chartData: FuelMonthRecord[] = useMemo(
    () => apiResponse?.data?.chartData || [],
    [apiResponse]
  );

  const stockThresholds = useMemo(
    () => apiResponse?.data?.stockThresholds || { minStockLimit: 0 },
    [apiResponse]
  );

  const latestStockInfo = useMemo(
    () => apiResponse?.data?.latestStockInfo || { month: "-", value: 0 },
    [apiResponse]
  );

  const summary: FuelSummary = useMemo(
    () =>
      apiResponse?.data?.summary || {
        totalConsumption: 0,
        totalRefill: 0,
        balance: 0,
        lastRefill: "-",
        status: "Safe",
      },
    [apiResponse]
  );

  const isLoading = isMeterLoading || isAnalysisLoading;

  return {
    filters: {
      year,
      setYear,
      meterId,
      setMeterId,
    },
    options: {
      meters: meterData,
      years: yearOptions,
    },
    data: {
      chartData,
      stockThresholds,
      latestStockInfo,
      summary,
    },
    status: {
      isLoading,
      isError,
      error,
    },
  };
};
