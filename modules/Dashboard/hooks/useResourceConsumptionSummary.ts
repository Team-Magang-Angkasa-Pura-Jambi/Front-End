import { useQuery } from "@tanstack/react-query";
import { Plane, Zap } from "lucide-react";
import { useMemo } from "react";
import { statConfig } from "../components/resourceConsumptionSummary/constants";
import { getMetricCard } from "../service/visualizations.service";

export const useResourceConsumptionSummary = (year: number, month: number) => {
  const {
    data: cardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboardSummary", year, month],
    queryFn: () => getMetricCard(year, month),

    staleTime: 1000 * 60 * 5,
  });

  const processedStats = useMemo(() => {
    const metrics = cardData?.data.overview_metrics;
    if (!metrics) return [];

    const { energy, pax, card_config } = metrics as any;

    const energyStats = Object.entries(energy || {})
      .filter(([key]) => {
        const lower = key.toLowerCase();
        if (card_config?.[lower] && card_config[lower].show === false) {
          return false;
        }
        return true;
      })
      .map(([key, item]: [string, any]) => {
        const lower = key.toLowerCase();
        const customTitle = card_config?.[lower]?.title;
        const formattedLabel = customTitle || key.charAt(0).toUpperCase() + key.slice(1);

        const config =
          statConfig[key.charAt(0).toUpperCase() + key.slice(1)] ||
          statConfig[key] || {
            icon: Zap,
            iconBgColor: "bg-gray-500",
          };

        return {
          icon: config.icon,
          label: formattedLabel,
          value: (item.consumption.current_value ?? 0).toLocaleString("id-ID"),
          unit: item.consumption.unit,
          iconBgColor: config.iconBgColor,
          percentageChange: item.consumption.growth_percentage,
        };
      });

    const isPaxVisible = card_config?.pax?.show !== false;
    const paxTitle = card_config?.pax?.title || "Pax";

    if (isPaxVisible) {
      return [
        ...energyStats,
        {
          icon: Plane,
          label: paxTitle,
          value: (pax?.current_value ?? 0).toLocaleString("id-ID"),
          unit: pax?.unit ?? "Orang",
          iconBgColor: "bg-red-500",
          percentageChange: pax?.growth_percentage ?? 0,
        },
      ];
    }

    return energyStats;
  }, [cardData]);

  return {
    cardData,
    processedStats,
    isLoading,
    isError,
    error,
  };
};
