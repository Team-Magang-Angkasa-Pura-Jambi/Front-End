"use client"; // <--- TAMBAHKAN INI DI BARIS PALING ATAS

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import hook router
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Home, Radio, ZapOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFoundEnergyPage() {
  const router = useRouter(); // Inisialisasi router untuk tombol Back

  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      {/* --- BACKGROUND DECORATION (Tech Grid) --- */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />

      {/* --- FLOATING TECH ELEMENTS --- */}
      <div className="text-muted-foreground/40 absolute top-10 left-10 hidden font-mono text-[10px] select-none md:block">
        ERR_CODE: 0x404_NOT_FOUND <br />
        SYS_STATUS: CRITICAL_HALT <br />
        LOC: SECTOR_NULL
      </div>

      <Card
        className={cn(
          "relative z-10 w-full max-w-lg transform-gpu",
          // Industrial Theme Styling
          "bg-card border-border shadow-primary/5 shadow-2xl",
          "border-t-destructive border-t-[4px]" // Red border for error state
        )}
      >
        <CardHeader className="items-center pb-2 text-center">
          {/* Status Badge */}
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-6 flex animate-pulse items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase">
            <Radio className="h-3 w-3" />
            Signal Lost
          </div>

          {/* Character Visual with Glitch/Off Effect */}
          <div className="group relative mb-6">
            <div className="bg-destructive/20 absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-50" />
            <div className="relative">
              <ZapOff className="text-destructive absolute -top-4 -right-4 h-8 w-8 animate-bounce" />
              <Image
                src="/image/sir-miles-axelrod.png"
                alt="Sir Miles Axlerod Lost"
                width={140}
                height={140}
                className="h-auto w-auto object-contain opacity-80 mix-blend-luminosity grayscale transition-all duration-500 hover:scale-105 hover:opacity-100 hover:grayscale-0"
              />
            </div>
          </div>

          <CardTitle className="text-foreground text-3xl font-black tracking-tight uppercase md:text-4xl">
            Energy <span className="text-destructive">Depleted</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-2 text-lg font-medium">
            Error 404: Location Unknown
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed md:text-base">
            It seems you&apos;ve ventured too far off the grid. Like{" "}
            <b>Sir Miles Axlerod</b> deep in the jungle, you are looking for an
            alternative energy source that doesn&apos;t exist here.
          </p>

          {/* Tech Divider */}
          <div className="my-4 flex items-center justify-center gap-2 opacity-20">
            <div className="bg-foreground h-px w-12" />
            <div className="bg-foreground h-1 w-1 rounded-full" />
            <div className="bg-foreground h-px w-12" />
          </div>

          <div className="text-muted-foreground/60 bg-muted/50 border-border inline-block rounded border p-2 font-mono text-xs">
            Diagnostic: URL_PATH_INVALID or RESOURCE_MOVED
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
          {/* Tombol Back menggunakan router.back() */}
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
          >
            Go Back
          </Button>

          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:flex-1"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Main Grid
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
