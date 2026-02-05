import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/common/components/ui/sonner";
import { SocketProvider } from "@/providers/SocketProvider";
import { cn } from "@/lib/utils";
// 1. IMPORT Script DARI NEXT.JS
import Script from "next/script";

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
          "min-h-screen antialiased",
          "bg-background text-foreground",
          "selection:bg-primary/20 selection:text-primary",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:border-[1px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content"
        )}
      >
        {/* 2. GUNAKAN KOMPONEN SCRIPT DI SINI */}
        {/* strategy="afterInteractive" memastikan script load setelah halaman interaktif agar tidak bikin lemot */}
        <Script
          id="maze-snippet"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function (m, a, z, e) {
                var s, t, u, v;
                try {
                  t = m.sessionStorage.getItem('maze-us');
                } catch (err) {}
              
                if (!t) {
                  t = new Date().getTime();
                  try {
                    m.sessionStorage.setItem('maze-us', t);
                  } catch (err) {}
                }
              
                u = document.currentScript || (function () {
                  var w = document.getElementsByTagName('script');
                  return w[w.length - 1];
                })();
                v = u && u.nonce;
              
                s = a.createElement('script');
                s.src = z + '?apiKey=' + e;
                s.async = true;
                if (v) s.setAttribute('nonce', v);
                a.getElementsByTagName('head')[0].appendChild(s);
                m.mazeUniversalSnippetApiKey = e;
              })(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'd09e62d0-cf10-4f62-a1cb-61f1c7fc87f1');
            `,
          }}
        />

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
