import { Toaster } from "@/common/components/ui/sonner";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/QueryProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Konfigurasi Font Plus Jakarta Sans
const fontJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
          fontJakarta.variable,
          geistMono.variable,
          "min-h-screen font-sans antialiased", // Menambahkan font-sans agar langsung aktif
          "bg-background text-foreground",
          "selection:bg-primary/20 selection:text-primary",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:border-[1px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content"
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
