// components/NotificationCard.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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

import { ComponentLoader } from "@/common/components/ComponentLoader";
import { colorClasses, getNotificationStyle } from "../constants";

export const NotificationStyle = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: latestAlertResponse, isLoading } = useQuery({
    queryKey: ["latestNotification"],
    queryFn: () => fetchLatestAlertApi(),
    refetchInterval: 60000,
  });

  const notifications = useMemo(
    () => latestAlertResponse?.data || [],
    [latestAlertResponse]
  );

  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [notifications.length]);

  const notification = notifications[currentIndex];

  if (isLoading) {
    return <ComponentLoader />;
  }

  if (!notification) {
    return (
      <div className="bg-card flex items-center rounded-2xl p-6 shadow-sm">
        <IconInfoCircle className="text-green-500" />
        <p className="text-muted-foreground ml-4">
          Tidak ada notifikasi baru saat ini. Kerja bagus!
        </p>
      </div>
    );
  }

  const { Icon, color } = getNotificationStyle(notification.title);

  const styles = colorClasses[color];

  return (
    <div className="bg-card flex flex-col justify-between gap-4 overflow-hidden rounded-2xl p-6 shadow-sm md:flex-row md:items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex w-full items-center"
        >
          <div className="flex items-center space-x-4">
            <div className={`${styles.bg} rounded-full p-3`}>
              <Icon className={`h-6 w-6 ${styles.text}`} />
            </div>
            <div>
              <h2 className="text-foreground font-bold">
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
        className="w-full shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-blue-700 md:ml-4 md:w-auto"
      >
        Lihat Semua
      </Link>
    </div>
  );
};
