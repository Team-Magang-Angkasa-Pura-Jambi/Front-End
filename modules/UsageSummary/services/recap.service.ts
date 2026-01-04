import api from "@/lib/api";
import {
  RecapApiResponse,
  RecapQueryParams,
  RecapRecalculatePayload,
  RecapSingleClassificationPayload,
} from "../types/recap.type";

export const getRecapDataApi = async (
  params: RecapQueryParams
): Promise<RecapApiResponse> => {
  const { data } = await api.get<RecapApiResponse>("/recap", {
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

export const runSingleClassificationApi = async (
  payload: RecapSingleClassificationPayload
) => {
  const { data } = await api.post(
    "/analytics/run-single-classification",
    payload
  );
  return data;
};
export const runSinglePredictionApi = async (payload: {
  date: string;
  meterId: number;
}) => {
  const response = await api.post("/analytics/run-single-prediction", payload);
  return response.data;
};

export const recalculateRecapApi = async (payload: RecapRecalculatePayload) => {
  const { data } = await api.post("/recap/recalculate", payload);
  return data;
};
