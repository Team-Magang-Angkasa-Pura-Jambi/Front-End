import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";

// Tipe data untuk ringkasan harian per meter dari API
export interface NewDataCountNotification {
  summary_id: number;
  summary_date: string;
  total_consumption: string;
  total_cost: string;
  meter_id: number;
  meter: {
    meter_code: string;
    energy_type: {
      type_name: "Electricity" | "Water" | "Fuel";
      unit_of_measurement: string;
    };
  };
  classification: string | null;
}

// Tipe data untuk respons API ringkasan harian
interface TodaySummaryApiResponse {
  status: {
    code: number;
    message: string;
  };
  data: NewDataCountNotification[];
}

// Tipe data untuk notifikasi dari API /notifications
export interface GeneralNotification {
  notification_id: string;
  title: string;
  description: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Alert {
  alert_id: string;
  title: string;
  description: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// Tipe gabungan untuk digunakan di UI, dengan ID yang diseragamkan
export type NotificationOrAlert = (GeneralNotification | Alert) & {
  id: string;
  type: "notification" | "alert";
};

export const fetchTodaySummaryApi =
  async (): Promise<TodaySummaryApiResponse> => {
    const response = await api.get("/analytics/today-summary");
    return response.data;
  };

export const fetchAllNotificationsApi = async (): Promise<
  ApiResponse<GeneralNotification[]>
> => {
  const response = await api.get("/notifications"); // Endpoint untuk alert card
  return response.data;
};

export const fetchMeterAlertsApi = async (): Promise<ApiResponse<Alert[]>> => {
  const response = await api.get("/alerts/meters");
  return response.data;
};

export const fetchSystemAlertsApi = async (): Promise<ApiResponse<Alert[]>> => {
  const response = await api.get("/alerts/system");
  return response.data;
};

export const fetchLatestAlertApi = async (
  scope?: "system" | "meters"
): Promise<ApiResponse<Alert[]>> => {
  const response = await api.get("/alerts/latest", {
    params: { scope },
  });

  const apiResponse = response.data;
  const latestAlerts = apiResponse.data;

  // Jika ada data, kembalikan alert pertama (yang terbaru). Jika tidak, kembalikan null.
  if (latestAlerts && latestAlerts.length > 0) {
    return { ...apiResponse, data: latestAlerts };
  }

  // Jika tidak ada alert, kembalikan objek dengan data null.
  return { ...apiResponse, data: null };
};

export const markAsReadApi = async (
  notificationId: string
): Promise<ApiResponse<null>> => {
  const response = await api.patch(
    `/notifications/${notificationId}/mark-as-read`
  );
  return response.data;
};

export const markAlertAsReadApi = async (
  alertId: string
): Promise<ApiResponse<null>> => {
  const response = await api.patch(`/alerts/${alertId}/mark-as-read`);
  return response.data;
};

export const markAllAsReadApi = async (
  scope: "all" | "meters" | "system"
): Promise<ApiResponse<null>> => {
  const endpoint =
    scope === "all"
      ? "/notifications/mark-all-as-read"
      : "/alerts/mark-all-as-read";
  const response = await api.patch(
    endpoint,
    {},
    { params: { scope: scope === "all" ? undefined : scope } }
  );
  return response.data;
};

export const bulkDeleteNotificationsApi = async (
  notificationIds: string[]
): Promise<ApiResponse<null>> => {
  const response = await api.post("/notifications/bulk-delete", {
    notificationIds,
  });
  return response.data;
};

export const bulkDeleteAlertsApi = async (params: {
  alertIds: string[]; // Scope tidak lagi diperlukan
}): Promise<ApiResponse<null>> => {
  const { alertIds } = params;
  const response = await api.post("/alerts/bulk-delete", {
    alertIds,
  });
  return response.data;
};

export const deleteAllApi = async (
  scope?: "all" | "meters" | "system"
): Promise<ApiResponse<null>> => {
  const endpoint = scope === "all" ? "/notifications" : "/alerts/all";
  const response = await api.delete(endpoint, {
    params: { scope: scope === "all" ? undefined : scope },
  });
  return response.data;
};
