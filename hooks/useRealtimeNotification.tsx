"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { BellPlus, Plane } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTodaySummaryApi, // Menggunakan API yang benar
} from "@/services/notification.service";

/**
 * Hook untuk mengambil data ringkasan harian secara real-time (polling).
 * Hook ini akan menampilkan notifikasi toast jika ada data baru.
 */
export const useRealtimeNotification = () => {
  // Menggunakan useRef untuk melacak notifikasi yang sudah ditampilkan
  // agar tidak muncul berulang kali untuk data yang sama.
  const shownNotifications = useRef(new Set<string>());

  const { data: todaySummaryResponse } = useQuery({
    queryKey: ["new-data-notifications"],
    queryFn: fetchTodaySummaryApi,
    // Polling: React Query akan otomatis memanggil API ini setiap 30 detik
    refetchInterval: 18000000, // 5 jam
    refetchOnWindowFocus: true, // Fetch ulang saat user kembali ke tab ini
    staleTime: 15000, // Anggap data fresh selama 15 detik
  });

  useEffect(() => {
    // Akses data utama dari respons API
    const responseData = todaySummaryResponse?.data;
    if (!responseData) return;

    const { meta, data: energyNotifications } = responseData;

    // 1. Proses notifikasi untuk data energi
    if (energyNotifications && energyNotifications.length > 0) {
      energyNotifications.forEach((notif) => {
        const consumption = parseFloat(notif.total_consumption);
        // Buat ID unik untuk setiap notifikasi agar tidak duplikat
        const notificationId = `${notif.meter.meter_code}-${notif.summary_id}`;

        if (!shownNotifications.current.has(notificationId)) {
          toast(`+${consumption.toLocaleString("id-ID")} Data Baru`, {
            description: `Meteran ${notif.meter.meter_code} baru saja diperbarui.`,
            icon: <BellPlus className="h-5 w-5" />,
          });
          shownNotifications.current.add(notificationId);
        }
      });
    }

    // 2. Proses notifikasi untuk data Pax
    if (meta && meta.pax) {
      // Buat ID unik berdasarkan tanggal untuk notifikasi pax
      const paxNotificationId = `pax-${meta.date}`;

      if (!shownNotifications.current.has(paxNotificationId)) {
        toast(`+${meta.pax.toLocaleString("id-ID")} Penumpang Hari Ini`, {
          description: `Data penumpang untuk hari ini telah diperbarui.`,
          icon: <Plane className="h-5 w-5" />,
        });
        shownNotifications.current.add(paxNotificationId);
      }
    }
  }, [todaySummaryResponse]);
};
