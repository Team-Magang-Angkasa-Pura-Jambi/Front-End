import api from "@/lib/api"; // Impor instance Axios yang sudah kita buat
import { RecapApiResponse } from "@/modules/RecapData/type";

export interface RecapQueryParams {
  type: "Electricity" | "Water" | "Fuel";
  startDate: string; // ISO string
  endDate: string; // ISO string
  sortBy?: "highest" | "lowest";
}
export interface RecapRecord {
  date: string; // Tanggal dalam format string ISO (e.g., "2025-09-24T00:00:00.000Z")

  // Properti generik untuk pemakaian Air & BBM
  consumption: number | null;

  // Properti spesifik untuk Listrik
  wbp: number | null;
  lwbp: number | null;

  // Properti umum
  target: number | null;
  pax: number | null;
  cost: number | null;
}
/**
 * Mengambil data rekap historis dari API backend.
 * @param params - Objek berisi parameter filter.
 */
export const getRecapDataApi = async (
  params: RecapQueryParams
): Promise<RecapApiResponse> => {
  // Buat query string dari objek params
  const queryParams = new URLSearchParams({
    energyType: params.type,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  // Tambahkan sortBy jika ada
  if (params.sortBy) {
    queryParams.append("sortBy", params.sortBy);
  }

  // Lakukan request GET ke endpoint /recap dengan query yang sudah dibuat
  const response = await api.get(`/recap?${queryParams.toString()}`);

  // Kembalikan seluruh isi respons (yang seharusnya sudah cocok dengan tipe RecapApiResponse)
  return response.data;
};
