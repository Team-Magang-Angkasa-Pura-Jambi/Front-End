"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react"; // Icon untuk peringatan

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/common/components/ui/button";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        // Overlay lebih gelap dan blur untuk fokus penuh (Safety First)
        "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          // Posisi & Animasi
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",

          // Style Industrial Alert:
          "bg-white dark:bg-slate-950",
          "border border-slate-200 dark:border-slate-800",
          "border-t-4 border-t-red-500", // Aksen Merah = Critical System Alert
          "shadow-2xl shadow-red-900/10",
          "rounded-lg sm:max-w-[440px]", // Sedikit lebih ramping
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      // Padding terpisah dan border bawah
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left px-6 py-6 border-b border-slate-100 dark:border-slate-800",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      // Background footer abu-abu muda untuk memisahkan tombol aksi
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-lg",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <div className="flex items-center gap-3 justify-center sm:justify-start">
      {/* Icon Segitiga Peringatan */}
      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <AlertDialogPrimitive.Title
        data-slot="alert-dialog-title"
        className={cn(
          "text-lg font-bold text-slate-900 dark:text-slate-100",
          className
        )}
        {...props}
      />
    </div>
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      // Margin top ditambahkan karena ada icon di title
      className={cn(
        "text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2 ml-0 sm:ml-[3.25rem]",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      // Default tombol aksi adalah merah (Destructive) karena ini Alert Dialog
      className={cn(buttonVariants({ variant: "destructive" }), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
