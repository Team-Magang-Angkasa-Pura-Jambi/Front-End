// src/app/notification-center/_components/notification-status.tsx

import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Eye, Flame } from "lucide-react";

export enum AlertStatus {
  NEW = "NEW",
  READ = "READ",
  HANDLED = "HANDLED",
}

interface StatusIndicatorProps {
  status: AlertStatus | string;
  className?: string;
}

export const StatusIndicator = ({
  status,
  className,
}: StatusIndicatorProps) => {
  switch (status) {
    case AlertStatus.NEW:
      return (
        <Badge
          variant="destructive"
          pulse
          className={cn(
            "gap-1 border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] text-red-500",
            className
          )}
        >
          <Flame className="h-3 w-3 animate-bounce" />
          UNCERTAIN
        </Badge>
      );
    case AlertStatus.READ:
      return (
        <Badge
          variant="info"
          className={cn(
            "gap-1 border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] text-blue-500",
            className
          )}
        >
          <Eye className="h-3 w-3" />
          REVIEWED
        </Badge>
      );
    case AlertStatus.HANDLED:
      return (
        <Badge
          variant="success"
          className={cn(
            "gap-1 border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-500",
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          RESOLVED
        </Badge>
      );
    default:
      return null;
  }
};
