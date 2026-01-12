import { summaryApi } from "@/services/summary.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { statConfig } from "../components/resourceConsumptionSummary/constants";
import { Plane, Zap } from "lucide-react";

export const useResourceConsumptionSummary = (year: string, month: string) => {
  const {
    data: cardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboardSummary", year, month],
    queryFn: () => summaryApi(year, month),
    staleTime: 1000 * 60 * 5,
  });

  const processedStats = useMemo(() => {
    if (!cardData?.data) return [];
    const { summary, totalPax } = cardData.data;

    const energyStats =
      summary?.map((item) => {
        const config = statConfig[item.energyType] || {
          icon: Zap,
          iconBgColor: "bg-gray-500",
        };
        return {
          icon: config.icon,
          label: item.energyType,
          value: (item.totalConsumption.currentValue ?? 0).toLocaleString(
            "id-ID"
          ),
          unit: item.unit,
          iconBgColor: config.iconBgColor,
          percentageChange: item.totalConsumption.percentageChange,
        };
      }) || [];

    return [
      ...energyStats,
      {
        icon: Plane,
        label: "Pax",
        value: (totalPax?.currentValue ?? 0).toLocaleString("id-ID"),
        unit: "Orang",
        iconBgColor: "bg-red-500",
        percentageChange: totalPax?.percentageChange,
      },
    ];
  }, [cardData]);

  return {
    cardData,
    processedStats,
    isLoading,
    isError,
    error,
  };
};
