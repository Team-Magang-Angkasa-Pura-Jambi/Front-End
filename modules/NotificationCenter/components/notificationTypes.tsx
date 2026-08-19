"use client";

import { Button } from "@/common/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificationHeaderProps {
  unreadCount: number;
}

export const NotificationHeader = ({ unreadCount }: NotificationHeaderProps) => {
  const router = useRouter();

  return (
    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="mt-0.5 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        title="Kembali ke halaman sebelumnya"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-col gap-1.5">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Bell className="text-primary h-6 w-6" /> Pusat Notifikasi
        </CardTitle>
        <CardDescription className="text-sm">
          {unreadCount > 0 ? (
            <span>
              Anda memiliki{" "}
              <strong className="text-foreground font-semibold">{unreadCount} notifikasi</strong>{" "}
              belum dibaca.
            </span>
          ) : (
            "Semua notifikasi sudah dibaca."
          )}
        </CardDescription>
      </div>
    </CardHeader>
  );
};
