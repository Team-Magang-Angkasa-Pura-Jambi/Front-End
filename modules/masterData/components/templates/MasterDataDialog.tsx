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

// 1. Fix Typo dan Definisikan Mapping Width
export type MaxWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";

const widthClasses: Record<MaxWidth, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  "6xl": "sm:max-w-6xl",
  "7xl": "sm:max-w-7xl",
  full: "sm:max-w-[calc(100vw-2rem)]", // Full width dengan sedikit margin
};

interface MasterDataDialogProps {
  // Trigger Props
  triggerLabel?: string; // Optional, jika tombol custom
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
  maxWidth?: MaxWidth;
}

export const MasterDataDialog = ({
  triggerLabel = "Tambah Data",
  triggerIcon = <Plus className="mr-1.5 h-4 w-4" />,
  triggerClassName,
  onTriggerClick,
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "2xl",
}: MasterDataDialogProps) => {
  // Helper untuk mendapatkan class width yang valid
  const sizeClass = widthClasses[maxWidth] || widthClasses["2xl"];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={(e) => {
            // Jalankan custom logic (misal: reset form) sebelum dialog trigger bawaan
            if (onTriggerClick) onTriggerClick();
          }}
          className={cn("rounded-full font-bold shadow-md active:scale-95", triggerClassName)}
        >
          {triggerIcon}
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        // 2. Setup Layout Modal: Max Height & Width
        className={cn(
          "max-h-[85vh] overflow-hidden border-none bg-transparent p-0 shadow-2xl",
          "flex flex-col gap-0", // Reset gap default shadcn
          sizeClass
        )}
      >
        <div className="bg-background flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
          {/* 3. Header Section (Sticky Top) */}
          <div className="bg-muted/10 shrink-0 border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-foreground text-xl font-bold tracking-tight">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground text-sm">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          </div>

          {/* 4. Content Section (Scrollable) */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
