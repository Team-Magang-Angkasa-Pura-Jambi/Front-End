"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
  }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      "flex items-center gap-2 select-none",

      "text-[11px] leading-none font-bold tracking-wider uppercase",

      "text-muted-foreground",

      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",

      className
    )}
    {...props}
  >
    {children}

    {/* 5. AUTOMATIC REQUIRED INDICATOR */}
    {required && (
      <span className="text-destructive ml-0.5 font-bold" title="Wajib diisi">
        *
      </span>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
