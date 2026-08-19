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

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDeleteDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin? Data yang dihapus tidak dapat dikembalikan.",
  confirmText = "Ya, Hapus Permanen",
  cancelText = "Batal",
}: ConfirmDeleteDialogProps) => {
  const handleConfirm = (e: React.MouseEvent) => {
    // Mencegah penutupan otomatis jika masih loading
    e.preventDefault();
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className="border-none bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
