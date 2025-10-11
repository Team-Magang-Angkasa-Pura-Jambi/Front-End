"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import {
  Bell,
  Trash2,
  MailOpen,
  Mail,
  Inbox,
  Loader2,
  ServerCrash,
  CheckCheck,
} from "lucide-react";

import {
  AlertNotification,
  fetchAllNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  bulkDeleteNotificationsApi,
  deleteAllNotificationsApi,
} from "@/services/notification.service";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const NotificationCenterPage = () => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogAction, setDialogAction] = useState<
    "delete-selected" | "delete-all" | null
  >(null);

  const {
    data: notificationsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchAllNotificationsApi,
    select: (data) => data.data,
  });

  const notifications = notificationsResponse || [];

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const handleSuccess = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    setSelectedIds(new Set());
    setDialogAction(null);
  };

  const handleError = (error: any, defaultMessage: string) => {
    const message = error.response?.data?.message || defaultMessage;
    toast.error(message);
  };

  const { mutate: markAsRead } = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (err) => handleError(err, "Gagal menandai notifikasi."),
  });

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllAsReadApi,
    onSuccess: () => handleSuccess("Semua notifikasi ditandai telah dibaca."),
    onError: (err) => handleError(err, "Gagal menandai semua notifikasi."),
  });

  const { mutate: markSelectedAsRead, isPending: isMarkingSelected } =
    useMutation({
      mutationFn: async (ids: string[]) => {
        // API tidak mendukung bulk mark as read, jadi kita panggil satu per satu
        return Promise.all(ids.map((id) => markAsReadApi(id)));
      },
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
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleNotificationClick = (notification: AlertNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
  };

  const isAllSelected =
    notifications.length > 0 && selectedIds.size === notifications.length;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Memuat Notifikasi...</p>
        </div>
      );
    }
    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-destructive">
          <ServerCrash className="h-12 w-12" />
          <p className="mt-4 font-semibold">Gagal memuat data.</p>
        </div>
      );
    }
    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Inbox className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Kotak Masuk Kosong</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Anda belum memiliki notifikasi baru.
          </p>
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {notifications.map((notification) => (
          <li
            key={notification.notification_id}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
              notification.is_read
                ? "bg-background hover:bg-muted/50"
                : "bg-primary/5 border-primary/20 hover:bg-primary/10"
            )}
          >
            <Checkbox
              checked={selectedIds.has(notification.notification_id)}
              onCheckedChange={() => handleSelect(notification.notification_id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                {formatDistanceToNow(new Date(notification?.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </p>
            </div>
            {!notification.is_read && (
              <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bell /> Pusat Notifikasi
          </CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `Anda memiliki ${unreadCount} notifikasi belum dibaca.`
              : "Semua notifikasi sudah dibaca."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b pb-4 mb-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                aria-label="Pilih semua"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.size === 0 || isMarkingSelected}
                onClick={() => markSelectedAsRead(Array.from(selectedIds))}
              >
                <MailOpen className="mr-2 h-4 w-4" /> Tandai Terpilih
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={unreadCount === 0 || isMarkingAll}
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-2 h-4 w-4" /> Tandai Semua
              </Button>
              <div className="flex-grow" />
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedIds.size === 0 || isDeletingSelected}
                onClick={() => setDialogAction("delete-selected")}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Hapus Terpilih
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDialogAction("delete-all")}
                disabled={isDeletingAll}
              >
                Hapus Semua
              </Button>
            </div>
          )}
          {renderContent()}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!dialogAction}
        onOpenChange={() => setDialogAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "delete-all"
                ? "Apakah Anda yakin ingin menghapus SEMUA notifikasi? Tindakan ini tidak dapat dibatalkan."
                : `Apakah Anda yakin ingin menghapus ${selectedIds.size} notifikasi yang dipilih?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialogAction === "delete-all") deleteAll();
                if (dialogAction === "delete-selected")
                  deleteSelected(Array.from(selectedIds));
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationCenterPage;
