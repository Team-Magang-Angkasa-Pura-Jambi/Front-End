"use client";

import { useEffect, useState } from "react";
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
  Wrench,
  GraduationCap,
  MousePointer2,
  ClipboardCheck,
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
          {/* IDENTITAS */}
          <div className="flex items-start gap-4 rounded-lg border bg-blue-50/50 p-4 text-slate-800">
            <GraduationCap className="mt-1 h-8 w-8 shrink-0 text-blue-600" />
            <div className="space-y-2">
              <h4 className="text-base font-semibold">
                Perkenalkan, Kami Mahasiswa UNJA
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Kami dari prodi{" "}
                <strong>Sistem Informasi Universitas Jambi</strong> sedang
                melakukan penelitian tugas akhir. Mohon dukungan Bapak/Ibu untuk
                mencoba alur aplikasi ini.
              </p>
            </div>
          </div>

          {/* STATUS DEV */}
          <div className="flex items-start gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
            <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800">
                Tahap Pengembangan (Beta)
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Jika ada kendala, silakan infokan ke{" "}
                <strong>Super Admin</strong>.
              </p>
            </div>
          </div>

          {/* SECTION ACTION - TANPA QR */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-gray-800">
                Bantu Kami Menilai Aplikasi
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Langkah 1: Simulasi */}
              <Link
                href="https://t.maze.co/495221427"
                target="_blank"
                className="group flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-blue-400 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <MousePointer2 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Langkah 1
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-gray-900">
                    Coba Simulasi
                  </h5>
                  <p className="text-[11px] text-gray-500 italic">
                    Uji alur sistem melalui Maze.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-medium text-blue-600">
                  Klik di sini <ExternalLink className="ml-1 h-3 w-3" />
                </div>
              </Link>

              {/* Langkah 2: Penilaian */}
              <Link
                href="https://forms.office.com/r/tUmXpXK05B"
                target="_blank"
                className="group flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-indigo-400 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Langkah 2
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-gray-900">
                    Isi Penilaian
                  </h5>
                  <p className="text-[11px] text-gray-500 italic">
                    Berikan masukan singkat Anda.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-medium text-indigo-600">
                  Buka Form <ExternalLink className="ml-1 h-3 w-3" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button
            onClick={handleClose}
            variant="default"
            className="w-full sm:w-auto"
          >
            Masuk ke Aplikasi ({timeLeft}s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
