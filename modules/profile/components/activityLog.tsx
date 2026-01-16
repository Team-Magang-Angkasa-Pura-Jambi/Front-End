import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { ActivityHistoryItem } from "../types/activity.type";

export const ActivityLog = ({
  activities,
  isLoading,
}: {
  activities: ActivityHistoryItem[];
  isLoading: boolean;
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          Riwayat Aktivitas
        </CardTitle>
      </CardHeader>
      <CardContent className="custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : activities.length > 0 ? (
          <ol className="border-muted relative mt-2 ml-3 space-y-6 border-l">
            {activities.map((activity, idx) => (
              <li key={`${activity.type}-${idx}`} className="relative ml-6">
                <span className="bg-primary/80 ring-background absolute -left-[29px] mt-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-4" />
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-sm leading-snug font-medium">
                    {activity.description}
                  </p>
                  <time className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(activity.timestamp))}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-muted-foreground bg-muted/10 rounded-md border border-dashed py-12 text-center text-sm">
            Tidak ada aktivitas terbaru.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
