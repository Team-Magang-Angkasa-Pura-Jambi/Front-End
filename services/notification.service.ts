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

// Tipe data untuk notifikasi alert dari API /notifications
export interface AlertNotification {
  notification_id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
// Helper type untuk respons API generik
interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
  };
  data: T;
}

/**
 * Mengambil notifikasi data baru (misal: +200 data) untuk toast.
 * Diubah menjadi pengambil data ringkasan harian.
 */
export const fetchTodaySummaryApi =
  async (): Promise<TodaySummaryApiResponse> => {
    const response = await api.get("/analysis/today-summary");
    return response.data;
  };

export const fetchAllNotificationsApi = async (): Promise<
  ApiResponse<AlertNotification[]>
> => {
  const response = await api.get("/notifications"); // Endpoint untuk alert card
  return response.data;
};

/**
 * Menandai satu notifikasi sebagai sudah dibaca.
 */
export const markAsReadApi = async (
  notificationId: string
): Promise<ApiResponse<null>> => {
  const response = await api.patch(
    `/notifications/${notificationId}/mark-as-read`
  );
  return response.data;
};

/**
 * Menandai semua notifikasi sebagai sudah dibaca.
 */
export const markAllAsReadApi = async (): Promise<ApiResponse<null>> => {
  const response = await api.patch("/notifications/mark-all-as-read");
  return response.data;
};

/**
 * Menghapus notifikasi yang dipilih secara massal.
 */
export const bulkDeleteNotificationsApi = async (
  notificationIds: string[]
): Promise<ApiResponse<null>> => {
  const response = await api.post("/notifications/bulk-delete", {
    notificationIds,
  });
  return response.data;
};

/**
 * Menghapus semua notifikasi milik pengguna.
 */
export const deleteAllNotificationsApi = async (): Promise<
  ApiResponse<null>
> => {
  const response = await api.delete("/notifications");
  return response.data;
};
