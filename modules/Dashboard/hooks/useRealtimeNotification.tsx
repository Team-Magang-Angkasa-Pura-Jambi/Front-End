"use client";

import { useQuery } from "@tanstack/react-query";
import { Droplets, Fuel, Plane, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getTodaySummaryApi } from "../service/visualizations.service";

export const useRealtimeNotification = () => {
  const shownNotifications = useRef(new Set<string>());

  const { data: todaySummaryResponse } = useQuery({
    queryKey: ["new-data-notifications"],
    queryFn: getTodaySummaryApi,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!todaySummaryResponse?.data) return;
    const { sumaries, meta } = todaySummaryResponse.data;

    sumaries?.forEach((notif) => {
      const id = `summary-${notif.summary_id}-${notif.total_consumption}`;

      if (!shownNotifications.current.has(id)) {
        const isFuel = notif.type_name === "Fuel";
        const isWater = notif.type_name === "Water";

        toast(
          `Update ${notif.type_name}: ${notif.total_consumption.toLocaleString("id-ID")} ${notif.unit_of_measurement}`,
          {
            description: `Meteran ${notif.meter_code} aktif.`,
            icon: isFuel ? (
              <Fuel className="text-orange-500" />
            ) : isWater ? (
              <Droplets className="text-blue-500" />
            ) : (
              <Zap className="text-yellow-500" />
            ),
            className: isFuel ? "border-orange-200 bg-orange-50" : "",
          }
        );

        shownNotifications.current.add(id);
      }
    });

    if (meta && meta.pax !== null) {
      const id = `pax-${meta.date}-${meta.pax}`;

      if (!shownNotifications.current.has(id)) {
        toast(`Arus Penumpang: ${meta.pax.toLocaleString("id-ID")} Pax`, {
          description: "Data volume penumpang baru saja diperbarui.",
          icon: <Plane className="text-sky-500" />,
        });

        shownNotifications.current.add(id);
      }
    }
  }, [todaySummaryResponse]);
};
