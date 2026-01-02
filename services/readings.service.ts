import api from "@/lib/api";

interface ReadingTypesApiResponse {
  data: ReadingType[];
}
export interface ReadingType {
  reading_type_id: number;
  type_name: string;
}

// Pastikan tipe ReadingType ada
export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
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


// Tambahkan fungsi ini
