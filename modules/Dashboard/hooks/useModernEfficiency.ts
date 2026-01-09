import { ENERGY_TYPES } from "@/common/types/energy";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { yearlyHeatmapApi } from "../service/visualizations.service";

export type DayData = {
  id: number;
  dateObj: Date;
  dateDisplay: string;
  color: string;
  status: string;
  confidence: string | null;
};

export type MonthData = {
  monthIndex: number;
  monthName: string;
  days: DayData[];
  offset: number;
};

export type EfficiencyStats = {
  HEMAT: number;
  NORMAL: number;
  WARNING: number;
  BOROS: number;
  UNKNOWN: number;
};

const getLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const useModernEfficiency = (
  selectedMeterId: string,
  selectedYear: string
) => {
  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["electricityMeters"],
    queryFn: () => getMetersApi(ENERGY_TYPES.ELECTRICITY),
  });

  const meters = useMemo(() => metersResponse?.data || [], [metersResponse]);

  const { data: apiResponse, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ["yearlyHeatmap", selectedMeterId, selectedYear],
    queryFn: () =>
      yearlyHeatmapApi(Number(selectedMeterId), Number(selectedYear)),
    enabled: !!selectedMeterId && !!selectedYear,
  });

  const groupedData = useMemo<MonthData[]>(() => {
    const rawData = apiResponse?.data || [];
    const yearInt = Number(selectedYear);

    if (!selectedYear || isNaN(yearInt)) return [];

    const months: MonthData[] = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: new Date(yearInt, i, 1).toLocaleDateString("id-ID", {
        month: "short",
      }),
      days: [],
      offset: 0,
    }));

    const colorMap: Record<string, string> = {
      BOROS: "bg-red-500",
      WARNING: "bg-orange-400",
      NORMAL: "bg-green-400",
      HEMAT: "bg-green-600",
      UNKNOWN: "bg-slate-200",
    };

    const dataMap = new Map(
      rawData.map((d) => {
        const dateObj = new Date(d.classification_date);
        return [getLocalDateString(dateObj), d];
      })
    );

    const start = new Date(yearInt, 0, 1);
    const end = new Date(yearInt, 11, 31);
    const dayCount =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < dayCount; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);

      if (current.getFullYear() !== yearInt) continue;

      const mIndex = current.getMonth();
      const dateStr = getLocalDateString(current);
      const entry = dataMap.get(dateStr);

      months[mIndex].days.push({
        id: i,
        dateObj: new Date(current),
        dateDisplay: current.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        color: colorMap[entry?.classification || "UNKNOWN"],
        status: entry?.classification || "No Data",
        confidence: entry?.confidence_score
          ? `${(entry.confidence_score * 100).toFixed(0)}%`
          : null,
      });
    }

    months.forEach((m) => {
      if (m.days.length > 0) {
        const firstDayOfWeek = m.days[0].dateObj.getDay();
        m.offset = firstDayOfWeek;
      }
    });

    return months;
  }, [apiResponse, selectedYear]);

  const statsSummary = useMemo(() => {
    const counts = { HEMAT: 0, NORMAL: 0, WARNING: 0, BOROS: 0, UNKNOWN: 0 };
    groupedData.forEach((m) => {
      m.days.forEach((d) => {
        const status = d.status as keyof typeof counts;
        if (counts[status] !== undefined) counts[status]++;
        else counts.UNKNOWN++;
      });
    });
    return counts;
  }, [groupedData]);

  const totalDays = groupedData.reduce((acc, m) => acc + m.days.length, 0);

  return {
    meters,
    groupedData,
    statsSummary,
    totalDays,
    isLoading: isLoadingMeters || isLoadingHeatmap,
    isLoadingMeters,
    isLoadingHeatmap,
  };
};
