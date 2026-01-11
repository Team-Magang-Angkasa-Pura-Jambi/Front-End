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
            "bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5 text-[9px] gap-1",
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
            "bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 text-[9px] gap-1",
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
            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 text-[9px] gap-1",
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
