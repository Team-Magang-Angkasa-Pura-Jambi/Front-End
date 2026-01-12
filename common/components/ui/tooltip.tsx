"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 200, // Sedikit delay agar tidak "flickering" saat mouse lewat cepat
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6, // Jarak sedikit lebih jauh dari trigger
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // ANIMATION & LAYOUT
          "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",

          // INDUSTRIAL STYLE (HUD LOOK):
          // 1. Background Selalu Gelap (Slate-900) agar kontras tinggi dengan dashboard abu-abu/putih
          "bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm",

          // 2. Text Selalu Terang
          "text-slate-50 font-medium tracking-wide",

          // 3. Border Halus (Slate-700/800)
          "border border-slate-800 dark:border-slate-800",

          // 4. Shadow
          "shadow-xl shadow-black/10",

          className
        )}
        {...props}
      >
        {children}

        {/* ARROW styling: Warnanya harus sama dengan background tooltip (Slate-900) */}
        <TooltipPrimitive.Arrow
          className="fill-slate-900/95 dark:fill-slate-950/95"
          width={11}
          height={5}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
