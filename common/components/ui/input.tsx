"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 1. BASE LAYOUT
        "border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-all duration-200",

        // 2. TYPOGRAPHY (Tabular Nums untuk data angka yang rapi)
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground/70",
        "text-foreground font-medium tabular-nums",

        // 3. HOVER STATE (Visual Feedback)
        "hover:border-primary/50 hover:bg-accent/5",

        // 4. FOCUS STATE (Tech HUD Glow)
        // Menghilangkan outline default, ganti dengan Border Primary + Ring Halus
        "focus-visible:outline-none",
        "focus-visible:border-primary",
        "focus-visible:ring-primary/10 focus-visible:ring-4",

        // 5. DISABLED STATE
        "disabled:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50",

        // 6. ERROR STATE (ARIA INVALID)
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",

        className
      )}
      {...props}
    />
  );
}

export { Input };
