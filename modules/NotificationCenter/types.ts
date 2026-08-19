// NotificationCenter/types.ts

export type NotificationCategory =
  | "SYSTEM"
  | "THRESHOLD_BREACH"
  | "ANOMALY_DETECTED"
  | "MAINTENANCE"
  | "BUDGET_WARNING"
  | "DATA_ENTRY";

export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export interface NotificationItem {
  notification_id: number;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  is_read: boolean;
  reference_table: string | null;
  reference_id: number | null;
  created_at: string;
}

export interface NotificationResponse {
  data: NotificationItem[];
  meta: {
    unread_count: number;
    total: number;
  };
}
