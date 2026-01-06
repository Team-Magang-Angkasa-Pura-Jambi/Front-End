import { TariffGroup } from "@/common/types/tariffGroup";
import api from "@/lib/api";
import { tarifFormValues } from "../schemas/tariffGroup.schema";

interface TariffGroupsApiResponse {
  data: TariffGroup[];
}

interface TariffGroupDetailApiResponse {
  data: TariffGroup;
}

const BASE_URL = "/tariff-groups";

export const getTariffGroupsApi =
  async (): Promise<TariffGroupsApiResponse> => {
    const response = await api.get<TariffGroupsApiResponse>(BASE_URL);
    return response.data;
  };

export const getTariffGroupByIdApi = async (
  id: number
): Promise<TariffGroupDetailApiResponse> => {
  const response = await api.get<TariffGroupDetailApiResponse>(
    `${BASE_URL}/${id}`
  );
  return response.data;
};

export const createTariffGroupApi = async (
  data: tarifFormValues
): Promise<TariffGroupDetailApiResponse> => {
  const response = await api.post<TariffGroupDetailApiResponse>(BASE_URL, data);
  return response.data;
};

export const updateTariffGroupApi = async (
  id: number,
  data: tarifFormValues
): Promise<TariffGroupDetailApiResponse> => {
  const response = await api.patch<TariffGroupDetailApiResponse>(
    `${BASE_URL}/${id}`,
    data
  );
  return response.data;
};

export const deleteTariffGroupApi = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
