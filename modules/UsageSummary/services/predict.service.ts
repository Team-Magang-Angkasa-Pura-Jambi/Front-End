import api from "@/lib/api";
import {
  BulkPredictionPayload,
  SingleAnalysisPayload,
} from "../types/recap.type";

const PREDICT_PREFIX = "/predict";

export const predictApi = async (payload: SingleAnalysisPayload) => {
  const { data } = await api.post(`${PREDICT_PREFIX}`, payload);
  return data;
};

export const predictBulkApi = async (payload: BulkPredictionPayload) => {
  const { data } = await api.post(`${PREDICT_PREFIX}/bulk`, payload);
  return data;
};
