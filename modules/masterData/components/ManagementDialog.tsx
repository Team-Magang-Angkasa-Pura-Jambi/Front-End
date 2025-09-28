"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Definisikan props yang akan diterima oleh komponen
interface ManagementDialogProps {
  /** Status apakah dialog sedang terbuka atau tertutup */
  isOpen: boolean;
  /** Fungsi untuk menutup dialog */
  onClose: () => void;
  /** Judul yang akan ditampilkan di header dialog */
  title: string;
  /** Deskripsi opsional di bawah judul */
  description?: string;
  /** Komponen anak (misalnya, form) yang akan ditampilkan di dalam dialog */
  children: React.ReactNode;
}

/**
 * Komponen Dialog yang dapat digunakan kembali untuk menampilkan form
 * manajemen data (Tambah/Edit).
 */
export const ManagementDialog: React.FC<ManagementDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()} // Mencegah dialog tertutup saat diklik di luar area
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Di sinilah form (MeterForm, PriceSchemeForm, dll.) akan dirender */}
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
