"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Inbox, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/common/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card"; // Pastikan import Card ada
import { ScrollArea } from "@/common/components/ui/scroll-area";
import {
  fetchAllNotificationsApi,
  markAsReadApi,
} from "@/services/notification.service";
import { cn } from "@/lib/utils";

// Interface sederhana untuk tipe data notifikasi
interface NotificationItem {
  notification_id: string;
  title: string;
  description?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationPopover = () => {
  const queryClient = useQueryClient();

  // Query Data
  const {
    data: notifications = [], // Default ke array kosong
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allNotifications"],
    queryFn: fetchAllNotificationsApi,
    staleTime: 1000 * 60,
    // Pastikan select mengembalikan array notifikasi yang benar
    select: (response) => response.data || [],
  });

  // Mutation Mark as Read
  const { mutate: markAsRead } = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNotifications"] });
      // Invalidate query lain jika perlu, misal badge count global
    },
  });

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
  };

  const unreadCount = notifications?.filter(
    (n: NotificationItem) => !n.is_read
  ).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-background dark:hover:bg-background transition-colors"
        >
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] p-0 mr-4 shadow-xl border-slate-200dark:border-slate-800"
        align="end"
      >
        {/* Header Popover */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50 dark:bg-slate-950 ">
          <h4 className="font-semibold text-sm">Notifikasi</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground bg-background dark:bg-background px-2 py-0.5 rounded-full">
              {unreadCount} baru
            </span>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-3 flex flex-col gap-3">
            {/* State Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">
                  Memuat notifikasi...
                </p>
              </div>
            )}

            {/* State Error */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-8 text-red-500 gap-2">
                <p className="text-sm font-medium">Gagal memuat data</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["allNotifications"],
                    })
                  }
                >
                  Coba Lagi
                </Button>
              </div>
            )}

            {/* State Kosong */}
            {!isLoading && !isError && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-background dark:bg-background p-3 rounded-full mb-3">
                  <Inbox className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Tidak ada notifikasi
                </p>
                <p className="text-xs text-muted-foreground mt-1 px-8">
                  Kami akan memberi tahu Anda jika ada pembaruan penting.
                </p>
              </div>
            )}

            {/* List Notifikasi dengan Card */}
            {!isLoading &&
              notifications?.map((notif: NotificationItem) => (
                <Card
                  key={notif.notification_id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md hover:border-primary/50 group relative overflow-hidden",
                    // Styling khusus untuk yang belum dibaca
                    !notif.is_read
                      ? "bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-l-blue-500"
                      : "bg-card hover:bg-accent/50"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Ikon Status */}
                      <div
                        className={cn(
                          "mt-0.5 p-1.5 rounded-full shrink-0",
                          !notif.is_read
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-background text-slate-500 dark:bg-background"
                        )}
                      >
                        {!notif.is_read ? (
                          <Bell className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <p
                            className={cn(
                              "text-sm leading-none",
                              !notif.is_read
                                ? "font-bold text-slate-900 dark:text-slate-100"
                                : "font-medium text-slate-700 dark:text-slate-300"
                            )}
                          >
                            {notif.title}
                          </p>
                          {/* Titik indikator unread */}
                          {!notif.is_read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                          )}
                        </div>

                        {(notif.description || notif.message) && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notif.description || notif.message}
                          </p>
                        )}

                        <div className="flex items-center gap-1 pt-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <p className="text-[10px] text-slate-400 font-medium">
                            {notif.created_at &&
                              formatDistanceToNow(new Date(notif.created_at), {
                                addSuffix: true,
                                locale: id,
                              })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t b  text-center">
          <Link href="/notification-center" className="w-full block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-8 text-primary hover:text-primary hover:bg-primary/10"
            >
              Lihat Semua Notifikasi
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
