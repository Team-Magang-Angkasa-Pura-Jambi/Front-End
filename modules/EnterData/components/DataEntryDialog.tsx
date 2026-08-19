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
  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="2xl" className="max-h-[92vh] overflow-hidden p-6 gap-3">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border/50">
          <DialogTitle className="text-xl font-black tracking-tight">
            {details.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {details.description}
          </DialogDescription>
        </DialogHeader>

        {/* Kontainer Form */}
        <div className="w-full">
          {details.form}
        </div>
      </DialogContent>
    </Dialog>
  );
};
