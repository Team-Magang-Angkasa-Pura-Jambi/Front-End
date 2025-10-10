import api from "@/lib/api";
import { Notification } from "@/types/notification.types";

export const fetchAllNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get("/notifications");
    return response.data.data;
  } catch (error) {
    throw new Error("Failed to fetch notifications");
  }
};