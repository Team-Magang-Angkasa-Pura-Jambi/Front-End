"use client";

import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface SentinelFormDialogProps {
  // Trigger Props
  triggerLabel: string;
  triggerIcon?: ReactNode;
  triggerClassName?: string;
  onTriggerClick?: () => void;

  // Dialog State
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  // Content Props
  title: string;
  description?: string;
  children: ReactNode;

  // Customization
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "full";
}

export const MasterDataDialog = ({
  triggerLabel,
  triggerIcon = <Plus className="mr-1.5 h-4 w-4" />,
  triggerClassName,
  onTriggerClick,
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "2xl",
}: SentinelFormDialogProps) => {
  const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "6xl": "lg:max-w-6xl sm:max-w-[90vw]",
    full: "sm:max-w-[95vw]",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={onTriggerClick}
          className={cn("rounded-full font-bold shadow-md active:scale-95", triggerClassName)}
        >
          {triggerIcon}
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "h- overflow-y-auto border-none bg-transparent p-0 shadow-none",
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="bg-background flex h-full flex-col overflow-hidden rounded-2xl border shadow-lg">
          {/* Header Section (Sticky) */}
          <div className="bg-muted/20 shrink-0 border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold tracking-tight">{title}</DialogTitle>
              <DialogDescription className="font-medium">{description}</DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Content Section (Scrollable) */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
