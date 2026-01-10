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
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4 overflow-hidden">
      {/* --- BACKGROUND DECORATION (Tech Grid) --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />

      {/* --- FLOATING TECH ELEMENTS --- */}
      <div className="absolute top-10 left-10 text-[10px] font-mono text-muted-foreground/40 hidden md:block select-none">
        ERR_CODE: 0x404_NOT_FOUND <br />
        SYS_STATUS: CRITICAL_HALT <br />
        LOC: SECTOR_NULL
      </div>

      <Card
        className={cn(
          "w-full max-w-lg transform-gpu relative z-10",
          // Industrial Theme Styling
          "bg-card border-border shadow-2xl shadow-primary/5",
          "border-t-[4px] border-t-destructive" // Red border for error state
        )}
      >
        <CardHeader className="items-center text-center pb-2">
          {/* Status Badge */}
          <div className="mb-6 flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-widest animate-pulse">
            <Radio className="w-3 h-3" />
            Signal Lost
          </div>

          {/* Character Visual with Glitch/Off Effect */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative">
              <ZapOff className="absolute -top-4 -right-4 w-8 h-8 text-destructive animate-bounce" />
              <Image
                src="/image/sir-miles-axelrod.png"
                alt="Sir Miles Axlerod Lost"
                width={140}
                height={140}
                className="h-auto w-auto object-contain grayscale opacity-80 mix-blend-luminosity hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>

          <CardTitle className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
            Energy <span className="text-destructive">Depleted</span>
          </CardTitle>
          <CardDescription className="pt-2 text-lg font-medium text-muted-foreground">
            Error 404: Location Unknown
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
            It seems you've ventured too far off the grid. Like{" "}
            <b>Sir Miles Axlerod</b> deep in the jungle, you are looking for an
            alternative energy source that doesn't exist here.
          </p>

          {/* Tech Divider */}
          <div className="flex items-center justify-center gap-2 opacity-20 my-4">
            <div className="h-px w-12 bg-foreground" />
            <div className="h-1 w-1 rounded-full bg-foreground" />
            <div className="h-px w-12 bg-foreground" />
          </div>

          <div className="text-xs font-mono text-muted-foreground/60 bg-muted/50 p-2 rounded border border-border inline-block">
            Diagnostic: URL_PATH_INVALID or RESOURCE_MOVED
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
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
            className="w-full sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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
