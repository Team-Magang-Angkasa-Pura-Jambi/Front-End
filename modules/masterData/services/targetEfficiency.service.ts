import api from "@/lib/api";

import { ApiResponse } from "@/common/types/api";
import { EfficiencyTarget } from "@/common/types/efficiencyTarget";
import { TargetEfficiencyFormValues } from "../schemas/targetEfficiency.schema";

export interface EfficiencyTargetQueryParams {
  meter_id?: number;
  year?: number;
  kpi_name?: string;
}

const ENDPOINT = "/efficiency";

export const getEfficiencyTargetsApi = async (params?: EfficiencyTargetQueryParams) => {
  const response = await api.get<ApiResponse<EfficiencyTarget[]>>(ENDPOINT, { params });
  return response.data;
};

export const getEfficiencyTargetByIdApi = async (id: number) => {
  const response = await api.get<ApiResponse<EfficiencyTarget>>(`${ENDPOINT}/${id}`);
  return response.data;
};

export const createEfficiencyTargetApi = async (payload: TargetEfficiencyFormValues) => {
  const response = await api.post<ApiResponse<EfficiencyTarget>>(ENDPOINT, payload);
  return response.data;
};

export const updateEfficiencyTargetApi = async (
  id: number,
  payload: Partial<TargetEfficiencyFormValues>
) => {
  const response = await api.patch<ApiResponse<EfficiencyTarget>>(`${ENDPOINT}/${id}`, payload);
  return response.data;
};

export const deleteEfficiencyTargetApi = async (id: number) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};

// export const getEfficiencyTargetPreviewApi = async (payload: EfficiencyTargetPreviewPayload) => {
//   const { data } = await api.post<ApiResponse<EfficiencyTargetPreviewData>>(
//     `${ENDPOINT}/preview`,
//     payload
//   );
//   return data;
// };
