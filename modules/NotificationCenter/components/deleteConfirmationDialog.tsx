// src/app/notification-center/_components/delete-confirmation-dialog.tsx
import { Loader2 } from "lucide-react";
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

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogAction: "delete-all" | "delete-selected" | null;
  selectedCount: number;
  onConfirm: () => void;
  isPending: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  dialogAction,
  selectedCount,
  onConfirm,
  isPending,
}: DeleteConfirmationDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
        <AlertDialogDescription>
          {dialogAction === "delete-all"
            ? "Apakah Anda yakin ingin menghapus SEMUA notifikasi? Tindakan ini tidak dapat dibatalkan."
            : `Apakah Anda yakin ingin menghapus ${selectedCount} notifikasi yang dipilih?`}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive hover:bg-destructive/90"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Ya, Hapus"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
