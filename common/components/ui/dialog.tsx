"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Activity } from "lucide-react";

import { cn } from "@/lib/utils";

// ... (Komponen Dialog, Trigger, Portal, Close, Overlay TETAP SAMA seperti sebelumnya) ...
// Copy paste bagian atas dari kode sebelumnya.

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
        "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

// === BAGIAN YANG DIUPDATE ===
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
          // Layout Asli (Wajib dipertahankan)
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",

          // Styling Utama
          "bg-white dark:bg-slate-950",
          "rounded-lg border border-slate-200 dark:border-slate-800",
          "border-t-4 border-t-emerald-500",
          "shadow-2xl shadow-emerald-900/10",

          // Penting untuk elemen absolute agar tidak keluar border
          "overflow-hidden",

          className
        )}
        {...props}
      >
        {/* --- DEKORASI ABSOLUTE MULAI --- */}

        {/* 1. Ambient Glow (Cahaya Halus di Tengah Atas) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-emerald-400/20 blur-xl pointer-events-none" />

        {/* 2. Tech Corner (Siku Kiri Atas) */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-[3px] border-t-[3px] border-emerald-500/30 rounded-tl-md pointer-events-none" />

        {/* 3. Tech Corner (Siku Kanan Atas) */}
        <div className="absolute top-0 right-0 w-4 h-4 border-r-[3px] border-t-[3px] border-emerald-500/30 rounded-tr-md pointer-events-none" />

        {/* 4. Background Pattern (Grid Halus - Sangat Transparan) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />

        {/* --- DEKORASI ABSOLUTE SELESAI --- */}

        {/* Konten Utama (Render di atas dekorasi karena urutan DOM) */}
        <div className="relative z-10 grid gap-4">{children}</div>

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none z-20", // z-20 agar di atas dekorasi
              "text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400",
              "focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
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

// ... (Header, Footer, Title, Description TETAP SAMA) ...

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left text-slate-900 dark:text-slate-50",
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
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
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
    <div className="flex items-center gap-2 justify-center sm:justify-start">
      <Activity className="w-5 h-5 text-emerald-500 shrink-0 hidden sm:block" />
      <DialogPrimitive.Title
        data-slot="dialog-title"
        className={cn(
          "text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100",
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
      className={cn(
        "text-sm text-slate-500 dark:text-slate-400 leading-relaxed",
        className
      )}
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
