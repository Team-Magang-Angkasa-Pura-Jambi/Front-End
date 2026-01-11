// src/app/notification-center/types.ts
export type TabType = "generals" | "meters" | "system";
// src/app/types/index.ts (atau lokasi types Anda)

export type AlertStatus = "NEW" | "READ" | "HANDLED";

export interface NotificationUI {
  id: string; // ID Unik String (ex: "alert-1", "notif-5")
  rawId: number; // ID Asli Database (ex: 1, 5)
  type: "alert" | "notification";
  title: string;
  description: string;
  date: string | Date; // Tanggal untuk sorting
  is_read: boolean;
  status: AlertStatus | "INFO";

  // Data Spesifik Alert
  meter_code?: string | null;
  energy_type?: string | null;
  acknowledged_by?: { username: string } | null;
}
