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
  id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  createdAt: string;
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

/**
 * Mengambil notifikasi alert utama untuk ditampilkan di NotificationCard.
 */
export const fetchAllNotificationsApi = async (): Promise<
  AlertNotification[]
> => {
  const response = await api.get("/notifications"); // Endpoint untuk alert card
  return response.data.data; // Asumsi data ada di dalam `data.data`
};
