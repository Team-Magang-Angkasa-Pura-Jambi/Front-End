// src/app/notification-center/_components/notification-header.tsx
import { Bell } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationHeaderProps {
  unreadCount: number;
}

export const NotificationHeader = ({
  unreadCount,
}: NotificationHeaderProps) => (
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-2xl">
      <Bell /> Pusat Notifikasi
    </CardTitle>
    <CardDescription>
      {unreadCount > 0
        ? `Anda memiliki ${unreadCount} notifikasi belum dibaca.`
        : "Semua notifikasi sudah dibaca."}
    </CardDescription>
  </CardHeader>
);
