import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { getFuelRefillAnalysisApi } from "../service/visualizations.service";

export const useFuelRefillAnalysis = () => {
  const [year, setYear] = useState<string>(() =>
    new Date().getFullYear().toString()
  );

  const [meterId, setMeterId] = useState<string | undefined>(undefined);

  const yearOptions = useMemo(() => {
    const curr = new Date().getFullYear();
    return [curr - 1, curr, curr + 1].map(String);
  }, []);

  const { data: meterDataResponse, isLoading: isMeterLoading } = useQuery({
    queryKey: ["meters", "fuel"],
    queryFn: () => getMetersApi("Fuel"),
    staleTime: 5 * 60 * 1000,
  });

  const meterData = useMemo(
    () => meterDataResponse?.data || [],
    [meterDataResponse]
  );

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
    queryFn: () => getFuelRefillAnalysisApi(parseInt(year), parseInt(meterId!)),

    enabled: !!meterId,
  });

  const chartData = useMemo(() => apiResponse?.data || [], [apiResponse]);

  const stockThresholds = useMemo(() => {
    if (!chartData.length) return { maxCapacity: 0, minStockLimit: 0 };

    const maxRecordedStock = Math.max(
      ...chartData.map((d) => d.remainingStock)
    );

    const minStockLimit = maxRecordedStock * 0.2;

    return { maxCapacity: maxRecordedStock, minStockLimit };
  }, [chartData]);

  const latestStockInfo = useMemo(() => {
    if (!chartData.length) return { month: "-", value: 0 };

    const lastValidData = [...chartData]
      .reverse()
      .find((d) => d.remainingStock > 0);

    return {
      month: lastValidData ? lastValidData.month : "-",
      value: lastValidData ? lastValidData.remainingStock : 0,
    };
  }, [chartData]);

  const summary = useMemo(() => {
    if (!chartData.length)
      return { balance: 0, lastRefill: "-", status: "Neutral" };

    const totalRefill = chartData.reduce(
      (acc: number, curr) => acc + curr.refill,
      0
    );
    const totalCons = chartData.reduce(
      (acc: number, curr) => acc + curr.consumption,
      0
    );

    const balance = totalRefill - totalCons;

    const lastRefillData = [...chartData].reverse().find((d) => d.refill > 0);

    const isCritical = latestStockInfo.value < stockThresholds.minStockLimit;

    return {
      totalRefill,
      totalCons,
      balance,
      lastRefill: lastRefillData ? lastRefillData.month : "Belum ada",
      status: isCritical ? "Critical" : "Safe",
    };
  }, [chartData, latestStockInfo.value, stockThresholds.minStockLimit]);

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
