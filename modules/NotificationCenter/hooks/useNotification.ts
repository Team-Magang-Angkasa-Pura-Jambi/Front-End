import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { toast } from "sonner";
import {
  getNotificationApi,
  readAllNotificationsApi,
  readNotificationApi,
} from "../services/notification.service";
import { bulkDeleteNotificationsApi } from "@/services/notification.service";
import { AxiosError } from "axios";

export const useNotification = () => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["notifications"];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getNotificationApi,
  });

  const notificationsData = useMemo(
    () => data?.data.notifications || [],
    [data]
  );
  const meta = useMemo(() => data?.data.meta, [data]);

  const handleMutationSuccess = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const handleMutationError = (error: AxiosError<{ message: string }>) => {
    const msg = error?.response?.data?.message || "Terjadi kesalahan sistem";
    toast.error(msg);
  };

  const { mutate: readNotification, isPending: isReading } = useMutation({
    mutationFn: (id: number) => readNotificationApi(id),
    onSuccess: (res) =>
      handleMutationSuccess(res.status?.message || "Berhasil dibaca"),
    onError: handleMutationError,
  });

  const { mutate: markNotificationsAsRead, isPending: isMarking } = useMutation(
    {
      mutationFn: (ids: number[]) => readAllNotificationsApi(ids),
      onSuccess: (res) =>
        handleMutationSuccess(res.status?.message || "Ditandai dibaca"),
      onError: handleMutationError,
    }
  );

  const { mutate: bulkDelete, isPending: isDeleting } = useMutation({
    mutationFn: (ids: number[]) => bulkDeleteNotificationsApi(ids),
    onSuccess: (res) => handleMutationSuccess(res.status?.message || "Dihapus"),
    onError: handleMutationError,
  });

  return {
    notificationsData,
    meta,

    readNotification,
    markNotificationsAsRead,
    bulkDelete,

    isLoadingData: isLoading,
    isProcessing: isReading || isMarking || isDeleting,
    isError,
    error,
    refetch,
  };
};
