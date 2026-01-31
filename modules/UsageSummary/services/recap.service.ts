import api from "@/lib/api";
import {
  RecapApiResponse,
  RecapQueryParams,
  RecapRecalculatePayload,
} from "../types/recap.type";

export const getRecapDataApi = async (
  params: RecapQueryParams
): Promise<RecapApiResponse> => {
  const { data } = await api.get("/recap", {
    params: {
      energyType: params.type,
      startDate: params.startDate,
      endDate: params.endDate,
      meterId: params.meterId,
      sortBy: params.sortBy,
    },
  });
  return data;
};

export const recalculateRecapApi = async (payload: RecapRecalculatePayload) => {
  const { data } = await api.post("/recap/recalculate", payload);
  return data;
};
