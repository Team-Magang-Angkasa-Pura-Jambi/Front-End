"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { NotificationPopover } from "./NotificationPopover";
import { ThemeToggle } from "@/common/components/ui/ThemeToggle";
import { Card } from "@/common/components/ui/card"; // Pastikan path ini benar
import { Skeleton } from "@/common/components/ui/skeleton"; // Opsional: untuk loading state

export const Header = () => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState("");
  const [greeting, setGreeting] = useState("");

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

  if (!mounted) return <Skeleton className="w-full h-24 rounded-xl" />;

  return (
    <Card className="w-full p-4 mb-6 shadow-sm border-slate-200 /50 /50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left Side: User Profile */}
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-slate-800">
            <Image
              width={50}
              height={50}
              src="https://assets.aceternity.com/manu.png"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
              {greeting}, {user?.username || "Guest"}! 👋
            </h1>
            <p className="text-xs font-medium text-muted-foreground">
              {dateString}
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-8 w-[1px] bg-background dark:bg-background hidden md:block mx-2"></div>
          <NotificationPopover />
          <ThemeToggle />
        </div>
      </div>
    </Card>
  );
};
