"use client";

import { ThemeToggle } from "@/common/components/ui/ThemeToggle";
import { Card } from "@/common/components/ui/card"; // Pastikan path ini benar
import { Skeleton } from "@/common/components/ui/skeleton"; // Opsional: untuk loading state
import { getUserApi } from "@/modules/profile/services/users.service";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { NotificationPopover } from "./NotificationPopover";
import { useEffect, useState } from "react";

export const Header = () => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState("");
  const [greeting, setGreeting] = useState("");

  const { data: response } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: () => getUserApi(Number(user?.id)),
    enabled: !!user,
  });
  const profile = response?.data;

  // Handle Hydration & Date Logic
  useEffect(() => {
    setMounted(true);
    const now = new Date();

    // Format Tanggal: Sunday, June 25, 2024
    setDateString(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    // Logic Sapaan
    const hour = now.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  if (!mounted) return <Skeleton className="h-24 w-full rounded-xl" />;

  return (
    <Card className="mb-6 w-full border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: User Profile */}
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-slate-800">
            <Image
              width={50}
              height={50}
              src={profile?.image_url || "https://assets.aceternity.com/manu.png"}
              alt="User Avatar"
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg leading-tight font-bold text-slate-900 dark:text-slate-100">
              {greeting}, {user?.username || "Guest"}! 👋
            </h1>
            <p className="text-muted-foreground text-xs font-medium">{dateString}</p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <NotificationPopover />
          <ThemeToggle />
        </div>
      </div>
    </Card>
  );
};
