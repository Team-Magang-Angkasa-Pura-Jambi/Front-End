import api from "@/lib/api";
import { EnergyType } from "./energyType.service";

export const MeterStatus = {
  Active: "Active",
  UnderMaintenance: "UnderMaintenance",
  Inactive: "Inactive",
  DELETED: "DELETED",
} as const;

export type MeterStatus = keyof typeof MeterStatus;

export interface MeterType {
  meter_id: number;
  meter_code: string;
  energy_type_id: number;
  location: string | null;
  status: MeterStatus;
  energy_type?: EnergyType;
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

  if (meterId) {
    url += `/${meterId}`;
  }

  const response = await api.get(url);
  return response.data;
};
