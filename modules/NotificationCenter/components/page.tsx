// src/app/notification-center/page.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertNotification,
  fetchAllNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  bulkDeleteNotificationsApi,
  deleteAllNotificationsApi,
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
  } = useQuery({
    queryKey: ["notifications", activeTab],
    queryFn: queryFnMap[activeTab],
    select: (data) => data.data,
  });

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);
  console.log(notifications?.data?.data);

  const unreadCount = useMemo(
    () => (notifications?.data || [])?.filter((n) => !n.is_read).length,
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

  const { mutate: markAsRead } = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", activeTab] });
    },
    onError: (err) => handleError(err, "Gagal menandai notifikasi."),
  });

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllAsReadApi,
    onSuccess: () => handleSuccess("Semua notifikasi ditandai telah dibaca."),
    onError: (err) => handleError(err, "Gagal menandai semua notifikasi."),
  });

  const { mutate: markSelectedAsRead, isPending: isMarkingSelected } =
    useMutation({
      mutationFn: async (ids: string[]) => Promise.all(ids.map(markAsReadApi)),
      onSuccess: () =>
        handleSuccess("Notifikasi terpilih ditandai telah dibaca."),
      onError: (err) => handleError(err, "Gagal menandai notifikasi."),
    });

  const { mutate: deleteSelected, isPending: isDeletingSelected } = useMutation(
    {
      mutationFn: (ids: string[]) => bulkDeleteNotificationsApi(ids),
      onSuccess: () => handleSuccess("Notifikasi terpilih berhasil dihapus."),
      onError: (err) => handleError(err, "Gagal menghapus notifikasi."),
    }
  );

  const { mutate: deleteAll, isPending: isDeletingAll } = useMutation({
    mutationFn: deleteAllNotificationsApi,
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
      setSelectedIds(
        new Set((notifications?.data || []).map((n) => n.notification_id))
      );
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleNotificationClick = (notification: AlertNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
  };

  const handleConfirmDelete = () => {
    if (dialogAction === "delete-all") {
      deleteAll();
    } else if (dialogAction === "delete-selected") {
      deleteSelected(Array.from(selectedIds));
    }
  };

  const isAllSelected =
    (notifications?.data?.length ?? 0) > 0 &&
    selectedIds.size === notifications?.data?.length;

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
            {(notifications?.data?.length ?? 0) > 0 && (
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
                onMarkAllRead={() => markAllAsRead()}
                isDeletingSelected={isDeletingSelected}
                onDeleteSelected={() => setDialogAction("delete-selected")}
                onDeleteAll={() => setDialogAction("delete-all")}
              />
            )}
            <NotificationContent
              isLoading={isLoading}
              isError={isError}
              notifications={notifications?.data}
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
