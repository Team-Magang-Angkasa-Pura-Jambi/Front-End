import api from "@/lib/api";
import { MeterType } from "@/common/types/meters";
import { EnergyTypeName } from "@/common/types/energy";
import { statusMeter } from "../types/meter.type";

interface MetersApiResponse {
  data: MeterType[];
}

interface MeterDetailApiResponse {
  data: MeterType;
}

export interface MeterPayload {
  meter_code: string;
  status: statusMeter;
  has_rollover: boolean;
  category_id?: number;
  tariff_group_id?: number;
  energy_type_id?: number;
  tank_height_cm?: number;
  tank_volume_liters?: number;
  rollover_limit?: number;
}

export const getMetersApi = async (
  typeName?: string
): Promise<MetersApiResponse> => {
  const response = await api.get<MetersApiResponse>("/meters", {
    params: {
      typeName: typeName,
    },
  });
  return response.data;
};

export const getMeterByIdApi = async (
  meterId: number
): Promise<MeterDetailApiResponse> => {
  const response = await api.get<MeterDetailApiResponse>(`/meters/${meterId}`);
  return response.data;
};

export const createMeterApi = async (
  data: MeterPayload
): Promise<MeterDetailApiResponse> => {
  const response = await api.post<MeterDetailApiResponse>("/meters", data);
  return response.data;
};

export const updateMeterApi = async (
  id: number,
  data: MeterPayload
): Promise<MeterDetailApiResponse> => {
  const response = await api.patch<MeterDetailApiResponse>(
    `/meters/${id}`,
    data
  );
  return response.data;
};

export const deleteMeterApi = async (id: number): Promise<void> => {
  await api.delete(`/meters/${id}`);
};
