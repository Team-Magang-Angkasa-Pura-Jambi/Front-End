"use client";

import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Bell, Inbox, Loader2, Radio } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/common/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SEVERITY_CONFIG } from "@/modules/NotificationCenter/constants";
import { useNotification } from "@/modules/NotificationCenter/hooks/useNotification";
import { NotificationItem as NotificationType } from "@/modules/NotificationCenter/types";

export const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, isLoading, markAsRead } = useNotification();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleItemClick = (item: NotificationType) => {
    if (!item.is_read) {
      markAsRead(item.notification_id);
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
            unreadCount > 0 ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-pulse")} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-destructive border-background relative inline-flex h-2.5 w-2.5 rounded-full border"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="border-t-primary mr-4 w-[380px] border-t-[4px] p-0 shadow-2xl"
        align="end"
      >
        {/* Header */}
        <div className="border-border bg-muted/20 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio
              className={cn(
                "h-4 w-4",
                unreadCount > 0 ? "text-primary animate-pulse" : "text-muted-foreground"
              )}
            />
            <h4 className="text-foreground text-sm font-bold tracking-tight">System Logs</h4>
          </div>
          {unreadCount > 0 && (
            <span className="text-primary bg-primary/10 border-primary/20 rounded-sm border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              {unreadCount} New
            </span>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="text-primary/50 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-xs">Synchronizing...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-80">
              <Inbox className="text-muted-foreground mb-3 h-8 w-8" />
              <p className="text-foreground text-sm font-bold">System Idle</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((item) => {
              const SeverityIcon = SEVERITY_CONFIG[item.severity].icon;
              const severityStyle = SEVERITY_CONFIG[item.severity];

              return (
                <div
                  key={item.notification_id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "group hover:bg-muted/40 relative cursor-pointer border-b p-4 transition-all duration-200",
                    !item.is_read ? "bg-primary/[0.03]" : "opacity-80"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 shrink-0 rounded-full p-1.5", severityStyle.bg)}>
                      <SeverityIcon className={cn("h-3.5 w-3.5", severityStyle.color)} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            !item.is_read ? "font-bold" : "text-muted-foreground font-medium"
                          )}
                        >
                          {item.title}
                        </p>
                        <span className="text-muted-foreground/70 text-[10px] tabular-nums">
                          {formatDistanceToNow(new Date(item.created_at), { locale: localeId })}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-border bg-muted/20 border-t p-2">
          <Link href="/notification-center" onClick={() => setIsOpen(false)}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs font-bold tracking-wider uppercase"
            >
              Open Notification Center
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
