"use client";

import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Definisikan props layaknya membuat library
interface HeatmapProps {
  groupedData: any[];
  isLoading: boolean;
  selectedMeterId: number;
}

export const GithubCalendarHeatmap = ({
  groupedData,
  isLoading,
  selectedMeterId,
}: HeatmapProps) => {
  const dayLabels = [
    { row: 1, name: "Sen" },
    { row: 3, name: "Rab" },
    { row: 5, name: "Jum" },
  ];

  return (
    <div className="scrollbar-hide w-full overflow-x-auto p-2">
      <div className="relative mx-auto flex min-w-max gap-2 px-2">
        {/* KOLOM LABEL HARI (SISI KIRI) */}
        <div className="bg-none text-muted-foreground sticky left-0 z-20 grid w-6 grid-rows-7 pt-6 pr-2 text-[9px] font-semibold">
          {dayLabels.map((day) => (
            <span
              key={day.name}
              className="flex h-2.5 items-center"
              style={{ gridRowStart: day.row + 1 }}
            >
              {day.name}
            </span>
          ))}
        </div>

        {/* KISI KALENDER HEATMAP */}
        <TooltipProvider>
          {groupedData.map((month) => (
            <div key={month.monthName} className="flex flex-col gap-2">
              <span className="text-muted-foreground h-4 text-center text-[9px] font-bold tracking-wider uppercase">
                {month.monthName}
              </span>

              <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                {Array.from({ length: month.offset }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-2.5 w-2.5" />
                ))}

                {isLoading || !selectedMeterId
                  ? Array.from({ length: 30 }).map((_, i) => (
                      <Skeleton key={i} className="bg-muted h-2.5 w-2.5 rounded-[2px]" />
                    ))
                  : month.days.map((day: any) => (
                      <Tooltip key={day.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "relative h-5 w-5 cursor-pointer rounded-[2px] shadow-sm transition-all",
                              "ring-1 ring-black/10 ring-inset dark:ring-white/20",
                              "hover:ring-primary hover:z-10 hover:scale-125 hover:ring-2",
                              day.color
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {day.dateDisplay}
                            </p>
                            <p className="text-xs font-bold text-slate-50">{day.status}</p>
                            {day.confidence && (
                              <p className="text-[9px] font-medium text-slate-500">
                                AI Confidence: {day.confidence}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};
