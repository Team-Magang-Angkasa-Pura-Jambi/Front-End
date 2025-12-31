// components/NotificationCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IconBell,
  IconLoader,
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: latestAlertResponse, isLoading } = useQuery({
    queryKey: ["latestNotification"],
    queryFn: () => fetchLatestAlertApi(),
    // Mengambil data setiap 1 menit untuk menjaga kesegaran
    refetchInterval: 60000,
  });
  console.log(latestAlertResponse);

  // API mengembalikan array, jadi kita ambil datanya
  const notifications = latestAlertResponse?.data || [];
  // console.log(notifications);

  useEffect(() => {
    // Hanya jalankan interval jika ada lebih dari satu notifikasi
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length);
      }, 5000); // Ganti notifikasi setiap 5 detik

      return () => clearInterval(interval);
    }
  }, [notifications.length]); // PERBAIKAN: Ubah dependensi ke panjang array

  const notification = notifications[currentIndex];

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-2xl flex items-center shadow-sm">
        <IconLoader className="animate-spin text-gray-400" />
        <p className="ml-4 text-muted-foreground">Memuat notifikasi...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="bg-card p-6 rounded-2xl flex items-center shadow-sm">
        <IconInfoCircle className="text-green-500" />
        <p className="ml-4 text-muted-foreground">
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
    <div className="bg-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center w-full"
        >
          <div className="flex items-center space-x-4">
            <div className={`${styles.bg} p-3 rounded-full`}>
              <Icon className={`w-6 h-6 ${styles.text}`} />
            </div>
            <div>
              <h2 className="font-bold text-foreground">
                {notification.title}
              </h2>
              <p className="text-muted-foreground">
                {notification.description}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <Link
        href="/notification-center"
        className="bg-blue-600 text-white text-center px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition md:ml-4 shrink-0 w-full md:w-auto"
      >
        Lihat Semua
      </Link>
    </div>
  );
};
