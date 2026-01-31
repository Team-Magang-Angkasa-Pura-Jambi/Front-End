import api from "@/lib/api";
import { SingleAnalysisPayload } from "../types/recap.type";

const CLASSIFY_PREFIX = "/classify";

export const classifiesApi = async (payload: SingleAnalysisPayload) => {
  const { data } = await api.post(`${CLASSIFY_PREFIX}`, payload);
  return data;
};
