import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { ActivityHistoryItem, UserWithActivityResponse } from "../types/activity.type";

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
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Riwayat Aktivitas
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length > 0 ? (
          <ol className="relative border-l border-muted ml-3 mt-2 space-y-6">
            {activities.map((activity, idx) => (
              <li key={`${activity.type}-${idx}`} className="ml-6 relative">
                <span className="absolute flex items-center justify-center w-2.5 h-2.5 bg-primary/80 rounded-full -left-[29px] ring-4 ring-background mt-1.5" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {activity.description}
                  </p>
                  <time className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp))}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm bg-muted/10 rounded-md border border-dashed">
            Tidak ada aktivitas terbaru.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
