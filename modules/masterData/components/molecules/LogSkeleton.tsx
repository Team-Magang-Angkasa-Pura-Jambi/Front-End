import { Skeleton } from "@/common/components/ui/skeleton";

export const LogSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);
