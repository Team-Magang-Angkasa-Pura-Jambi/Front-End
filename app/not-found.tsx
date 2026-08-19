"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Home, ArrowLeft, BatteryWarning, MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFoundEnergyPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* ================= BACKGROUND IMAGE ================= */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/image/not-found.png"
          alt="Unknown Destination"
          fill
          priority
          className="object-cover object-[50%_70%] opacity-60"
        />
      </div>

      {/* Soft overlay */}
      <div className="from-background/60 via-background/70 to-background/90 absolute inset-0 -z-10 bg-gradient-to-b" />

      {/* ================= DECORATION ================= */}
      {/* depletion glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-sky-400/20 blur-3xl" />

      {/* grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* ================= CARD ================= */}
      <Card
        className={cn(
          "relative z-10 w-full max-w-lg backdrop-blur",
          "border-t-4 border-t-amber-500"
        )}
      >
        <CardHeader className="items-center text-center">
          {/* Badge */}
          <div className="mb-6 flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-amber-600">
            <BatteryWarning className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              System Offline
            </span>
          </div>

          <CardTitle className="text-3xl md:text-4xl">
            Destination Not Found
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Error 404 — Page Missing
          </p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed md:text-base">
            Sistem tidak dapat menemukan tujuan yang diminta. Jalur navigasi
            tidak tersedia atau halaman telah dipindahkan.
          </p>

          {/* Info box */}
          <div className="bg-muted/40 mx-auto max-w-[340px] rounded-md border p-4 text-left text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <MapPinOff className="h-4 w-4 text-amber-500" />
              Navigation Status
            </div>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Lokasi halaman tidak terdaftar</li>
              <li>• Rute tidak tersedia</li>
              <li>• Tidak ada dampak ke data sistem</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          <Button asChild className="sm:flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ke Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
