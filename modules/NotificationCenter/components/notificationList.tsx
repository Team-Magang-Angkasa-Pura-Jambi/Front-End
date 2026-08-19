// src/app/notification-center/_components/notificationList.tsx

import { ScrollArea } from "@/common/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { CATEGORY_ICON } from "../constants"; // Import icon untuk header
import { NotificationItem as NotificationType } from "../types";
import { NotificationItem } from "./notificationItem";

interface NotificationListProps {
  notifications: NotificationType[];
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
  onItemClick: (notification: NotificationType) => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const NotificationList = ({
  notifications,
  selectedIds,
  onSelect,
  onItemClick,
  className,
}: NotificationListProps) => {
  // Pro-Dev: Logika Grouping menggunakan useMemo agar tidak direkalkulasi terus menerus
  const groupedNotifications = useMemo(() => {
    return notifications.reduce(
      (acc, notif) => {
        const category = notif.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(notif);
        return acc;
      },
      {} as Record<string, NotificationType[]>
    );
  }, [notifications]);

  return (
    <ScrollArea className={cn("h-[calc(100vh-300px)] min-h-[400px] w-full pr-3", className)}>
      <div className="flex flex-col gap-6 p-1 pb-10">
        {/* Looping berdasarkan Kategori (Group) */}
        {Object.entries(groupedNotifications).map(([category, items]) => {
          const CategoryIcon =
            CATEGORY_ICON[category as keyof typeof CATEGORY_ICON] || CATEGORY_ICON.SYSTEM;

          return (
            <div key={category} className="flex flex-col gap-3">
              {/* GROUP HEADER (Sticky agar tetap terlihat saat di-scroll) */}
              <div className="sticky top-0 z-10 -mx-1 flex items-center gap-2 bg-slate-50/90 py-2 pl-2 backdrop-blur-sm dark:bg-slate-950/90">
                <CategoryIcon className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  {category.replace("_", " ")}
                </h3>
                <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {items.length}
                </span>
              </div>

              {/* LIST ITEM DALAM GROUP TERSEBUT */}
              <motion.ul
                className="flex flex-col gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.notification_id}
                      notification={notification}
                      isSelected={selectedIds.has(notification.notification_id)}
                      onSelect={onSelect}
                      onClick={onItemClick}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
