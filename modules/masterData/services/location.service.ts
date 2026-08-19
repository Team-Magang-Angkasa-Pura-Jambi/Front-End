import { ApiResponse } from "@/common/types/api";
import { Location } from "@/common/types/location";
import api from "@/lib/api";
import { LocationFormValues } from "../schemas/location.schema";

export const getLocationsApi = async (): Promise<ApiResponse<Location[]>> => {
  const response = await api.get("/locations");

  return response.data;
};

export const createLocationApi = async (data?: LocationFormValues) => {
  const response = await api.post(`/locations`, data);
  return response.data;
};

export const updatetLocationApi = async (id?: number, data?: Partial<LocationFormValues>) => {
  const response = await api.patch(`/locations/${id}`, data);
  return response.data;
};

export const deleteLocationApi = async (id: number) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};
