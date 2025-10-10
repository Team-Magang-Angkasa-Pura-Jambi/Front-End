"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Loader2, Inbox } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchAllNotifications } from "@/services/notification.service";
import { ScrollArea } from "@/components/ui/scroll-area";

export const NotificationPopover = () => {
  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allNotifications"],
    queryFn: fetchAllNotifications,
    staleTime: 1000 * 60, // 1 minute
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative ">
          <Bell className="h-6 w-6 text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0  mr-10">
        <div className="p-4 font-semibold border-b">
          Notifikasi ({unreadCount})
        </div>
        <ScrollArea className="h-80">
          <div className="p-2">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {isError && (
              <div className="p-4 text-center text-sm text-red-500">
                Gagal memuat notifikasi.
              </div>
            )}

            {!isLoading && (!notifications || notifications.length === 0) && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">
                  Tidak ada notifikasi
                </p>
                <p className="text-xs text-muted-foreground">
                  Semua notifikasi akan muncul di sini.
                </p>
              </div>
            )}

            {!isLoading &&
              notifications?.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg hover:bg-accent ${
                    !notif.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <p className="text-sm font-semibold">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {notif.message}
                  </p>
                  {notif.createdAt && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Link href="/notifications" passHref>
            <Button variant="link" className="text-sm">
              Lihat Semua Notifikasi
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
