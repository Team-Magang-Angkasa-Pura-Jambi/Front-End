"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Plane, Droplets, Zap, Fuel } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTodaySummaryApi } from "@/services/analysis.service";

export const useRealtimeNotification = () => {
  const shownNotifications = useRef(new Set<string>());

  const { data: todaySummaryResponse } = useQuery({
    queryKey: ["new-data-notifications"],
    queryFn: getTodaySummaryApi,

    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    const responseData = todaySummaryResponse?.data.sumaries;
    const metaData = todaySummaryResponse?.data.meta;

    if (!responseData) return;

    if (responseData.length > 0) {
      responseData.forEach((notif) => {
        const notificationId = `summary-${notif.summary_id}`;

        if (!shownNotifications.current.has(notificationId)) {
          const consumption = notif.total_consumption;

          let Icon = Zap;
          if (notif.type_name === "Water") Icon = Droplets;
          if (notif.type_name === "Fuel") Icon = Fuel;

          toast(
            `+${consumption.toLocaleString("id-ID")} ${notif.unit_of_measurement} Baru`,
            {
              description: `Meteran ${notif.meter_code} (${notif.type_name}) baru saja diperbarui.`,
              icon: <Icon className="text-primary h-5 w-5" />,
              duration: 5000,
            }
          );

          shownNotifications.current.add(notificationId);
        }
      });
    }

    if (metaData && metaData.pax !== null) {
      const paxNotificationId = `pax-${metaData.date}-${metaData.pax}`;

      if (!shownNotifications.current.has(paxNotificationId)) {
        toast(
          `Update Penumpang: ${metaData.pax.toLocaleString("id-ID")} Orang`,
          {
            description: `Total data penumpang tercatat untuk hari ini.`,
            icon: <Plane className="h-5 w-5 text-sky-500" />,
          }
        );
        shownNotifications.current.add(paxNotificationId);
      }
    }
  }, [todaySummaryResponse]);
};
