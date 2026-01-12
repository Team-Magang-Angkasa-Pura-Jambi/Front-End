// src/app/notification-center/_components/notification-list.tsx

import { AnimatePresence, motion } from "framer-motion";
import { NotificationItem } from "./notificationItem";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NotificationUI } from "../types";

interface NotificationListProps {
  notifications: NotificationUI[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onItemClick: (notification: NotificationUI) => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: "beforeChildren",
    },
  },
};

export const NotificationList = ({
  notifications,
  selectedIds,
  onSelect,
  onItemClick,
  className,
}: NotificationListProps) => (
  // ScrollArea responsif: Mengisi sisa ruang, min-height 400px, max 800px
  <ScrollArea
    className={cn("h-[calc(100vh-300px)] min-h-[400px] w-full pr-3", className)}
  >
    <motion.ul
      className="flex flex-col gap-2 p-1 pb-10" // Padding bottom agar item terakhir tidak kepotong
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* AnimatePresence memungkinkan animasi saat item dihapus dari array */}
      <AnimatePresence mode="popLayout">
        {notifications?.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isSelected={selectedIds.has(notification.id)}
            onSelect={onSelect}
            onClick={onItemClick}
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  </ScrollArea>
);
