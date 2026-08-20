// NotificationCenter/hooks/useNotification.ts
import { ApiResponse } from "@/common/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NotificationPayload, notificationService } from "../services/notification.service";

export const useNotification = () => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["notifications"];

  // 1. Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: notificationService.getAll,
    refetchInterval: 30000, // Auto refresh tiap 30 detik
  });

  // 2. Mutasi: Tandai 1 Dibaca (Optimistic Update)
  const markAsRead = useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousData = queryClient.getQueryData<ApiResponse<NotificationPayload>>(QUERY_KEY);

      if (previousData) {
        queryClient.setQueryData<ApiResponse<NotificationPayload>>(QUERY_KEY, {
          ...previousData,
          data: {
            ...previousData.data,
            notifications: previousData.data.notifications.map((notif) =>
              notif.notification_id === id ? { ...notif, is_read: true } : notif
            ),
          },
        });
      }
      return { previousData };
    },
    onError: (__err, __id, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousData);
      toast.error("Gagal menandai notifikasi");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // 3. Mutasi: Tandai Banyak Dibaca (Optimistic Update)
  const bulkMarkAsRead = useMutation({
    mutationFn: notificationService.bulkMarkAsRead,
    onMutate: async (ids: number[]) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousData = queryClient.getQueryData<ApiResponse<NotificationPayload>>(QUERY_KEY);

      if (previousData) {
        queryClient.setQueryData<ApiResponse<NotificationPayload>>(QUERY_KEY, {
          ...previousData,
          data: {
            ...previousData.data,
            notifications: previousData.data.notifications.map((notif) =>
              ids.includes(notif.notification_id) ? { ...notif, is_read: true } : notif
            ),
          },
        });
      }
      return { previousData };
    },
    onError: (__err, __ids, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousData);
      toast.error("Gagal menandai notifikasi");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // 4. Mutasi: Hapus Banyak Notifikasi (Optimistic Update)
  const bulkDelete = useMutation({
    mutationFn: notificationService.bulkDelete,
    onMutate: async (ids: number[]) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousData = queryClient.getQueryData<ApiResponse<NotificationPayload>>(QUERY_KEY);

      if (previousData) {
        queryClient.setQueryData<ApiResponse<NotificationPayload>>(QUERY_KEY, {
          ...previousData,
          data: {
            ...previousData.data,
            // Filter out (buang) notifikasi yang ID-nya ada di dalam array 'ids'
            notifications: previousData.data.notifications.filter(
              (notif) => !ids.includes(notif.notification_id)
            ),
          },
        });
      }
      return { previousData };
    },
    onError: (__err, __ids, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousData);
      toast.error("Gagal menghapus notifikasi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Notifikasi berhasil dihapus");
    },
  });

  // 5. Ekstraksi dan Kalkulasi Data untuk UI
  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Kombinasi state loading dari semua mutasi untuk trigger overlay di UI
  const isProcessing = markAsRead.isPending || bulkMarkAsRead.isPending || bulkDelete.isPending;

  return {
    notifications,
    unreadCount,
    isLoading,
    isProcessing,
    markAsRead: markAsRead.mutate,
    bulkMarkAsRead: bulkMarkAsRead.mutate,
    bulkDelete: bulkDelete.mutate,
  };
};
