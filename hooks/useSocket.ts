"use client";

import { socket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const useSocketListeners = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const recalculationToastId = useRef<string | number | null>(null);

  useEffect(() => {
    if (user && socket.connected) {
      const userId = String(user.id);
      socket.emit("join_room", userId);
      console.log(`Socket client bergabung ke room: ${userId}`);
    }
  }, [user]);

  useEffect(() => {
    const onNewNotification = (payload: { title: string; message: string; link?: string }) => {
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

      queryClient.invalidateQueries({ queryKey: ["latestNotification"] });
    };

    const onRecalculationProgress = (payload: { processed: number; total: number }) => {
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

    const onNewNotificationAvailable = () => {
      console.log("Sinyal 'new_notification_available' diterima! Memuat ulang data notifikasi...");
      queryClient.invalidateQueries({ queryKey: ["latestNotification"] });
    };

    const onRecalculationComplete = (data: { message?: string }) => {
      const message = data.message || "Perhitungan ulang selesai!";
      toast.success(message, {
        description: "Data rekap telah berhasil diperbarui.",
      });
      queryClient.invalidateQueries({ queryKey: ["recapData"] });
    };

    socket.on("new_notification", onNewNotification);
    socket.on("recalculation:progress", onRecalculationProgress);
    socket.on("recalculation:success", onRecalculationSuccess);
    socket.on("recalculation:error", onRecalculationError);
    socket.on("new_notification_available", onNewNotificationAvailable);
    socket.on("recalculation_complete", onRecalculationComplete);

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
