// src/app/notification-center/_components/notification-item.tsx
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import { NotificationOrAlert } from "@/services/notification.service";
import { Checkbox } from "@/common/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: NotificationOrAlert;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (notification: NotificationOrAlert) => void;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const NotificationItem = React.forwardRef<
  HTMLLIElement,
  NotificationItemProps
>(({ notification, isSelected, onSelect, onClick }, ref) => (
  <motion.li
    ref={ref}
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
      onCheckedChange={() => onSelect(notification.id)}
      onClick={(e) => e.stopPropagation()}
      className="mt-1"
    />
    <div className="flex-1">
      <p className="font-semibold">{notification.title}</p>
      <p className="text-sm text-muted-foreground">
        {notification.description}
      </p>

      <p className="text-sm text-muted-foreground">{notification.message}</p>
      {notification.created_at && (
        <p className="text-xs text-muted-foreground/80 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: id,
          })}
        </p>
      )}
    </div>
    {!notification.is_read && (
      <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
    )}
  </motion.li>
));
NotificationItem.displayName = "NotificationItem";
