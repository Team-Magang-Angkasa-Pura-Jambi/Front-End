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
import { Home, ArrowLeft, ShieldAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* ================= BACKGROUND IMAGE ================= */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/image/forbiden.png"
          alt="Restricted Area"
          fill
          priority
          className="object-cover object-top-left opacity-60"
        />
      </div>

      {/* Soft overlay (lighter, not killing image) */}
      <div className="from-background/60 via-background/70 to-background/90 absolute inset-0 -z-10 bg-gradient-to-b" />

      {/* ================= DECORATIVE ================= */}
      {/* Alert glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-amber-400/20 blur-3xl" />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* ================= CARD ================= */}
      <Card
        className={cn(
          "relative z-10 w-full max-w-lg backdrop-blur",
          "border-t-destructive border-t-4"
        )}
      >
        <CardHeader className="items-center text-center">
          {/* Badge */}
          <div className="bg-destructive/10 text-destructive mb-6 flex items-center gap-2 rounded-full px-4 py-1.5">
            <ShieldAlert className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Restricted Access
            </span>
          </div>

          <CardTitle className="text-3xl md:text-4xl">
            Access Forbidden
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Error 403 — Permission Denied
          </p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed md:text-base">
            Anda tidak memiliki izin untuk mengakses halaman ini. Akses dibatasi
            berdasarkan tingkat otorisasi pengguna.
          </p>

          {/* Info Box */}
          <div className="bg-muted/40 mx-auto max-w-[340px] rounded-md border p-4 text-left text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Lock className="text-destructive h-4 w-4" />
              Access Details
            </div>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Clearance level tidak mencukupi</li>
              <li>• Resource bersifat terbatas</li>
              <li>• Tidak ada perubahan data</li>
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
              Ke Beranda
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
