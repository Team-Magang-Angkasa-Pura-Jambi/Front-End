"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { cn } from "@/lib/utils"; // Pastikan import utility cn ada

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Posisi di kanan atas lebih umum untuk dashboard monitoring
      position="top-right"
      toastOptions={{
        classNames: {
          toast: cn(
            // --- BASE CARD STYLE ---
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-slate-950",
            "group-[.toaster]:text-slate-950 group-[.toaster]:dark:text-slate-50",
            "group-[.toaster]:border-slate-200 group-[.toaster]:dark:border-slate-800",
            "group-[.toaster]:shadow-lg group-[.toaster]:shadow-slate-900/5",

            // --- INDUSTRIAL SHAPE ---
            "rounded-lg border",

            // --- STATUS STRIP (Border Kiri Tebal) ---
            // Menggunakan data attribute dari Sonner untuk mendeteksi tipe
            "data-[type=success]:border-l-4 data-[type=success]:border-l-emerald-500",
            "data-[type=error]:border-l-4 data-[type=error]:border-l-red-500",
            "data-[type=warning]:border-l-4 data-[type=warning]:border-l-amber-500",
            "data-[type=info]:border-l-4 data-[type=info]:border-l-blue-500"
          ),

          // --- TYPOGRAPHY ---
          title: "group-[.toast]:font-bold group-[.toast]:text-sm",
          description:
            "group-[.toast]:text-slate-500 group-[.toast]:dark:text-slate-400 group-[.toast]:text-xs",

          // --- BUTTONS ---
          actionButton:
            "group-[.toast]:bg-emerald-600 group-[.toast]:text-white font-medium hover:group-[.toast]:bg-emerald-700",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 hover:group-[.toast]:bg-slate-200 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-400",

          // --- ICON ---
          // Memberikan warna pada icon sesuai tema energi
          icon: "group-data-[type=error]:text-red-500 group-data-[type=success]:text-emerald-500 group-data-[type=warning]:text-amber-500 group-data-[type=info]:text-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
