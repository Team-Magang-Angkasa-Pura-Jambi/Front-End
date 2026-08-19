"use client";

import { Building2, ChevronDown, ChevronRight, GripVertical, Zap } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/common/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/common/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Pastikan path import type ini sesuai dengan struktur projectmu
import { MeterSource } from "@/modules/formula/constants";

interface MeterAccordionProps {
  meter: MeterSource;
  onDragStart: (e: React.DragEvent, payload: any) => void;
  onAddItem: (payload: any) => void;
}

export const MeterAccordion = ({ meter, onDragStart, onAddItem }: MeterAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false); // Default tertutup agar sidebar rapi
  const isMain = meter.type === "MAIN";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "bg-card rounded-lg border shadow-sm transition-all duration-200",
        // Visual cue: Border lebih tebal/berwarna untuk Meter Induk
        isMain ? "border-primary/30" : "border-border"
      )}
    >
      <div className="flex items-center px-2 py-1">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hover:bg-muted/50 flex h-auto w-full justify-between px-2 py-2.5",
              isMain && "hover:bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3 text-left">
              {/* Icon Building */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                  isMain
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                <Building2 className="h-4 w-4" />
              </div>

              {/* Text Info */}
              <div className="flex flex-col">
                <span className="text-foreground line-clamp-1 text-xs font-bold tracking-wider uppercase">
                  {meter.name}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isMain ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isMain ? "METER INDUK" : "SUB METER"}
                </span>
              </div>
            </div>

            {/* Chevron Icon */}
            {isOpen ? (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-1 p-2 pt-0">
        {/* List Reading Types (WBP, LWBP, dll) */}
        {meter.availableReadings.map((rt) => (
          <div
            key={rt.id}
            draggable
            onDragStart={(e) =>
              onDragStart(e, {
                type: "reading",
                label: rt.label,
                value: rt.value,
                meterId: meter.id,
                meterName: meter.name,
              })
            }
            onClick={() =>
              onAddItem({
                type: "reading",
                label: rt.label,
                value: rt.value,
                meterId: meter.id,
                meterName: meter.name,
              })
            }
            className={cn(
              "group flex cursor-grab items-center justify-between rounded-md border px-3 py-2 text-sm transition-all hover:shadow-sm active:cursor-grabbing",
              "bg-background border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground/30 group-hover:text-muted-foreground h-3 w-3 transition-colors" />
              <span className="text-foreground font-medium">{rt.label}</span>
            </div>

            <Zap
              className={cn(
                "h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100",
                isMain ? "text-primary" : "text-emerald-500"
              )}
            />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
