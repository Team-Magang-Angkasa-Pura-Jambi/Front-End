import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

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
}: EntryDataProps) => {
  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{details.title}</DialogTitle>
          <DialogDescription>{details.description}</DialogDescription>
        </DialogHeader>
        {details.form}
      </DialogContent>
    </Dialog>
  );
};
