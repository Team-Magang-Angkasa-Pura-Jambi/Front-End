import "./globals.css";
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
          "antialiased",

          // --- PERBAIKAN DI SINI ---
          // Jangan gunakan hardcode (bg-slate-50).
          // Gunakan variable semantik agar sinkron dengan globals.css
          "bg-background text-foreground",

          "selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-50"
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
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
