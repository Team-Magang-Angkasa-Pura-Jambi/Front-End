// components/NotificationCard.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IconBell,
  IconLoader,
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { fetchLatestAlertApi } from "@/services/notification.service";

// --- Helper untuk menentukan gaya notifikasi ---
const getNotificationStyle = (title: string) => {
  const lowerCaseTitle = title?.toLowerCase();
  if (
    lowerCaseTitle?.includes("risiko") ||
    lowerCaseTitle?.includes("anomali")
  ) {
    return { Icon: IconAlertTriangle, color: "red" };
  }
  if (
    lowerCaseTitle?.includes("sukses") ||
    lowerCaseTitle?.includes("selesai")
  ) {
    return { Icon: IconCircleCheck, color: "green" };
  }
  // Default untuk "Pengingat", "Peringatan", dll.
  return { Icon: IconBell, color: "yellow" };
};

export const NotificationCard = () => {
  const { data: latestAlertResponse, isLoading } = useQuery({
    queryKey: ["latestNotification"],
    queryFn: () => fetchLatestAlertApi(),
  });
  const notification = latestAlertResponse?.data;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl flex items-center shadow-sm">
        <IconLoader className="animate-spin text-gray-400" />
        <p className="ml-4 text-gray-500">Memuat notifikasi...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="bg-white p-6 rounded-2xl flex items-center shadow-sm">
        <IconInfoCircle className="text-green-500" />
        <p className="ml-4 text-gray-600">
          Tidak ada notifikasi baru saat ini. Kerja bagus!
        </p>
      </div>
    );
  }

  // Tentukan ikon dan warna secara dinamis
  const { Icon, color } = getNotificationStyle(notification.title);
  const colorClasses = {
    red: { bg: "bg-red-100", text: "text-red-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
  };
  const styles = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className={`${styles.bg} p-3 rounded-full`}>
          <Icon className={`w-6 h-6 ${styles.text}`} />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">{notification.title}</h2>
          <p className="text-gray-600">{notification.message}</p>
        </div>
      </div>
      {notification.link && (
        // PERBAIKAN: Komponen Link di Next.js modern tidak lagi memerlukan tag <a> di dalamnya.
        // ClassName dan props lainnya bisa langsung diterapkan pada Link.
        <Link
          href={notification.link}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Lihat Detail
        </Link>
      )}
    </div>
  );
};
