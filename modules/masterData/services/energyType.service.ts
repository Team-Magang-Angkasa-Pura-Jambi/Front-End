import { EnergyType } from "@/common/types/energy";
import api from "@/lib/api";
import { MasterEnergyResponse } from "@/modules/EnterData/types";
import { EnergyTypeFormValues } from "../schemas/energyType.schema";

export interface EnergyTypesApiResponse {
  data: EnergyType[];
  status?: { code: number; message: string };
}

interface EnergyTypeDetailApiResponse {
  data: EnergyType;
  status?: { code: number; message: string };
}

const BASE_URL = "/energies";

export const getEnergyTypesApi = async (typeName?: string): Promise<EnergyTypesApiResponse> => {
  const response = await api.get<EnergyTypesApiResponse>(BASE_URL, {
    params: { typeName },
  });
  return response.data;
};

export const getEnergyTypeByIdApi = async (id: number): Promise<MasterEnergyResponse> => {
  const response = await api.get<MasterEnergyResponse>(`${BASE_URL}/${id}`);
  return response.data;
};

export const getEnergyWithReadingTypesApi = async (): Promise<EnergyTypesApiResponse> => {
  const response = await api.get<EnergyTypesApiResponse>(`${BASE_URL}/with-reading-types`);
  return response.data;
};

export const createEnergyTypeApi = async (
  data: EnergyTypeFormValues
): Promise<EnergyTypeDetailApiResponse> => {
  const response = await api.post<EnergyTypeDetailApiResponse>(BASE_URL, data);
  return response.data;
};

export const updateEnergyTypeApi = async (
  id: number,
  data: EnergyTypeFormValues
): Promise<EnergyTypeDetailApiResponse> => {
  const response = await api.patch<EnergyTypeDetailApiResponse>(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteEnergyTypeApi = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
