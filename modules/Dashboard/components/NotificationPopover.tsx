"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Bell,
  Loader2,
  Inbox,
  CheckCircle2,
  Radio,
  AlertTriangle,
  Info,
} from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotification } from "@/modules/NotificationCenter/hooks/useNotification";
import { useAlert } from "@/modules/NotificationCenter/hooks/useAlert";
import { NotificationUI } from "@/modules/NotificationCenter/types";

export const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { alertsData, isLoadingData: loadingAlerts, readAlert } = useAlert();

  const {
    notificationsData,
    isLoadingData: loadingNotifs,
    readNotification,
  } = useNotification();

  const combinedNotifications: NotificationUI[] = useMemo(() => {
    const alerts: NotificationUI[] = (alertsData || []).map((a) => ({
      id: `alert-${a.alert_id}`,
      rawId: a.alert_id,
      type: "alert",
      title: a.title,
      description: a.description,
      date: a.alert_timestamp,
      is_read: a.status !== "NEW",
      status: a.status,
    }));

    const notifs: NotificationUI[] = (notificationsData || []).map((n) => ({
      id: `notif-${n.notification_id}`,
      rawId: n.notification_id,
      type: "notification",
      title: n.title,
      description: n.message,
      date: n.created_at,
      is_read: n.is_read,
      status: "INFO",
    }));

    return [...alerts, ...notifs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [alertsData, notificationsData]);

  const isLoading = loadingAlerts || loadingNotifs;

  const unreadCount = useMemo(
    () => combinedNotifications.filter((n) => !n.is_read).length,
    [combinedNotifications]
  );

  const handleItemClick = (item: NotificationUI) => {
    if (!item.is_read) {
      if (item.type === "alert") readAlert(item.rawId);
      else readNotification(item.rawId);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-all duration-300",
            unreadCount > 0
              ? "text-primary hover:text-primary hover:bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-pulse")} />

          {/* Badge Counter */}
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
              <span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-destructive border-background relative inline-flex h-2.5 w-2.5 rounded-full border"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "mr-4 w-[380px] p-0 shadow-2xl",
          "bg-card border-border border",
          "border-t-primary border-t-[4px]"
        )}
        align="end"
      >
        {/* --- Header --- */}
        <div className="border-border bg-muted/20 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio
              className={cn(
                "h-4 w-4",
                unreadCount > 0
                  ? "text-primary animate-pulse"
                  : "text-muted-foreground"
              )}
            />
            <h4 className="text-foreground text-sm font-bold tracking-tight">
              System Logs
            </h4>
          </div>

          {unreadCount > 0 ? (
            <span className="text-primary bg-primary/10 border-primary/20 rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {unreadCount} New
            </span>
          ) : (
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider opacity-70">
              All Clear
            </span>
          )}
        </div>

        <ScrollArea className="relative h-[400px]">
          {/* Grid Texture */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05]" />

          <div className="relative z-10 p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="text-primary/50 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground animate-pulse text-xs">
                  Synchronizing data...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && combinedNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-80">
                <div className="bg-muted ring-border mb-3 rounded-full p-4 ring-1">
                  <Inbox className="text-muted-foreground h-8 w-8" />
                </div>
                <p className="text-foreground text-sm font-bold">System Idle</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  No new activities recorded.
                </p>
              </div>
            )}

            {/* List Data */}
            {!isLoading &&
              combinedNotifications.map((item) => {
                const isAlert = item.type === "alert";
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "border-border/50 group relative cursor-pointer border-b p-4 transition-all duration-200 last:border-0",
                      "hover:bg-muted/40",
                      !item.is_read
                        ? "bg-primary/[0.03] before:bg-primary before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px]"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon Status */}
                      <div
                        className={cn(
                          "mt-0.5 shrink-0 rounded-full p-1.5",
                          !item.is_read
                            ? isAlert
                              ? "bg-red-500/10 text-red-500"
                              : "bg-blue-500/10 text-blue-500"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.is_read ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : isAlert ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          <Info className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "pr-2 text-sm leading-tight",
                              !item.is_read
                                ? "text-foreground font-bold"
                                : "text-muted-foreground font-medium"
                            )}
                          >
                            {item.title}
                          </p>

                          <span className="text-muted-foreground/70 shrink-0 whitespace-nowrap font-mono text-[10px] tabular-nums">
                            {formatDistanceToNow(new Date(item.date), {
                              addSuffix: false,
                              locale: localeId,
                            }).replace("sekitar ", "")}
                          </span>
                        </div>

                        <p
                          className={cn(
                            "line-clamp-2 text-xs leading-relaxed",
                            !item.is_read
                              ? "text-muted-foreground"
                              : "text-muted-foreground/70"
                          )}
                        >
                          {item.description}
                        </p>

                        {/* Tag Kecil untuk Alert */}
                        {isAlert && !item.is_read && (
                          <span className="bg-destructive/10 text-destructive border-destructive/20 mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] font-bold">
                            ACTION REQUIRED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>

        {/* --- Footer --- */}
        <div className="border-border bg-muted/20 border-t p-2">
          <Link
            href="/notification-center"
            className="block w-full"
            onClick={() => setIsOpen(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 w-full text-xs font-medium uppercase tracking-wider transition-colors"
            >
              Open Notification Center
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
