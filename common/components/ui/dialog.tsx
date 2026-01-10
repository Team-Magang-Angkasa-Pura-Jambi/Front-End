"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Activity, SquareActivity } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Backdrop gelap dengan blur untuk fokus
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-[2px]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

// === BAGIAN UTAMA YANG DIPERBAIKI ===
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Layout & Animasi Standar
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",

          // --- INDUSTRIAL THEME STYLING ---
          // 1. Background & Border: Menggunakan variable semantic (bg-card, border-border)
          "bg-card text-card-foreground",
          "rounded-lg border border-border shadow-2xl",

          // 2. Signature Top Border: Warna Primary (Cyan/Emerald) tebal di atas
          "border-t-[4px] border-t-primary",

          // 3. Shadow Glow Halus sesuai warna Primary
          "shadow-primary/10",

          // Penting: Overflow hidden agar dekorasi absolute tidak bocor keluar rounded
          "overflow-hidden",

          className
        )}
        {...props}
      >
        {/* --- DEKORASI VISUAL (HUD ELEMENTS) --- */}

        {/* 1. Ambient Glow (Cahaya di tengah atas, mengikuti warna Primary) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-primary/40 blur-xl pointer-events-none" />

        {/* 2. Tech Corner (Siku Kiri Atas) */}
        <div className="absolute top-0 left-0 w-6 h-6 border-l-[3px] border-t-[3px] border-primary/20 rounded-tl-md pointer-events-none" />

        {/* 3. Tech Corner (Siku Kanan Atas) */}
        <div className="absolute top-0 right-0 w-6 h-6 border-r-[3px] border-t-[3px] border-primary/20 rounded-tr-md pointer-events-none" />

        {/* 4. Background Grid Pattern (Sangat halus, menggunakan warna border) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03] pointer-events-none" />

        {/* --- SELESAI DEKORASI --- */}

        {/* Content Wrapper (Z-10 agar di atas dekorasi background) */}
        <div className="relative z-10 grid gap-4">{children}</div>

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none z-20",
              // Close button styling
              "text-muted-foreground hover:text-destructive",
              "focus:ring-2 focus:ring-primary focus:ring-offset-2 ring-offset-background"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // Footer layout dengan top border halus agar terpisah dari konten
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-2 pt-4 border-t border-border/50",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
      {/* Icon Judul: Menggunakan warna Primary */}
      <SquareActivity className="w-5 h-5 text-primary shrink-0 hidden sm:block" />
      <DialogPrimitive.Title
        data-slot="dialog-title"
        className={cn(
          "text-lg font-bold leading-none tracking-tight text-foreground",
          className
        )}
        {...props}
      />
    </div>
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
