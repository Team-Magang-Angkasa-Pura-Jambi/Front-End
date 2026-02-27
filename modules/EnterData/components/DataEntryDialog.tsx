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

export interface DataEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  details: DialogDetails | null;
}

export const DataEntryDialog = ({ isOpen, onClose, details }: DataEntryDialogProps) => {
  // Cegah render jika details belum siap (saat transisi ganti kategori)
  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden border-none p-0 shadow-2xl sm:max-w-[700px]">
        {/* Header dengan padding yang lebih manis */}
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black tracking-tight italic">
            {details.title}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium opacity-70">
            {details.description}
          </DialogDescription>
        </DialogHeader>

        {/* Kontainer Form */}
        <div className="flex-1 overflow-hidden p-3">{details.form}</div>
      </DialogContent>
    </Dialog>
  );
};
