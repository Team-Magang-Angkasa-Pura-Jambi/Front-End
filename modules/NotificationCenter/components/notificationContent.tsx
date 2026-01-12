// src/app/notification-center/_components/notification-content.tsx
import { Inbox, Loader2, ServerCrash } from "lucide-react";
import { TabsContent } from "@/common/components/ui/tabs";
import { AlertNotification } from "@/services/notification.service";
import { TabType } from "../types";
import { NotificationList } from "./notificationList";
import { Skeleton } from "@/common/components/ui/skeleton";

interface NotificationContentProps {
  isLoading: boolean;
  isError: boolean;
  notifications?: AlertNotification[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onItemClick: (notification: AlertNotification) => void;
  activeTab: TabType;
}

export const NotificationContent = ({
  isLoading,
  isError,
  notifications,
  activeTab,
  ...listProps
}: NotificationContentProps) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <Skeleton className="h-5 w-5 mt-1" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-destructive">
          <ServerCrash className="h-12 w-12" />
          <p className="mt-4 font-semibold">Gagal memuat data.</p>
        </div>
      );
    }
    if (!notifications || notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Inbox className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Kotak Masuk Kosong</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Anda belum memiliki notifikasi baru.
          </p>
        </div>
      );
    }
    return <NotificationList notifications={notifications} {...listProps} />;
  };

  return (
    <TabsContent value={activeTab} className="mt-0">
      {renderContent()}
    </TabsContent>
  );
};
