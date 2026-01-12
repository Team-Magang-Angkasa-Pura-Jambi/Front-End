"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Inbox, Clock, CheckCircle2, Radio } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/common/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
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
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allNotifications"],
    queryFn: fetchAllNotificationsApi,
    staleTime: 1000 * 60,
    select: (response) => response.data || [],
  });

  // Mutation Mark as Read
  const { mutate: markAsRead } = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNotifications"] });
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
          className={cn(
            "relative transition-all duration-300",
            // Style tombol lonceng saat ada notif vs kosong
            unreadCount > 0
              ? "text-primary hover:text-primary hover:bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-pulse")} />

          {/* Badge Counter */}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-background"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-[380px] p-0 mr-4 shadow-2xl",
          // INDUSTRIAL THEME CONTAINER
          "bg-card border border-border",
          "border-t-[4px] border-t-primary" // Signature Top Border
        )}
        align="end"
      >
        {/* --- Header Popover --- */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground tracking-tight">
              System Logs
            </h4>
          </div>

          {unreadCount > 0 ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
              {unreadCount} New
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">
              All Clear
            </span>
          )}
        </div>

        <ScrollArea className="h-[400px] relative">
          {/* Background Grid Texture Halus */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />

          <div className="relative z-10 p-0">
            {/* State Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  Synchronizing data...
                </p>
              </div>
            )}

            {/* State Error */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
                <p className="text-sm font-bold">Connection Fault</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["allNotifications"],
                    })
                  }
                  className="h-7 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Retry Connection
                </Button>
              </div>
            )}

            {/* State Kosong */}
            {!isLoading && !isError && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-80">
                <div className="bg-muted p-4 rounded-full mb-3 ring-1 ring-border">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground">System Idle</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No new activities recorded.
                </p>
              </div>
            )}

            {/* List Notifikasi */}
            {!isLoading &&
              notifications?.map((notif: NotificationItem) => (
                <div
                  key={notif.notification_id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "group relative p-4 cursor-pointer transition-all duration-200 border-b border-border/50 last:border-0",
                    "hover:bg-muted/40",

                    // UNREAD STATE STYLING:
                    !notif.is_read
                      ? "bg-primary/[0.03] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-primary"
                      : "bg-transparent opacity-80 hover:opacity-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Status */}
                    <div
                      className={cn(
                        "mt-0.5 shrink-0",
                        !notif.is_read
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {!notif.is_read ? (
                        // Titik kedip untuk unread
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)] animate-pulse" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 opacity-50" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            !notif.is_read
                              ? "font-bold text-foreground"
                              : "font-medium text-muted-foreground"
                          )}
                        >
                          {notif.title}
                        </p>

                        {/* Waktu (Tabular Nums untuk kesan teknis) */}
                        <span className="text-[10px] text-muted-foreground/70 font-mono tabular-nums whitespace-nowrap shrink-0">
                          {notif.created_at &&
                            formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: false,
                              locale: id,
                            }).replace("sekitar ", "")}
                        </span>
                      </div>

                      {(notif.description || notif.message) && (
                        <p
                          className={cn(
                            "text-xs line-clamp-2 leading-relaxed",
                            !notif.is_read
                              ? "text-muted-foreground"
                              : "text-muted-foreground/70"
                          )}
                        >
                          {notif.description || notif.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>

        {/* --- Footer Popover --- */}
        <div className="p-2 border-t border-border bg-muted/20">
          <Link href="/notification-center" className="w-full block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors uppercase tracking-wider"
            >
              Open Notification Center
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
