import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MeterRankApi } from "../service/visualizations.service";
import { getStatusConfig } from "../constants";

export const useMeterEfficiencyRanking = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["meterEfficiencyRanking"],
    queryFn: MeterRankApi,
  });

  const meterData = useMemo(() => data?.data || [], [data]);

  const topIssueMeter = useMemo(() => {
    if (meterData.length === 0) return null;

    const sorted = [...meterData].sort(
      (a, b) => b.consumption / b.budget - a.consumption / a.budget
    );

    return sorted[0];
  }, [meterData]);

  const insightMessage = useMemo(() => {
    if (!topIssueMeter) return "Data tidak tersedia.";

    const ratio = (topIssueMeter.consumption / topIssueMeter.budget) * 100;

    if (ratio >= 100) {
      return `Perhatian: ${
        topIssueMeter.code
      } telah melebihi budget (${ratio.toFixed(
        0
      )}%). Segera lakukan pemeriksaan.`;
    } else if (ratio > 80) {
      return `Waspada: ${
        topIssueMeter.code
      } mendekati batas anggaran (${ratio.toFixed(0)}%).`;
    } else {
      return "Efisiensi terjaga. Semua meteran beroperasi dalam batas anggaran.";
    }
  }, [topIssueMeter]);

  return {
    meters: meterData,
    isLoading,
    isError,
    topIssueMeter,
    insightMessage,
    getStatusConfig,
  };
};
