import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DialogDetails {
  title: string;
  description: string;
  form: React.ReactNode;
}

export interface EntryDataProps {
  isOpen: boolean;
  onClose: () => void;
  details: DialogDetails | null;

  onSubmit: (e: React.FormEvent) => void;

  isSubmitting: boolean;
}

export const DataEntryDialog = ({
  isOpen,
  onClose,
  details,
  onSubmit,
  isSubmitting,
}: EntryDataProps) => {
  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{details.title}</DialogTitle>
            <DialogDescription>{details.description}</DialogDescription>
          </DialogHeader>
          {details.form}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
