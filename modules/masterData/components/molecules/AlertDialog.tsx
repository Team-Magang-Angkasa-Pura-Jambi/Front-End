"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useMeter } from "../../context/MeterContext";

export const DialogAction = () => {
  const {
    isDeleteOpen,
    setIsDeleteOpen,
    handleConfirmDelete, // Gunakan handler pembungkus ini
    selectedMeterId,
    isDeleting,
    setSelectedMeterId,
  } = useMeter();

  const onConfirmDelete = (e: React.MouseEvent) => {
    // Mencegah penutupan otomatis bawaan Radix agar kita bisa kontrol via state success
    e.preventDefault();

    if (selectedMeterId) {
      handleConfirmDelete();
    }
  };

  return (
    <AlertDialog
      open={isDeleteOpen}
      onOpenChange={(open) => {
        setIsDeleteOpen(open);
        // Reset state hanya jika dialog ditutup secara manual dan tidak sedang loading
        if (!open && !isDeleting) setSelectedMeterId(null);
      }}
    >
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            Apakah Anda yakin? Data meter dan seluruh **riwayat penggunaan** akan dihapus permanen.
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="border-none bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            onClick={onConfirmDelete}
            disabled={isDeleting || !selectedMeterId}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus Permanen"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
