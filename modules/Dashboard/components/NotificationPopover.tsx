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
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive border border-background"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-[380px] p-0 mr-4 shadow-2xl",
          "bg-card border border-border",
          "border-t-[4px] border-t-primary"
        )}
        align="end"
      >
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Radio
              className={cn(
                "h-4 w-4",
                unreadCount > 0
                  ? "text-primary animate-pulse"
                  : "text-muted-foreground"
              )}
            />
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
          {/* Grid Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />

          <div className="relative z-10 p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  Synchronizing data...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && combinedNotifications.length === 0 && (
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

            {/* List Data */}
            {!isLoading &&
              combinedNotifications.map((item) => {
                const isAlert = item.type === "alert";
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "group relative p-4 cursor-pointer transition-all duration-200 border-b border-border/50 last:border-0",
                      "hover:bg-muted/40",
                      !item.is_read
                        ? "bg-primary/[0.03] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-primary"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon Status */}
                      <div
                        className={cn(
                          "mt-0.5 shrink-0 p-1.5 rounded-full",
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
                        <div className="flex justify-between items-start gap-2">
                          <p
                            className={cn(
                              "text-sm leading-tight pr-2",
                              !item.is_read
                                ? "font-bold text-foreground"
                                : "font-medium text-muted-foreground"
                            )}
                          >
                            {item.title}
                          </p>

                          <span className="text-[10px] text-muted-foreground/70 font-mono tabular-nums whitespace-nowrap shrink-0">
                            {formatDistanceToNow(new Date(item.date), {
                              addSuffix: false,
                              locale: localeId,
                            }).replace("sekitar ", "")}
                          </span>
                        </div>

                        <p
                          className={cn(
                            "text-xs line-clamp-2 leading-relaxed",
                            !item.is_read
                              ? "text-muted-foreground"
                              : "text-muted-foreground/70"
                          )}
                        >
                          {item.description}
                        </p>

                        {/* Tag Kecil untuk Alert */}
                        {isAlert && !item.is_read && (
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
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
        <div className="p-2 border-t border-border bg-muted/20">
          <Link
            href="/notification-center"
            className="w-full block"
            onClick={() => setIsOpen(false)}
          >
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
