"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Mendefinisikan tipe props untuk komponen
interface ManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string; // Deskripsi bersifat opsional
  children: React.ReactNode; // Konten yang akan ditampilkan di dalam dialog
}

/**
 * Komponen Dialog yang dapat digunakan kembali untuk menampilkan form atau konten lainnya.
 * Mengelola state buka/tutup dan menampilkan judul serta deskripsi.
 */
export function ManagementDialog({
  isOpen,
  onClose,
  title,
  description = "Isi detail di bawah ini. Klik simpan jika sudah selesai.", // Nilai default untuk deskripsi
  children,
}: ManagementDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {/* Konten utama (misalnya, form) dirender di sini */}
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
