// src/app/notification-center/_components/notification-item.tsx
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import { AlertNotification } from "@/services/notification.service";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: AlertNotification;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (notification: AlertNotification) => void;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const NotificationItem = ({
  notification,
  isSelected,
  onSelect,
  onClick,
}: NotificationItemProps) => (
  <motion.li
    variants={itemVariants}
    onClick={() => onClick(notification)}
    className={cn(
      "flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
      notification.is_read
        ? "bg-background hover:bg-muted/50"
        : "bg-primary/5 border-primary/20 hover:bg-primary/10"
    )}
  >
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onSelect(notification.notification_id)}
      onClick={(e) => e.stopPropagation()}
      className="mt-1"
    />
    <div className="flex-1">
      <p className="font-semibold">{notification.title}</p>
      <p className="text-sm text-muted-foreground">{notification.message}</p>
      <p className="text-xs text-muted-foreground/80 mt-1">
        {formatDistanceToNow(new Date(notification.created_at), {
          addSuffix: true,
          locale: id,
        })}
      </p>
    </div>
    {!notification.is_read && (
      <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
    )}
  </motion.li>
);
