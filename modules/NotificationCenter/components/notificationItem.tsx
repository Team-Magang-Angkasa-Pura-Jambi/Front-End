// src/app/notification-center/_components/notification-item.tsx

"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale"; // Rename agar tidak rancu dengan id properti
import { motion } from "framer-motion";
import { Clock, Info, AlertTriangle, ChevronRight, User } from "lucide-react";

import { Checkbox } from "@/common/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AlertStatus, StatusIndicator } from "./notification-status";
import { NotificationUI } from "../types";

interface NotificationItemProps {
  notification: NotificationUI; // Gunakan tipe yang sudah dinormalisasi
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (notification: NotificationUI) => void;
}

const itemVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -10, opacity: 0, transition: { duration: 0.2 } }, // Animasi saat dihapus
};

// Style Styles (Tetap sama, logic visual Sentinel)
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
  // Logic Status
  const isUnread = !notification.is_read;
  const isAlert = notification.type === "alert";
  const status = (notification.status as AlertStatus) || "INFO"; // Fallback aman

  return (
    <motion.li
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout="position" // Penting untuk animasi list yang halus saat delete
      onClick={() => onClick(notification)}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-md border transition-all duration-200 cursor-pointer overflow-hidden select-none",

        // Logic Background: Jika Read & Bukan Handled -> Putih/Netral. Sisanya pakai warna status.
        !isUnread && status !== AlertStatus.HANDLED
          ? "bg-card border-border/40 hover:bg-accent/5"
          : cardStyles[status] || cardStyles.DEFAULT,

        // Highlight saat checkbox dipilih
        isSelected && "ring-1 ring-primary border-primary/50 bg-primary/[0.02]"
      )}
    >
      {/* UNREAD INDICATOR STRIP */}
      {isUnread && (
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[3px] shadow-[0_0_8px_rgba(var(--primary),0.6)]",
            status === AlertStatus.NEW ? "bg-destructive" : "bg-primary"
          )}
        />
      )}

      {/* CHECKBOX */}
      <div className="mt-1 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(notification.id)}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "transition-colors shadow-sm",
            !isUnread && status !== AlertStatus.HANDLED
              ? "border-muted-foreground/30"
              : checkboxStyles[status] || checkboxStyles.DEFAULT
          )}
        />
      </div>

      {/* ICON TYPE */}
      <div
        className={cn(
          "mt-0.5 p-2 rounded-full shrink-0 shadow-sm ring-1 ring-inset ring-black/5",
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
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Header Row: Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <p
              className={cn(
                "text-sm truncate pr-1 transition-colors",
                isUnread
                  ? "font-bold text-foreground"
                  : "font-medium text-muted-foreground"
              )}
            >
              {notification.title}
            </p>

            {/* Tampilkan Badge Status jika bukan INFO biasa */}
            {status !== "INFO" && (
              <StatusIndicator
                status={status}
                className="shrink-0 scale-90 origin-left"
              />
            )}
          </div>

          {/* Timestamp */}
          {notification.date && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono shrink-0 bg-background/50 px-1.5 py-0.5 rounded border border-border/50">
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
            "text-xs leading-relaxed line-clamp-2",
            isUnread ? "text-foreground/80" : "text-muted-foreground/60"
          )}
        >
          {notification.description}
        </p>

        {/* Metadata Footer: Verified By (Khusus Alert) */}
        {notification.acknowledged_by && (
          <div className="flex items-center gap-2 pt-2 mt-1">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 border border-primary/10">
              <User className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                Verified by{" "}
                <span className="text-foreground font-bold ml-0.5">
                  {notification.acknowledged_by.username}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hover Action Hint */}
      <div className="self-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
      </div>
    </motion.li>
  );
});

NotificationItem.displayName = "NotificationItem";
