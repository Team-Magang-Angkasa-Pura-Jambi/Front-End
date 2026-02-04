"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import {
  AlertTriangle,
  FlaskConical,
  ExternalLink,
  Bug,
  GraduationCap,
} from "lucide-react";

export function Announcement() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen || timeLeft === 0) {
      if (timeLeft === 0) setIsOpen(false);
      return;
    }
    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Development & Research
            </span>
          </div>
          <DialogTitle className="text-xl">
            Selamat Datang di Versi Beta
          </DialogTitle>
          <DialogDescription className="pt-1">
            Website ini sedang dalam tahap pengembangan dan pengujian.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Identitas Mahasiswa */}
          <div className="flex items-start gap-3 rounded-lg border bg-blue-50 p-4 text-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <GraduationCap className="mt-0.5 h-6 w-6 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Penelitian Akademik</h4>
              <p className="text-sm leading-relaxed">
                Kami mahasiswa{" "}
                <strong>Sistem Informasi Universitas Jambi</strong> ingin
                mengadakan pengujian sistem ini untuk keperluan penelitian.
              </p>
            </div>
          </div>

          {/* Section Laporan Bug */}
          <div className="bg-muted/40 flex items-start gap-3 rounded-md border p-3">
            <Bug className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Kendala Teknis?</p>
              <p className="text-muted-foreground text-xs">
                Jika menemukan error, mohon hubungi{" "}
                <span className="text-foreground font-medium">Super Admin</span>{" "}
                agar segera diperbaiki.
              </p>
            </div>
          </div>

          {/* Section Pengujian Usability */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-500" />
              <h4 className="leading-none font-semibold tracking-tight">
                Partisipasi Pengujian (UAT)
              </h4>
            </div>

            <p className="text-muted-foreground text-sm">
              Mohon bantuan Anda untuk mencoba fitur dan mengisi kuesioner
              melalui tautan berikut:
            </p>

            {/* PERUBAHAN 1: Grid Layout Desktop diperlebar dari 100px jadi 150px */}
            <div className="mt-1 grid grid-cols-1 gap-4 rounded-lg border p-3 shadow-sm sm:grid-cols-[150px_1fr]">
              {/* PERUBAHAN 2: Container Mobile diperbesar dari h/w-[100px] jadi h/w-[150px] */}
              <div className="mx-auto flex h-[150px] w-[150px] items-center justify-center rounded-md border bg-white p-1 sm:h-auto sm:w-auto">
                <Image
                  src="/image/qr-code-placeholder.png"
                  alt="QR Code Maze"
                  // PERUBAHAN 3: Ukuran Image Next.js disesuaikan (misal 140px agar ada padding dikit)
                  width={140}
                  height={140}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col justify-center gap-2.5">
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="w-full justify-between bg-indigo-600 hover:bg-indigo-700"
                >
                  <Link href="https://maze.co/link-anda" target="_blank">
                    Mulai Tes Usability (Maze)
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                >
                  <Link
                    href="https://forms.office.com/r/tUmXpXK05B"
                    target="_blank"
                  >
                    Isi Kuesioner UAT
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            onClick={handleClose}
            className="w-full min-w-[140px] sm:w-auto"
          >
            Lanjut ke Aplikasi ({timeLeft}s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
