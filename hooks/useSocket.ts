// src/hooks/useSocket.ts
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket"; // Impor instance socket yang dibagikan

export const useSocketListeners = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const recalculationToastId = useRef<string | number | null>(null);

  useEffect(() => {
    // Bergabung ke room pribadi setelah user teridentifikasi dan socket terhubung
    if (user && socket.connected) {
      const userId = String(user.id);
      socket.emit("join_room", userId);
      console.log(`Socket client bergabung ke room: ${userId}`);
    }
  }, [user, socket.connected]); // Dijalankan saat user atau status koneksi berubah

  useEffect(() => {
    // Listener untuk notifikasi umum dari backend
    const onNewNotification = (payload: {
      title: string;
      message: string;
      link?: string;
    }) => {
      console.log("Menerima notifikasi umum:", payload);
      toast.info(payload.title, {
        description: payload.message,
        action: payload.link
          ? {
              label: "Lihat",
              onClick: () => window.open(payload.link, "_blank"),
            }
          : undefined,
      });
      // Invalidate query untuk me-refresh daftar notifikasi jika ada
      queryClient.invalidateQueries({ queryKey: ["latestNotification"] });
    };

    // --- Listener untuk proses kalkulasi ulang ---

    const onRecalculationProgress = (payload: {
      processed: number;
      total: number;
    }) => {
      const progress = Math.round((payload.processed / payload.total) * 100);
      const message = `Memproses data rekapitulasi... (${progress}%)`;

      if (recalculationToastId.current) {
        toast.loading(message, { id: recalculationToastId.current });
      } else {
        recalculationToastId.current = toast.loading(message);
      }
    };

    const onRecalculationSuccess = (payload: { message: string }) => {
      if (recalculationToastId.current) {
        toast.success(payload.message, { id: recalculationToastId.current });
        recalculationToastId.current = null;
      } else {
        toast.success(payload.message);
      }
      queryClient.invalidateQueries({ queryKey: ["recapData"] });
    };

    const onRecalculationError = (payload: { message: string }) => {
      if (recalculationToastId.current) {
        toast.error(payload.message, { id: recalculationToastId.current });
        recalculationToastId.current = null;
      } else {
        toast.error(payload.message);
      }
    };

    // Listener untuk notifikasi lama (jika masih digunakan)
    const onNewNotificationAvailable = () => {
      console.log(
        "Sinyal 'new_notification_available' diterima! Memuat ulang data notifikasi..."
      );
      queryClient.invalidateQueries({ queryKey: ["latestNotification"] });
    };

    // Listener dari Header.tsx (untuk konsolidasi)
    const onRecalculationComplete = (data: { message?: string }) => {
      const message = data.message || "Perhitungan ulang selesai!";
      toast.success(message, {
        description: "Data rekap telah berhasil diperbarui.",
      });
      queryClient.invalidateQueries({ queryKey: ["recapData"] });
    };

    // Daftarkan listener ke event 'new_notification'
    socket.on("new_notification", onNewNotification);
    socket.on("recalculation:progress", onRecalculationProgress);
    socket.on("recalculation:success", onRecalculationSuccess);
    socket.on("recalculation:error", onRecalculationError);
    socket.on("new_notification_available", onNewNotificationAvailable); // Dari SocketProvider
    socket.on("recalculation_complete", onRecalculationComplete); // Dari Header.tsx

    // Fungsi cleanup untuk menghapus listener saat komponen unmount
    return () => {
      socket.off("new_notification", onNewNotification);
      socket.off("recalculation:progress", onRecalculationProgress);
      socket.off("recalculation:success", onRecalculationSuccess);
      socket.off("recalculation:error", onRecalculationError);
      socket.off("new_notification_available", onNewNotificationAvailable);
      socket.off("recalculation_complete", onRecalculationComplete);
    };
  }, [queryClient]);
};
