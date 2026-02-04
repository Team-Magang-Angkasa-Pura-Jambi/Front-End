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
  Info,
  FlaskConical,
  ExternalLink,
  Wrench, // Ikon perbaikan/dev
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-blue-600">
            <Info className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Informasi Pengembangan
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Halo, Selamat Datang! 👋
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Terima kasih telah mengakses dashboard sistem ini.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* IDENTITAS (Nada: Ramah & Memperkenalkan Diri) */}
          <div className="flex items-start gap-4 rounded-lg border bg-blue-50/50 p-4 text-slate-800">
            <GraduationCap className="mt-1 h-8 w-8 shrink-0 text-blue-600" />
            <div className="space-y-2">
              <h4 className="text-base font-semibold">
                Perkenalkan, Kami Mahasiswa UNJA
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Kami dari prodi{" "}
                <strong>Sistem Informasi Universitas Jambi</strong> sedang
                melakukan penelitian tugas akhir. Sistem ini kami bangun untuk
                membantu operasional di sini. Mohon dukungan Bapak/Ibu untuk
                mencoba menggunakannya.
              </p>
            </div>
          </div>

          {/* STATUS DEV & BUG (Nada: Santai tapi Jelas) */}
          <div className="flex items-start gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
            <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800">
                Masih Tahap Pengembangan (Beta)
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Karena masih dalam tahap uji coba, mungkin Bapak/Ibu akan
                menemukan sedikit kendala atau <i>error</i>. Jika ada yang tidak
                berfungsi, boleh langsung infokan ke{" "}
                <strong>Super Admin</strong> ya, Pak/Bu.
              </p>
            </div>
          </div>

          {/* SECTION UAT (Nada: Mengajak/Meminta Tolong) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1">
              <FlaskConical className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-gray-800">
                Bantu Kami Menilai Aplikasi
              </h4>
            </div>

            <p className="text-sm text-gray-600">
              Kami sangat terbantu jika Bapak/Ibu berkenan meluangkan waktu
              sebentar untuk mencoba alur aplikasi dan mengisi penilaian singkat
              di bawah ini:
            </p>

            <div className="mt-2 grid grid-cols-1 gap-6 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-[150px_1fr]">
              {/* QR CODE - Ukuran Besar */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex h-[150px] w-[150px] items-center justify-center rounded-lg border bg-white p-1">
                  <Image
                    src="/image/qr-code-placeholder.png"
                    alt="Scan Barcode"
                    width={140}
                    height={140}
                    className="object-contain"
                  />
                </div>
                <span className="text-center text-[10px] font-medium text-gray-500">
                  Scan lewat HP
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col justify-center gap-3">
                <Button
                  asChild
                  className="w-full justify-between bg-blue-600 shadow-sm hover:bg-blue-700"
                >
                  <Link href="https://maze.co/link-anda" target="_blank">
                    <span className="flex flex-col items-start text-left">
                      <span className="text-[11px] font-light opacity-90">
                        Langkah 1
                      </span>
                      <span className="font-semibold">
                        Coba Simulasi (Maze)
                      </span>
                    </span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Link
                    href="https://forms.office.com/r/tUmXpXK05B"
                    target="_blank"
                  >
                    <span className="flex flex-col items-start text-left">
                      <span className="text-[11px] font-normal text-gray-500">
                        Langkah 2
                      </span>
                      <span className="font-semibold">
                        Isi Penilaian Singkat
                      </span>
                    </span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 border-t pt-4">
          <Button
            onClick={handleClose}
            variant="default"
            className="w-full min-w-[150px] sm:w-auto"
          >
            Masuk ke Aplikasi ({timeLeft}s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
