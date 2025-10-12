// src/app/notification-center/_components/notification-list.tsx
import { motion } from "framer-motion";
import { AlertNotification } from "@/services/notification.service";
import { NotificationItem } from "./notificationItem";

interface NotificationListProps {
  notifications: AlertNotification[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onItemClick: (notification: AlertNotification) => void;
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
  ...rest
}: NotificationListProps) => (
  <motion.ul
    className="space-y-3"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {notifications?.map((notification) => (
      <NotificationItem
        key={notification.id}
        notification={notification}
        {...rest}
      />
    ))}
  </motion.ul>
);
