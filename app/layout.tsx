import "./globals.css"; // Pastikan file ini ada di folder yang sama (src/app/)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/common/components/ui/sonner";
import { SocketProvider } from "@/providers/SocketProvider";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentinel Angkasa Pura Jambi",
  description: "Energy Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased min-h-screen",

          // 1. BASE COLORS (Sesuai globals.css)
          "bg-background text-foreground",

          // 2. SELECTION COLOR (ADAPTIF)
          // Menggunakan 'primary' agar warnanya Cyan (InJourney) atau Emerald (tergantung CSS)
          // Tidak lagi hardcoded warna hijau/emerald.
          "selection:bg-primary/20 selection:text-primary",

          // 3. GLOBAL INDUSTRIAL SCROLLBAR
          // Membuat scrollbar browser terlihat menyatu dengan tema dashboard
          "[&::-webkit-scrollbar]:w-2", // Lebar scrollbar 8px
          "[&::-webkit-scrollbar-track]:bg-transparent", // Track transparan
          "[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700", // Warna thumb
          "[&::-webkit-scrollbar-thumb]:rounded-full", // Rounded
          "[&::-webkit-scrollbar-thumb]:border-[1px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content" // Padding trik
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SocketProvider />
            {children}
            {/* Toaster Global */}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
