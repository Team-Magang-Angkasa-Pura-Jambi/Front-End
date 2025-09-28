import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AnalysisChartSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[320px] flex items-end space-x-4 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-full"
              style={{ height: `${Math.random() * 80 + 10}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
