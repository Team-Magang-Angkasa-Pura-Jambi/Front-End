"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import { Tabs } from "@/common/components/ui/tabs";
import { NotificationHeader } from "./notificationTypes";
import { NotificationTabs } from "./notificationTabs";
import { NotificationActions } from "./notificationActions";
import { NotificationContent } from "./notificationContent";
import { DeleteConfirmationDialog } from "./deleteConfirmationDialog";
import { NotificationUI, TabType } from "../types";
import { useAlert } from "../hooks/useAlert";
import { useNotification } from "../hooks/useNotification";

const NotificationCenterPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("generals");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogAction, setDialogAction] = useState<
    "delete-selected" | "delete-all" | null
  >(null);

  const {
    alertsData,
    readAlert,
    markAlertsAsRead,
    bulkDelete: deleteAlerts,
    isLoadingData: loadingAlerts,
    isProcessing: processingAlerts,
  } = useAlert();

  const {
    notificationsData,
    readNotification,
    markNotificationsAsRead,
    bulkDelete: deleteNotifs,
    isLoadingData: loadingNotifs,
    isProcessing: processingNotifs,
  } = useNotification();

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const displayData: NotificationUI[] = useMemo(() => {
    const normalizedAlerts: NotificationUI[] = (alertsData || []).map(
      (alert) => ({
        id: `alert-${alert.alert_id}`,
        rawId: alert.alert_id,
        type: "alert",
        title: alert.title,
        description: alert.description,
        date: alert.alert_timestamp,
        is_read: alert.status === "READ",
        status: alert.status,
        meter_code: alert.meter_code,
        energy_type: "Electricity",
        acknowledged_by: alert.acknowledged_by
          ? { username: alert.username }
          : null,
      })
    );

    const normalizedNotifs: NotificationUI[] = (notificationsData || []).map(
      (notif) => ({
        id: `notif-${notif.notification_id}`,
        rawId: notif.notification_id,
        type: "notification",
        title: notif.title,
        description: notif.message,
        date: notif.created_at,
        is_read: notif.is_read,
        status: "INFO",
      })
    );

    let combined: NotificationUI[] = [];
    if (activeTab === "generals") {
      combined = normalizedNotifs;
    } else if (activeTab === "meters") {
      combined = normalizedAlerts;
    } else if (activeTab === "system") {
      combined = normalizedNotifs;
    }

    return combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [alertsData, notificationsData, activeTab]);

  console.log(alertsData);

  const unreadCount = useMemo(
    () => displayData.filter((n) => !n.is_read).length,
    [displayData]
  );
  const isListEmpty = displayData.length === 0;
  const isAllSelected = !isListEmpty && selectedIds.size === displayData.length;
  const isLoading = loadingAlerts || loadingNotifs;
  const isProcessing = processingAlerts || processingNotifs;

  const splitIds = (ids: Set<string>) => {
    const alertIds: number[] = [];
    const notifIds: number[] = [];

    ids.forEach((id) => {
      const [type, rawId] = id.split("-");
      if (type === "alert") alertIds.push(Number(rawId));
      if (type === "notif") notifIds.push(Number(rawId));
    });

    return { alertIds, notifIds };
  };

  const handleMarkSelectedRead = () => {
    const { alertIds, notifIds } = splitIds(selectedIds);
    if (alertIds.length > 0) markAlertsAsRead(alertIds);
    if (notifIds.length > 0) markNotificationsAsRead(notifIds);
    setSelectedIds(new Set());
  };

  const handleConfirmDelete = () => {
    if (dialogAction === "delete-all") {
      const allIds = new Set(displayData.map((d) => d.id));
      const { alertIds, notifIds } = splitIds(allIds);
      if (alertIds.length > 0) deleteAlerts(alertIds);
      if (notifIds.length > 0) deleteNotifs(notifIds);
    } else if (dialogAction === "delete-selected") {
      const { alertIds, notifIds } = splitIds(selectedIds);
      if (alertIds.length > 0) deleteAlerts(alertIds);
      if (notifIds.length > 0) deleteNotifs(notifIds);
    }
    setDialogAction(null);
    setSelectedIds(new Set());
  };

  const handleItemClick = useCallback(
    (item: NotificationUI) => {
      if (!item.is_read) {
        if (item.type === "alert") readAlert(item.rawId);
        else readNotification(item.rawId);
      }
    },
    [readAlert, readNotification]
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && displayData.length > 0) {
        setSelectedIds(new Set(displayData.map((n) => n.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [displayData]
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card className="border-t-4 border-t-primary shadow-lg bg-card">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="w-full"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between pr-6 border-b border-border/50 bg-muted/5">
            <NotificationHeader unreadCount={unreadCount} />
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span>Syncing...</span>
              </div>
            )}
          </div>

          <CardHeader className="pb-2 pt-4 bg-muted/5">
            <NotificationTabs />
          </CardHeader>

          <CardContent className="p-0">
            {/* TOOLBAR */}
            <div className="px-6 py-3 border-b border-border/40 bg-background/50 sticky top-0 z-10 backdrop-blur-sm">
              <NotificationActions
                isAllSelected={isAllSelected}
                onSelectAll={handleSelectAll}
                selectedCount={selectedIds.size}
                unreadCount={unreadCount}
                isMarkingAll={false}
                isMarkingSelected={isProcessing}
                isDeletingSelected={isProcessing}
                onMarkSelectedRead={handleMarkSelectedRead}
                onMarkAllRead={() => {
                  handleMarkSelectedRead();
                }}
                onDeleteSelected={() => setDialogAction("delete-selected")}
                onDeleteAll={() => setDialogAction("delete-all")}
                isDisabled={isLoading || isProcessing || isListEmpty}
              />
            </div>

            {/* CONTENT LIST */}
            <div className="min-h-[400px] relative bg-slate-50/50 dark:bg-slate-950/20">
              <NotificationContent
                isLoading={isLoading}
                isError={false}
                notifications={displayData}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onItemClick={handleItemClick}
                activeTab={activeTab}
              />

              {/* Loading Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-50 flex flex-col gap-2 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    Processing...
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Tabs>
      </Card>

      <DeleteConfirmationDialog
        open={!!dialogAction}
        onOpenChange={() => setDialogAction(null)}
        dialogAction={dialogAction}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmDelete}
        isPending={isProcessing}
      />
    </div>
  );
};

export default NotificationCenterPage;
