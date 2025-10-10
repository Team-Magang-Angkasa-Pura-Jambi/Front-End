import api from "@/lib/api";

// Tipe untuk data harian yang diterima dari API
export interface DailyRecord {
  date: string; // Format direkomendasikan: "YYYY-MM-DD"
  actual_consumption: number | null;
  efficiency_target: number | null;
  actual_consumptio: number | null;
}

/**
 * Mewakili struktur respons API secara keseluruhan.
 * Properti 'data' adalah sebuah array dari DailyRecord.
 * Ini adalah cara yang benar dan fleksibel.
 */
interface AnalysisApiResponse {
  data: DailyRecord[];
}

// Fungsi untuk mengambil data analisis berdasarkan tipe (listrik, air, atau fuel)
export const analysisApi = async (
  type: "Electricity" | "Water" | "Fuel",
  mount: string,
  meterId: number
): Promise<AnalysisApiResponse> => {
  // Ganti '/analysis' dengan endpoint API Anda, sambil mengirimkan tipe sebagai query param
  const response = await api.get(
    `/analysis?energyType=${type}&month=${mount}&meterId=${meterId}`
  );
  return response.data;
};
