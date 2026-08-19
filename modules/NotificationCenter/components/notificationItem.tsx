// src/app/notification-center/_components/notificationItem.tsx

import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Check } from "lucide-react";
import React from "react";

import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox"; // Pastikan path ini sesuai dengan project Anda
import { cn } from "@/lib/utils";
import { CATEGORY_ICON, SEVERITY_CONFIG } from "../constants";
import { NotificationItem as NotificationType } from "../types";

// Pro-Dev: Interface disesuaikan dengan data yang dikirim oleh NotificationList
interface Props {
  notification: NotificationType;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onClick: (notification: NotificationType) => void;
}

export const NotificationItem = React.memo(
  ({ notification, isSelected, onSelect, onClick }: Props) => {
    const { notification_id, severity, category, is_read, title, message, created_at } =
      notification;

    const SeverityIcon = SEVERITY_CONFIG[severity]?.icon || SEVERITY_CONFIG.INFO.icon;
    const CategoryIcon = CATEGORY_ICON[category] || CATEGORY_ICON.SYSTEM;
    const severityStyle = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;

    return (
      <div
        className={cn(
          "group relative flex gap-4 rounded-xl border p-4 transition-all duration-200",
          isSelected
            ? "border-blue-300 bg-blue-50/60 shadow-sm dark:bg-blue-900/20" // State ketika di-checklist
            : is_read
              ? "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
              : "border-blue-100 bg-blue-50/30 shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10"
        )}
      >
        {/* Unread Indicator Dot */}
        {!is_read && (
          <div className="absolute top-1/2 left-0 -ml-1 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        )}

        {/* 1. CHECKBOX AREA (Untuk Bulk Actions) */}
        <div className="mt-2.5 flex shrink-0 items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(notification_id)}
            className="h-4 w-4 transition-transform data-[state=checked]:scale-110"
          />
        </div>

        {/* 2. ICON WRAPPER */}
        <div
          className={cn(
            "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            severityStyle.bg
          )}
        >
          <SeverityIcon className={cn("h-5 w-5", severityStyle.color)} />
        </div>

        {/* 3. CONTENT AREA (Bisa di-klik untuk melihat detail / tandai dibaca) */}
        <div
          className="flex flex-1 cursor-pointer flex-col gap-1"
          onClick={() => onClick(notification)} // Klik area teks akan memanggil fungsi dari parent
        >
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-sm font-semibold",
                is_read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
              )}
            >
              {title}
            </h4>
            <span className="shrink-0 text-[10px] font-medium text-slate-400">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: id })}
            </span>
          </div>

          <p
            className={cn(
              "text-xs leading-relaxed",
              is_read ? "text-slate-500" : "font-medium text-slate-700 dark:text-slate-300"
            )}
          >
            {message}
          </p>

          {/* 4. TAGS & ACTIONS */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400">
              <CategoryIcon className="h-3 w-3" />
              {category.replace("_", " ")}
            </div>

            {!is_read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 cursor-pointer text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah bentrok dengan onClick di Content Area
                  onClick(notification);
                }}
              >
                <Check className="mr-1 h-3 w-3" /> Tandai Dibaca
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Penamaan untuk React DevTools
NotificationItem.displayName = "NotificationItem";
