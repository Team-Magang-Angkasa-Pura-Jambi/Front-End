"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        // LAYOUT
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",

        // INDUSTRIAL STYLE:
        // 1. Inner Border (Memisahkan gambar dari background luar)
        "border-2 border-white dark:border-slate-950",

        // 2. Outer Ring (Casing Logam)
        "ring-2 ring-slate-200 dark:ring-slate-800",

        // 3. Shadow halus untuk kedalaman
        "shadow-sm",

        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full",

        // FALLBACK STYLE:
        // Gradient Metalik Halus
        "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",

        // Typography: Slate Tua & Bold (Seperti stempel inisial)
        "text-slate-600 dark:text-slate-300 font-bold text-xs tracking-wider",

        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
