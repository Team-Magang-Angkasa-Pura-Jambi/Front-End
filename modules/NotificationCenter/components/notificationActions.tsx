// src/app/notification-center/_components/notification-actions.tsx
import { CheckCheck, MailOpen, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";

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
}: NotificationActionsProps) => (
  <div className="flex flex-wrap items-center gap-2 border-b pb-4 mb-4">
    <Checkbox
      checked={isAllSelected}
      onCheckedChange={(checked) => onSelectAll(!!checked)}
      aria-label="Pilih semua"
    />
    <Button
      variant="outline"
      size="sm"
      disabled={selectedCount === 0 || isMarkingSelected}
      onClick={onMarkSelectedRead}
    >
      <MailOpen className="mr-2 h-4 w-4" /> Tandai Terpilih
    </Button>
    <Button
      variant="outline"
      size="sm"
      disabled={unreadCount === 0 || isMarkingAll}
      onClick={onMarkAllRead}
    >
      <CheckCheck className="mr-2 h-4 w-4" /> Tandai Semua
    </Button>
    <div className="flex-grow" />
    <Button
      variant="destructive"
      size="sm"
      disabled={selectedCount === 0 || isDeletingSelected}
      onClick={onDeleteSelected}
    >
      <Trash2 className="mr-2 h-4 w-4" /> Hapus Terpilih
    </Button>
  </div>
);
