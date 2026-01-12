import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";

export type NotificationData = {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
};

export type NotifPayload = {
  notifications: NotificationData[];
  meta: {
    count: number;
  };
};

const prefix = "/notifications";

export const getNotificationApi = async (): Promise<
  ApiResponse<NotifPayload>
> => {
  const response = await api.get(prefix);
  return response.data;
};

export const readNotificationApi = async (
  notificationId: number
): Promise<ApiResponse<NotificationData>> => {
  const response = await api.patch(`${prefix}/${notificationId}/mark-as-read`);

  return response.data;
};

export const readAllNotificationsApi = async (
  notificationIds: number[]
): Promise<ApiResponse<NotificationData[]>> => {
  const response = await api.patch(`${prefix}/bulk-read`, { notificationIds });

  return response.data;
};

export const bulkDeleteAlertApi = async (
  notificationIds: number[]
): Promise<ApiResponse<NotificationData[]>> => {
  const response = await api.post(`${prefix}/bulk-delete`, { notificationIds });
  return response.data;
};
