"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { motion } from "framer-motion";
import { Clock, Info, AlertTriangle, ChevronRight, User } from "lucide-react";

import { Checkbox } from "@/common/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AlertStatus, StatusIndicator } from "./notification-status";
import { NotificationUI } from "../types";

interface NotificationItemProps {
  notification: NotificationUI;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (notification: NotificationUI) => void;
}

const itemVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -10, opacity: 0, transition: { duration: 0.2 } },
};

const cardStyles = {
  [AlertStatus.NEW]:
    "bg-destructive/[0.03] border-destructive/20 hover:bg-destructive/[0.06]",
  [AlertStatus.HANDLED]:
    "bg-emerald-500/[0.03] border-emerald-500/20 hover:bg-emerald-500/[0.06]",
  DEFAULT: "bg-primary/[0.03] border-primary/20 hover:bg-primary/[0.06]",
};

const checkboxStyles = {
  [AlertStatus.NEW]:
    "border-destructive/50 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive",
  [AlertStatus.HANDLED]:
    "border-emerald-500/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
  DEFAULT:
    "border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
};

export const NotificationItem = React.forwardRef<
  HTMLLIElement,
  NotificationItemProps
>(({ notification, isSelected, onSelect, onClick }, ref) => {
  const isUnread = !notification.is_read;
  const isAlert = notification.type === "alert";
  const status = (notification.status as AlertStatus) || "INFO";

  return (
    <motion.li
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout="position"
      onClick={() => onClick(notification)}
      className={cn(
        // Base styles
        "group relative flex cursor-pointer select-none items-start gap-4 overflow-hidden rounded-md border p-4 transition-all duration-200",

        // Logic: Jika sudah dibaca (isRead) dan sudah dihandle (HANDLED),
        // gunakan style kartu berdasarkan status. Jika belum, gunakan style default/card.
        !isUnread && status !== AlertStatus.HANDLED
          ? "bg-card border-border/40 hover:bg-accent/5"
          : cardStyles[status as keyof typeof cardStyles] || cardStyles.DEFAULT,

        // Selection styles
        isSelected &&
          "ring-primary border-primary/50 bg-primary/[0.02] shadow-sm ring-1"
      )}
    >
      {/* UNREAD INDICATOR STRIP */}
      {isUnread && (
        <div
          className={cn(
            "absolute bottom-0 left-0 top-0 w-[3px] shadow-[0_0_8px_rgba(var(--primary),0.6)]",
            status === AlertStatus.NEW ? "bg-destructive" : "bg-primary"
          )}
        />
      )}

      {/* CHECKBOX */}
      <div className="z-10 mt-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(notification.id)}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "shadow-sm transition-colors",
            !isUnread && status !== AlertStatus.HANDLED
              ? "border-muted-foreground/30"
              : checkboxStyles[status as keyof typeof cardStyles] ||
                  checkboxStyles.DEFAULT
          )}
        />
      </div>

      {/* ICON TYPE */}
      <div
        className={cn(
          "mt-0.5 shrink-0 rounded-full p-2 shadow-sm ring-1 ring-inset ring-black/5",
          isAlert
            ? "bg-red-500/10 text-red-600"
            : "bg-blue-500/10 text-blue-600"
        )}
      >
        {isAlert ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Info className="h-4 w-4" />
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Header Row: Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p
              className={cn(
                "truncate pr-1 text-sm transition-colors",
                isUnread
                  ? "text-foreground font-bold"
                  : "text-muted-foreground font-medium"
              )}
            >
              {notification.title}
            </p>

            {/* Tampilkan Badge Status jika bukan INFO biasa */}
            {status !== ("INFO" as string) && (
              <StatusIndicator
                status={status}
                className="shrink-0 origin-left scale-90"
              />
            )}
          </div>

          {/* Timestamp */}
          {notification.date && (
            <div className="text-muted-foreground/60 bg-background/50 border-border/50 flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(notification.date), {
                  addSuffix: true,
                  locale: localeId,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p
          className={cn(
            "line-clamp-2 text-xs leading-relaxed",
            isUnread ? "text-foreground/80" : "text-muted-foreground/60"
          )}
        >
          {notification.description}
        </p>

        {/* Metadata Footer: Verified By (Khusus Alert) */}
        {notification.acknowledged_by && (
          <div className="mt-1 flex items-center gap-2 pt-2">
            <div className="bg-primary/5 border-primary/10 flex items-center gap-1.5 rounded-full border px-2 py-1">
              <User className="text-primary h-3 w-3" />
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-tight">
                Verified by
                <span className="text-foreground ml-0.5 font-bold">
                  {notification.acknowledged_by.username}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hover Action Hint */}
      <div className="translate-x-2 self-center opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ChevronRight className="text-muted-foreground/50 h-5 w-5" />
      </div>
    </motion.li>
  );
});

NotificationItem.displayName = "NotificationItem";
