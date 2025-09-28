import api from "@/lib/api";

interface ReadingTypesApiResponse {
  data: ReadingType[];
}
export interface ReadingType {
  reading_type_id: number;
  type_name: string;
}
export interface ReadingDetail {
  reading_type_id: number | "";
  value: number | "";
}
// Pastikan tipe ReadingType ada
export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
}

export interface ReadingPayload {
  reading_date: string;
  meter_id: number;
  details: ReadingDetail[];
}

/**
 * Mengambil jenis-jenis pembacaan (misal: LWBP, WBP) dari API.
 * @param energyTypeId - ID dari jenis energi (misal: 1 untuk Listrik).
 */
export const getReadingTypesApi = async (
  energyTypeId: number
): Promise<ReadingTypesApiResponse> => {
  const response = await api.get(
    `/reading-types?energy_type_id=${energyTypeId}`
  );
  return response.data;
};

export const getReadingTypesApibyMeterId = async (
  meterId: number
): Promise<ReadingTypesApiResponse> => {
  const response = await api.get(`/reading-types/meter?meterId=${meterId}`);
  return response.data;
};

/**
 * Mengirim data pembacaan baru ke API.
 * @param payload - Data pembacaan yang akan dikirim.
 */
export const submitReadingApi = async (payload: ReadingPayload) => {
  const response = await api.post("/readings", payload);
  return response.data;
};

// Tambahkan fungsi ini
export const getLastReadingApi = async (
  meterId: number,
  readingTypeId: number
): Promise<{ data: { value: number } | null }> => {
  const response = await api.get(
    `/readings/last?meterId=${meterId}&readingTypeId=${readingTypeId}`
  );
  return response.data;
};
