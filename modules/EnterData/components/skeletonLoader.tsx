import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";

export const AnalysisChartSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[320px] w-full items-end space-x-4 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-full w-full"
              style={{ height: `${Math.random() * 80 + 10}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
