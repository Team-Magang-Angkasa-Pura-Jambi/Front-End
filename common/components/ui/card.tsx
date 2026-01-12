import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card"
    className={cn(
      // 1. Base Layout (Tetap Dinamis)
      "group relative flex flex-col rounded-xl border shadow-sm transition-all duration-300",

      // 2. Styling Colors (Support Dark Mode)
      // Light: Putih, Dark: Slate Sangat Gelap (bukan hitam total agar depth terlihat)
      "bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50",
      "border-slate-200 dark:border-slate-800",

      // 3. Hover Effect
      // Light: Shadow halus. Dark: Border menyala biru redup (Tech feel)
      "hover:border-slate-300/80 hover:shadow-md dark:hover:border-blue-500/30",

      className
    )}
    {...props}
  >
    {/* --- CORAK ABSOLUT (BACKGROUND LAYER) --- */}
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl">
      {/* A. Pola Dot Grid */}
      {/* Menggunakan warna netral (#a1a1aa) agar masuk di light/dark mode */}
      <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.2] dark:opacity-[0.15]" />

      {/* B. Ambient Glow (Pojok Kanan Atas) */}
      {/* Dark mode: Glow sedikit lebih terang (opacity 10%) agar terlihat di background gelap */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl transition-all duration-500 group-hover:bg-blue-500/10 dark:bg-blue-500/10 dark:group-hover:bg-blue-500/20" />

      {/* C. Aksen Garis Pudar (Bawah ke Atas) */}
      {/* Menyesuaikan gradient fade agar menyatu dengan warna background masing-masing mode */}
      <div className="absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-white/80 to-transparent dark:from-slate-950/80" />
    </div>

    {/* --- KONTEN UTAMA --- */}
    <div className="relative z-10 flex flex-1 flex-col">{props.children}</div>
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      "text-slate-900 dark:text-slate-100", // Pastikan judul kontras
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-slate-500 dark:text-slate-400", // Deskripsi sedikit redup di dark mode
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("ml-auto pl-4", className)} {...props} />
));
CardAction.displayName = "CardAction";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
};
