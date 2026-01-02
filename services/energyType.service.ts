import { EnergyType } from "@/common/types/energy";
import api from "@/lib/api";

export interface EnergyTypesApiResponse {
  data: EnergyType[];
}

export const getEnergyTypesApi = async (
  typeName?: string
): Promise<EnergyTypesApiResponse> => {
  let prefix = "/energy-types";
  if (typeName) {
    prefix += `?typeName=${typeName}`;
  }
  const response = await api.get(prefix);

  return response.data;
};
