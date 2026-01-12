// src/app/notification-center/_components/notification-tabs.tsx
import { Bell, Gauge, ShieldAlert } from "lucide-react";
import { TabsList, TabsTrigger } from "@/common/components/ui/tabs";

export const NotificationTabs = () => (
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="all">
      <Bell className="mr-2 h-4 w-4" /> Semua
    </TabsTrigger>
    <TabsTrigger value="meter">
      <Gauge className="mr-2 h-4 w-4" /> Alert Meter
    </TabsTrigger>
    <TabsTrigger value="system">
      <ShieldAlert className="mr-2 h-4 w-4" /> Alert Sistem
    </TabsTrigger>
  </TabsList>
);
