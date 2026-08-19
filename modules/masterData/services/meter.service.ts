import { ApiResponse } from "@/common/types/api";
import { MeterType } from "@/common/types/meters";
import api from "@/lib/api";
import { MeterFormValues } from "../schemas/meter.schema";

interface MetersApiResponse {
  data: { meter: MeterType[] };
}

export type MeterDetailApiResponse = ApiResponse<MeterType>;

export const getMetersApi = async (energy_type_id?: number): Promise<MetersApiResponse> => {
  const response = await api.get<MetersApiResponse>("/meters", {
    params: {
      energy_type_id: energy_type_id,
    },
  });
  return response.data;
};

export const getMeterByIdApi = async (meterId: number): Promise<MeterDetailApiResponse> => {
  const response = await api.get<MeterDetailApiResponse>(`/meters/${meterId}`);
  return response.data;
};

export const createMeterApi = async (data: MeterFormValues): Promise<MeterDetailApiResponse> => {
  const response = await api.post<MeterDetailApiResponse>("/meters", data);
  return response.data;
};

export const updateMeterApi = async (
  id: number,
  data: Partial<MeterFormValues>
): Promise<MeterDetailApiResponse> => {
  const response = await api.patch<MeterDetailApiResponse>(`/meters/${id}`, data);
  return response.data;
};

export const deleteMeterApi = async (id: number): Promise<void> => {
  await api.delete(`/meters/${id}`);
};
