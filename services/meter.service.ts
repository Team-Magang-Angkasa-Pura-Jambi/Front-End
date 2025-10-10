import api from "@/lib/api";
import { EnergyType } from "./energyType.service";

// ... (definisi tipe MeterStatus dan MeterType Anda tetap sama)
export const MeterStatus = {
  Active: "Active",
  UnderMaintenance: "UnderMaintenance",
  Inactive: "Inactive",
  DELETED: "DELETED",
} as const; // 'as const' membuat nilai-nilainya menjadi literal type

export type MeterStatus = keyof typeof MeterStatus;

// Tipe untuk satu objek Meter
export interface MeterType {
  meter_id: number; // Tambahkan ID untuk identifikasi
  meter_code: string;
  energy_type_id: number;
  location: string | null; // Location bisa jadi null
  status: MeterStatus;
  energy_type?: EnergyType; // Tambahkan relasi ke EnergyType
}
interface MeterApiResponse {
  data: MeterType[];
}

/**
 * Mengambil daftar meteran, bisa difilter berdasarkan energy_type_id.
 * @param energy_type_id - ID dari tipe energi (opsional).
 */
export const getMetersApi = async (
  type_name?: string
): Promise<MeterApiResponse> => {
  let url = "/meters";

  // Jika energy_type_id diberikan, tambahkan sebagai query parameter
  if (type_name) {
    url += `?typeName=${type_name}`;
  }

  const response = await api.get(url);
  return response.data;
};

export const getMetersbyIdApi = async (
  meterId: number
): Promise<MeterApiResponse> => {
  let url = "/meters";

  // Jika energy_type_id diberikan, tambahkan sebagai query parameter
  if (meterId) {
    url += `/${meterId}`;
  }

  const response = await api.get(url);
  return response.data;
};
