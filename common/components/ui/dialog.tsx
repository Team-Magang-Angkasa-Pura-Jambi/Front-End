"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SquareActivity, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// --- KONFIGURASI UKURAN DIALOG ---
export const DIALOG_WIDTHS = {
  sm: "sm:max-w-sm", // Kecil (Alert)
  default: "sm:max-w-lg", // Standar (Form biasa)
  lg: "sm:max-w-xl", // Agak lebar
  xl: "sm:max-w-2xl", // Lebar (Grid 2 kolom sempit)
  "2xl": "sm:max-w-4xl", // Sangat Lebar (Grid 2 kolom luas)
  "3xl": "sm:max-w-5xl", // Extra Lebar (Grid 3 kolom / MeterForm)
  "4xl": "sm:max-w-7xl", // Hampir Full
  full: "sm:max-w-[calc(100vw-2rem)]", // Full width minus margin
};

interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  maxWidth?: keyof typeof DIALOG_WIDTHS | string; // Prop baru untuk mengatur lebar
  showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, maxWidth = "default", showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Base Layout & Animation
        "fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",

        // Dynamic Width (Kunci agar tidak tertahan)
        DIALOG_WIDTHS[maxWidth],

        // --- INDUSTRIAL THEME STYLING ---
        // Background & Border
        "bg-card text-card-foreground rounded-lg border shadow-2xl",
        // Signature Top Border (Cyan/Primary)
        "border-t-primary border-x-border border-b-border border-t-[4px]",
        // Glow Effect Halus
        "shadow-[0_0_40px_-10px_rgba(var(--primary),0.1)]",
        // Overflow hidden untuk dekorasi
        "overflow-hidden",

        className
      )}
      {...props}
    >
      {/* --- DEKORASI VISUAL (HUD ELEMENTS) --- */}

      {/* 1. Ambient Glow Tengah Atas */}
      <div className="bg-primary/50 pointer-events-none absolute top-0 left-1/2 h-[2px] w-1/3 -translate-x-1/2 blur-[2px]" />
      <div className="bg-primary/10 pointer-events-none absolute top-0 left-1/2 h-16 w-64 -translate-x-1/2 rounded-full blur-xl" />

      {/* 2. Tech Corner (Kiri Atas) */}
      <svg
        className="text-primary/30 pointer-events-none absolute top-2 left-2 h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 1h6v6H1z" fill="currentColor" className="opacity-50" />
        <path d="M1 9v14h14" />
      </svg>

      {/* 3. Tech Corner (Kanan Atas) */}
      <svg
        className="text-primary/30 pointer-events-none absolute top-2 right-2 h-4 w-4 rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 1h6v6H1z" fill="currentColor" className="opacity-50" />
        <path d="M1 9v14h14" />
      </svg>

      {/* 4. Background Grid Pattern Halus */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_24px]" />

      {/* --- CONTENT WRAPPER --- */}
      <div className="relative z-10 grid gap-4">{children}</div>

      {showCloseButton && (
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 z-20 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("relative z-10 flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "border-border/40 relative z-10 mt-2 flex flex-col-reverse border-t pt-2 sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <div className="mb-1 flex items-center gap-2">
    <SquareActivity className="text-primary hidden h-5 w-5 sm:block" />
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-foreground text-lg leading-none font-semibold tracking-tight", className)}
      {...props}
    />
  </div>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

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
