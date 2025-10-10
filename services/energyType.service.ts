import api from "@/lib/api";

// --- GET ENERGY TYPES ---

// Tipe untuk objek EnergyType tunggal
export interface EnergyType {
  energy_type_id: number;
  type_name: string;
  unit_of_measurement: string;
  is_active: boolean;
  reading_types: readingTypes[];
  meters: meters;
}

interface readingTypes {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
}

interface meters {
  meter_code: string;
  location: string;
  status: Status;
  energy_type_id: number;
}

enum Status {
  "Active",
  "UnderMaintenance",
  "Inactive",
  "DELETED",
}
// Tipe untuk keseluruhan respons API dari endpoint energy-types
export interface EnergyTypesApiResponse {
  data: EnergyType[];
}

/**
 * Mengambil semua jenis energi dari API.
 */
export const getEnergyTypesApi = async (
  typeName?: string
): Promise<EnergyTypesApiResponse> => {
  let prefix = "/energy-types";
  // Ganti '/energy-types' dengan endpoint Anda yang sebenarnya
  if (typeName) {
    prefix += `?typeName=${typeName}`;
  }
  const response = await api.get(prefix);

  return response.data;
};
