import { EnergyType } from "@/common/types/energy";
import api from "@/lib/api";
import { EnergyTypeFormValues } from "../schemas/energyType.schema";
import { MasterEnergyResponse } from "@/modules/EnterData/types";

// Interface standar untuk list
export interface EnergyTypesApiResponse {
  data: EnergyType[];
  status?: { code: number; message: string };
}

// Interface standar untuk detail (menggunakan MasterEnergyResponse agar konsisten)
interface EnergyTypeDetailApiResponse {
  data: EnergyType;
  status?: { code: number; message: string };
}

const BASE_URL = "/energies";

/**
 * Mendapatkan daftar tipe energi (Bisa difilter lewat query name)
 */
export const getEnergyTypesApi = async (typeName?: string): Promise<EnergyTypesApiResponse> => {
  const response = await api.get<EnergyTypesApiResponse>(BASE_URL, {
    params: { typeName },
  });
  return response.data;
};

/**
 * Mendapatkan detail energi berdasarkan ID (Termasuk Meters & Reading Types)
 * Return type menggunakan MasterEnergyResponse agar sesuai dengan kebutuhan Form kita
 */
export const getEnergyTypeByIdApi = async (id: number): Promise<MasterEnergyResponse> => {
  const response = await api.get<MasterEnergyResponse>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Mendapatkan energi beserta tipe pembacaannya
 */
export const getEnergyWithReadingTypesApi = async (): Promise<EnergyTypesApiResponse> => {
  const response = await api.get<EnergyTypesApiResponse>(`${BASE_URL}/with-reading-types`);
  return response.data;
};

/**
 * Membuat data energi baru
 */
export const createEnergyTypeApi = async (
  data: EnergyTypeFormValues
): Promise<EnergyTypeDetailApiResponse> => {
  const response = await api.post<EnergyTypeDetailApiResponse>(BASE_URL, data);
  return response.data;
};

/**
 * Mengupdate data energi
 */
export const updateEnergyTypeApi = async (
  id: number,
  data: EnergyTypeFormValues
): Promise<EnergyTypeDetailApiResponse> => {
  const response = await api.patch<EnergyTypeDetailApiResponse>(`${BASE_URL}/${id}`, data);
  return response.data;
};

/**
 * Menghapus data energi
 */
export const deleteEnergyTypeApi = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
