import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";

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
  user_id: number;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  is_read: boolean;
  reference_table: string | null;
  reference_id: number | null;
  created_at: string;
}

export interface NotificationPayload {
  notifications: NotificationItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    unread_count: number;
  };
}

const prefix = "/notifications";

export const notificationService = {
  getAll: async (): Promise<ApiResponse<NotificationPayload>> => {
    const response = await api.get(prefix);
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<ApiResponse<NotificationItem>> => {
    const response = await api.patch(`${prefix}/${notificationId}/read`);
    return response.data;
  },

  bulkMarkAsRead: async (notificationIds: number[]): Promise<ApiResponse<NotificationItem[]>> => {
    // Backend mengharapkan payload berupa { ids: [...] }
    const response = await api.patch(`${prefix}/bulk-read`, { ids: notificationIds });
    return response.data;
  },

  bulkDelete: async (notificationIds: number[]): Promise<ApiResponse<NotificationItem[]>> => {
    // Backend mengharapkan endpoint /bulk-remove dan payload { ids: [...] }
    const response = await api.post(`${prefix}/bulk-remove`, { ids: notificationIds });
    return response.data;
  },

  delete: async (notificationId: number): Promise<ApiResponse<NotificationItem>> => {
    const response = await api.delete(`${prefix}/${notificationId}`);
    return response.data;
  },
};
