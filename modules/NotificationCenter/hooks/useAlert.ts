import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkDeleteAlertApi,
  getAlertMetersApi,
  getAlertSystemApi,
  readAlertApi,
  readsAllAlertsApi,
} from "../services/alerts.service";
import { useMemo } from "react";
import { toast } from "sonner";

type AlertCategory = "meters" | "system";

export const useAlert = (category: AlertCategory = "meters") => {
  const queryClient = useQueryClient();

  const queryConfig = {
    meters: {
      key: ["alert-meter"],
      fn: getAlertMetersApi,
    },
    system: {
      key: ["alert-system"],
      fn: getAlertSystemApi,
    },
  };

  const currentConfig = queryConfig[category];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: currentConfig.key,
    queryFn: currentConfig.fn,
  });

  const alertsData = useMemo(() => data?.data?.alerts || [], [data]);
  const meta = useMemo(() => data?.data?.meta, [data]);

  const handleMutationSuccess = (message: string) => {
    toast.success(message);

    queryClient.invalidateQueries({ queryKey: currentConfig.key });
  };

  const handleMutationError = (error) => {
    const msg = error?.response?.data?.message || "Terjadi kesalahan sistem";
    toast.error(msg);
  };

  const { mutate: readAlert, isPending: isReading } = useMutation({
    mutationFn: (alertId: number) => readAlertApi(alertId),
    onSuccess: (res) =>
      handleMutationSuccess(res.status?.message || "Berhasil dibaca"),
    onError: handleMutationError,
  });

  const { mutate: markAlertsAsRead, isPending: isMarking } = useMutation({
    mutationFn: (ids: number[]) => readsAllAlertsApi(ids),
    onSuccess: (res) =>
      handleMutationSuccess(
        res.status?.message || "Notifikasi ditandai dibaca"
      ),
    onError: handleMutationError,
  });

  const { mutate: bulkDelete, isPending: isDeleting } = useMutation({
    mutationFn: (ids: number[]) => bulkDeleteAlertApi(ids),
    onSuccess: (res) =>
      handleMutationSuccess(res.status?.message || "Data berhasil dihapus"),
    onError: handleMutationError,
  });

  return {
    alertsData,
    meta,
    readAlert,
    markAlertsAsRead,
    bulkDelete,
    isLoadingData: isLoading,
    isProcessing: isReading || isMarking || isDeleting,
    isError,
    error,
    refetch,
  };
};
