import api from "@/lib/api";
import { EnergyTypeFormValues } from "../schemas/energyType.schema";
import { EnergyType } from "@/common/types/energy";

interface EnergyTypesApiResponse {
  data: EnergyType[];
  status?: { code: number; message: string };
}

interface EnergyTypeDetailApiResponse {
  data: EnergyType;
  status?: { code: number; message: string };
}

const BASE_URL = "/energy-types";

export const getEnergyTypesApi = async (): Promise<EnergyTypesApiResponse> => {
  const response = await api.get<EnergyTypesApiResponse>(BASE_URL);
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
  const response = await api.put<EnergyTypeDetailApiResponse>(
    `${BASE_URL}/${id}`,
    data
  );
  return response.data;
};

export const deleteEnergyTypeApi = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
