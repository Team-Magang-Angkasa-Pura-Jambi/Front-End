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
              className="border-border/50 bg-card/40 flex items-start gap-4 rounded-lg border p-4"
            >
              {/* Checkbox Skeleton */}
              <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-sm" />

              {/* Icon Circle Skeleton */}
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />

              <div className="flex-1 space-y-2">
                {/* Title & Badge */}
                <div className="flex w-full justify-between gap-4">
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
        <div className="text-destructive border-destructive/20 bg-destructive/[0.02] m-4 flex h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8">
          <div className="bg-destructive/10 ring-destructive/30 mb-4 rounded-full p-4 ring-1">
            <AlertTriangle className="h-10 w-10 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-widest">
            System Failure
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xs text-center text-sm">
            Gagal menyinkronkan data log notifikasi. Jalur komunikasi terputus.
          </p>
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 mt-6"
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
        <div className="relative flex h-[500px] select-none flex-col items-center justify-center overflow-hidden text-center">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-muted ring-muted/20 animate-in zoom-in-50 mb-6 rounded-full p-6 ring-8 duration-500">
              <Inbox className="text-muted-foreground h-12 w-12" />
            </div>

            <h3 className="text-foreground text-xl font-black tracking-tight">
              SYSTEM IDLE
            </h3>

            <div className="bg-primary/5 border-primary/20 mt-3 flex items-center gap-2 rounded-full border px-4 py-1.5">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              <span className="text-primary font-mono text-xs font-medium uppercase">
                No logs in{" "}
                {activeTab === "generals" ? "All Channels" : activeTab}
              </span>
            </div>

            <p className="text-muted-foreground/60 mt-4 max-w-sm text-sm">
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
      className="mt-0 w-full focus-visible:outline-none"
    >
      {renderContent()}
    </TabsContent>
  );
};
