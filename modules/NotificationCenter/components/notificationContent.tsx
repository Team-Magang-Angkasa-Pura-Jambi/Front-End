// src/app/notification-center/_components/notification-content.tsx

import { Inbox, AlertTriangle, RefreshCw } from "lucide-react";
import { TabsContent } from "@/common/components/ui/tabs";
import { NotificationUI, TabType } from "../types";
import { NotificationList } from "./notificationList";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Button } from "@/common/components/ui/button";

interface NotificationContentProps {
  isLoading: boolean;
  isError: boolean;
  notifications?: NotificationUI[]; // Update ke tipe yang sudah dinormalisasi
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onItemClick: (notification: NotificationUI) => void;
  activeTab: TabType;
  onRetry?: () => void; // Tambahan untuk handling error refetch
}

export const NotificationContent = ({
  isLoading,
  isError,
  notifications,
  activeTab,
  onRetry,
  ...listProps
}: NotificationContentProps) => {
  const renderContent = () => {
    // 1. LOADING STATE (Sesuai layout NotificationItem baru)
    if (isLoading) {
      return (
        <div className="space-y-3 p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 border border-border/50 rounded-lg bg-card/40"
            >
              {/* Checkbox Skeleton */}
              <Skeleton className="h-4 w-4 mt-1 rounded-sm shrink-0" />

              {/* Icon Circle Skeleton */}
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />

              <div className="flex-1 space-y-2">
                {/* Title & Badge */}
                <div className="flex justify-between w-full gap-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Description */}
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />

                {/* Metadata Footer */}
                <div className="pt-2">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 2. ERROR STATE
    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-destructive p-8 border-2 border-dashed border-destructive/20 m-4 rounded-xl bg-destructive/[0.02]">
          <div className="bg-destructive/10 p-4 rounded-full mb-4 ring-1 ring-destructive/30">
            <AlertTriangle className="h-10 w-10 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-widest">
            System Failure
          </h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
            Gagal menyinkronkan data log notifikasi. Jalur komunikasi terputus.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => (onRetry ? onRetry() : window.location.reload())}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Re-establish Connection
          </Button>
        </div>
      );
    }

    // 3. EMPTY STATE
    if (!notifications || notifications.length === 0) {
      return (
        <div className="relative flex flex-col items-center justify-center h-[500px] text-center overflow-hidden select-none">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-muted p-6 rounded-full mb-6 ring-8 ring-muted/20 animate-in zoom-in-50 duration-500">
              <Inbox className="h-12 w-12 text-muted-foreground" />
            </div>

            <h3 className="text-xl font-black tracking-tight text-foreground">
              SYSTEM IDLE
            </h3>

            <div className="flex items-center gap-2 mt-3 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary font-medium uppercase">
                No logs in{" "}
                {activeTab === "generals" ? "All Channels" : activeTab}
              </span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground/60 max-w-sm">
              Tidak ada aktivitas yang memerlukan perhatian operator saat ini.
            </p>
          </div>
        </div>
      );
    }

    // 4. DATA LIST
    return <NotificationList notifications={notifications} {...listProps} />;
  };

  return (
    <TabsContent
      value={activeTab}
      className="mt-0 focus-visible:outline-none w-full"
    >
      {renderContent()}
    </TabsContent>
  );
};
