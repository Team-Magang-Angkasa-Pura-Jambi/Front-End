"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Card, CardContent } from "@/common/components/ui/card";
import { useNotification } from "../hooks/useNotification";
import { NotificationItem } from "../types";
import { DeleteConfirmationDialog } from "./deleteConfirmationDialog";
import { NotificationActions } from "./notificationActions";
import { NotificationContent } from "./notificationContent";
import { NotificationHeader } from "./notificationTypes";

const NotificationCenterPage = () => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dialogAction, setDialogAction] = useState<"delete-selected" | "delete-all" | null>(null);

  const { notifications, isLoading, isProcessing, markAsRead, bulkMarkAsRead, bulkDelete } =
    useNotification();

  // Pro-Dev: Data langsung dipassing. Filter & Sorting idealnya sudah ditangani dari Backend.
  const displayData = notifications || [];

  const unreadCount = useMemo(() => displayData.filter((n) => !n.is_read).length, [displayData]);
  const isListEmpty = displayData.length === 0;
  const isAllSelected = !isListEmpty && selectedIds.size === displayData.length;

  const handleMarkSelectedRead = useCallback(() => {
    if (selectedIds.size > 0) {
      bulkMarkAsRead(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }, [selectedIds, bulkMarkAsRead]);

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = displayData.filter((n) => !n.is_read).map((n) => n.notification_id);
    if (unreadIds.length > 0) {
      bulkMarkAsRead(unreadIds);
    }
  }, [displayData, bulkMarkAsRead]);

  const handleConfirmDelete = useCallback(() => {
    const targetIds =
      dialogAction === "delete-all"
        ? displayData.map((d) => d.notification_id)
        : Array.from(selectedIds);

    if (targetIds.length > 0) {
      bulkDelete(targetIds);
    }

    setDialogAction(null);
    setSelectedIds(new Set());
  }, [dialogAction, displayData, selectedIds, bulkDelete]);

  const handleItemClick = useCallback(
    (item: NotificationItem) => {
      if (!item.is_read) {
        markAsRead(item.notification_id);
      }
    },
    [markAsRead]
  );

  const handleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && displayData.length > 0) {
        setSelectedIds(new Set(displayData.map((n) => n.notification_id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [displayData]
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Card className="border-t-primary bg-card overflow-hidden border-t-4 shadow-lg">
        {/* HEADER */}
        <div className="border-border/50 bg-muted/5 flex items-center justify-between border-b px-6 py-5">
          <NotificationHeader unreadCount={unreadCount} />
          {isLoading && (
            <div className="text-muted-foreground flex animate-pulse items-center gap-2 text-xs font-medium tracking-wide">
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
        </div>

        <CardContent className="p-0">
          {/* TOOLBAR */}
          <div className="border-border/40 bg-background/80 sticky top-0 z-10 border-b px-6 py-3 backdrop-blur-md">
            <NotificationActions
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
              selectedCount={selectedIds.size}
              unreadCount={unreadCount}
              isMarkingAll={false}
              isMarkingSelected={isProcessing}
              isDeletingSelected={isProcessing}
              onMarkSelectedRead={handleMarkSelectedRead}
              onMarkAllRead={handleMarkAllRead}
              onDeleteSelected={() => setDialogAction("delete-selected")}
              onDeleteAll={() => setDialogAction("delete-all")}
              isDisabled={isLoading || isProcessing || isListEmpty}
            />
          </div>

          {/* CONTENT LIST */}
          <div className="relative min-h-[400px] bg-slate-50/50 dark:bg-slate-950/20">
            <NotificationContent
              isLoading={isLoading}
              isError={false}
              notifications={displayData}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onItemClick={handleItemClick}
            />

            {/* Loading Overlay (Optimized) */}
            {isProcessing && (
              <div className="bg-background/40 absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                <div className="rounded-full bg-white p-3 shadow-xl dark:bg-slate-800">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
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
