"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // CONTAINER STYLE:
        // Background Slate muda/gelap untuk track
        "inline-flex h-10 items-center justify-center rounded-lg p-1",
        "bg-slate-100 dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800", // Border industrial
        "text-slate-500 dark:text-slate-400",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // BASE BUTTON:
        "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

        // ACTIVE STATE (THE "ENERGY" POP):
        // 1. Background jadi solid (Putih/Hitam) + Shadow halus
        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950",
        "data-[state=active]:shadow-sm",

        // 2. Teks berubah jadi Emerald (Hijau) saat aktif
        "data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400",
        "data-[state=active]:font-semibold", // Sedikit lebih tebal saat aktif

        // HOVER STATE (Inactive):
        "hover:text-slate-900 dark:hover:text-slate-200",

        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        // Animasi halus saat konten muncul
        "ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "animate-in fade-in-50 zoom-in-95 duration-200",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
