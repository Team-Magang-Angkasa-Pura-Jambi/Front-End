// src/app/notification-center/_components/notification-actions.tsx
import { CheckCheck, MailOpen, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Separator } from "@/common/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip"; // Asumsi Anda punya tooltip

interface NotificationActionsProps {
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  selectedCount: number;

  isMarkingSelected: boolean;
  onMarkSelectedRead: () => void;

  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllRead: () => void;

  isDeletingSelected: boolean;
  onDeleteSelected: () => void;

  onDeleteAll: () => void;

  // New Prop
  isDisabled?: boolean;
}

export const NotificationActions = ({
  isAllSelected,
  onSelectAll,
  selectedCount,
  isMarkingSelected,
  onMarkSelectedRead,
  unreadCount,
  isMarkingAll,
  onMarkAllRead,
  isDeletingSelected,
  onDeleteSelected,
  onDeleteAll,
  isDisabled = false,
}: NotificationActionsProps) => (
  <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
    {/* Left Group: Selection */}
    <div className="flex items-center gap-3">
      <div className="bg-muted/30 border-border/50 flex items-center gap-2 rounded-md border px-3 py-2">
        <Checkbox
          id="select-all"
          checked={isAllSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
          disabled={isDisabled}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <label
          htmlFor="select-all"
          className="text-muted-foreground cursor-pointer select-none text-xs font-medium uppercase tracking-wider"
        >
          Select All
        </label>
      </div>

      {selectedCount > 0 && (
        <span className="text-primary animate-in fade-in slide-in-from-left-2 text-xs font-bold">
          {selectedCount} Selected
        </span>
      )}
    </div>

    <div className="flex-1" />

    {/* Right Group: Actions */}
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      {/* Mark Actions */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDisabled || selectedCount === 0 || isMarkingSelected}
              onClick={onMarkSelectedRead}
              className="h-8 gap-2 text-xs"
            >
              <MailOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark Read</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tandai yang dipilih sebagai dibaca</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="sm"
        disabled={isDisabled || unreadCount === 0 || isMarkingAll}
        onClick={onMarkAllRead}
        className="text-muted-foreground hover:text-primary h-8 gap-2 text-xs"
      >
        <CheckCheck className="h-3.5 w-3.5" />
        Mark All Read
      </Button>

      <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

      {/* Delete Actions */}
      <Button
        variant="destructive"
        size="sm"
        disabled={isDisabled || selectedCount === 0 || isDeletingSelected}
        onClick={onDeleteSelected}
        className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 h-8 gap-2 border text-xs"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete ({selectedCount})
      </Button>

      {/* Tombol Clear All (Hapus Semua) - Opsional, tapi ada di props */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDisabled}
              onClick={onDeleteAll}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-destructive text-destructive">
            Hapus SEMUA Notifikasi (Clear Log)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);
