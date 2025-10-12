// src/app/notification-center/page.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  NotificationOrAlert,
  fetchAllNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  bulkDeleteNotificationsApi,
  bulkDeleteAlertsApi,
  deleteAllApi,
  markAlertAsReadApi,
  fetchMeterAlertsApi,
  fetchSystemAlertsApi,
} from "@/services/notification.service";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TabType } from "../types";
import { NotificationHeader } from "./notificationTypes";
import { NotificationTabs } from "./notificationTabs";
import { NotificationActions } from "./notificationActions";
import { NotificationContent } from "./notificationContent";
import { DeleteConfirmationDialog } from "./deleteConfirmationDialog";

import { Tabs } from "@/components/ui/tabs";
const NotificationCenterPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogAction, setDialogAction] = useState<
    "delete-selected" | "delete-all" | null
  >(null);

  const queryFnMap: Record<TabType, () => Promise<any>> = {
    all: fetchAllNotificationsApi,
    meter: fetchMeterAlertsApi,
    system: fetchSystemAlertsApi,
  };

  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery<any, Error, NotificationOrAlert[]>({
    queryKey: ["notifications", activeTab],
    queryFn: queryFnMap[activeTab],
    select: (response) => {
      // PERBAIKAN: Akses data dengan aman, karena struktur respons API bisa berbeda.
      const data = response.data.data || [];

      if (activeTab === "all") {
        return data.map((item: any) => ({
          ...item,
          id: item.notification_id,
          type: "notification",
        }));
      }
      return data.map((item: any) => ({
        ...item,
        id: item.alert_id,
        type: "alert",
      }));
    },
  });

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const unreadCount = useMemo(
    () => (notifications || [])?.filter((n) => !n.is_read).length,
    [notifications]
  );

  const handleSuccess = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["notifications"] }); // Invalidate all tabs for consistency
    setSelectedIds(new Set());
    setDialogAction(null);
  };

  const handleError = (error: any, defaultMessage: string) => {
    const message = error.response?.data?.message || defaultMessage;
    toast.error(message);
  };

  const { mutate: markAsRead } = useMutation<
    any,
    Error,
    { id: string; type: "notification" | "alert" }
  >({
    mutationFn: ({ id, type }) =>
      type === "notification" ? markAsReadApi(id) : markAlertAsReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", activeTab] });
    },
    onError: (err) => handleError(err, "Gagal menandai notifikasi."),
  });

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMutation({
    mutationFn: (scope: TabType) => markAllAsReadApi(scope),
    onSuccess: () => handleSuccess("Semua notifikasi ditandai telah dibaca."),
    onError: (err) => handleError(err, "Gagal menandai semua notifikasi."),
  });

  const { mutate: markSelectedAsRead, isPending: isMarkingSelected } =
    useMutation({
      // PERBAIKAN: Logika untuk memanggil API yang benar berdasarkan tipe item.
      mutationFn: async (ids: string[]) => {
        const itemsToMark = (notifications || []).filter((n) =>
          ids.includes(n.id)
        );
        const promises = itemsToMark.map((item) =>
          item.type === "notification"
            ? markAsReadApi(item.id)
            : markAlertAsReadApi(item.id)
        );
        return Promise.all(promises);
      },
      onSuccess: () =>
        handleSuccess("Notifikasi terpilih ditandai telah dibaca."),
      onError: (err) => handleError(err, "Gagal menandai notifikasi."),
    });

  const { mutate: deleteSelected, isPending: isDeletingSelected } = useMutation(
    {
      // PERBAIKAN: Logika untuk memanggil endpoint delete yang benar.
      mutationFn: (params: { ids: string[]; scope: TabType }) => {
        if (params.scope === "all") {
          // Gunakan API notifikasi umum untuk tab "Semua"
          return bulkDeleteNotificationsApi(params.ids);
        }
        // Untuk scope 'meter' atau 'system'
        return bulkDeleteAlertsApi({
          alertIds: params.ids,
        });
      },
      onSuccess: () => handleSuccess("Notifikasi terpilih berhasil dihapus."),
      onError: (err) => handleError(err, "Gagal menghapus notifikasi."),
    }
  );

  const { mutate: deleteAll, isPending: isDeletingAll } = useMutation({
    mutationFn: (scope: TabType) => deleteAllApi(scope),
    onSuccess: () => handleSuccess("Semua notifikasi berhasil dihapus."),
    onError: (err) => handleError(err, "Gagal menghapus semua notifikasi."),
  });

  const handleSelect = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    newSelectedIds.has(id) ? newSelectedIds.delete(id) : newSelectedIds.add(id);
    setSelectedIds(newSelectedIds);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // PERBAIKAN: Pastikan `notifications` adalah array sebelum di-map.
      setSelectedIds(new Set((notifications || []).map((n) => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleNotificationClick = (notification: NotificationOrAlert) => {
    if (!notification.is_read) {
      markAsRead({ id: notification.id, type: notification.type });
    }
  };

  const handleConfirmDelete = () => {
    if (dialogAction === "delete-all") {
      deleteAll(activeTab);
    } else if (dialogAction === "delete-selected") {
      deleteSelected({
        ids: Array.from(selectedIds),
        scope: activeTab,
      });
    }
  };

  const isAllSelected =
    (notifications?.length ?? 0) > 0 &&
    selectedIds.size === notifications?.length;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="w-full"
        >
          <NotificationHeader unreadCount={unreadCount} />
          <CardHeader>
            <NotificationTabs />
          </CardHeader>
          <CardContent>
            {(notifications?.length ?? 0) > 0 && (
              <NotificationActions
                isAllSelected={isAllSelected}
                onSelectAll={handleSelectAll}
                selectedCount={selectedIds.size}
                isMarkingSelected={isMarkingSelected}
                onMarkSelectedRead={() =>
                  markSelectedAsRead(Array.from(selectedIds))
                }
                unreadCount={unreadCount}
                isMarkingAll={isMarkingAll}
                onMarkAllRead={() => markAllAsRead(activeTab)}
                isDeletingSelected={isDeletingSelected}
                onDeleteSelected={() => setDialogAction("delete-selected")}
                onDeleteAll={() => setDialogAction("delete-all")}
              />
            )}
            <NotificationContent
              isLoading={isLoading}
              isError={isError}
              notifications={notifications}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onItemClick={handleNotificationClick}
              activeTab={activeTab}
            />
          </CardContent>
        </Tabs>
      </Card>
      <DeleteConfirmationDialog
        open={!!dialogAction}
        onOpenChange={() => setDialogAction(null)}
        dialogAction={dialogAction}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmDelete}
        isPending={isDeletingAll || isDeletingSelected}
      />
    </div>
  );
};

export default NotificationCenterPage;
