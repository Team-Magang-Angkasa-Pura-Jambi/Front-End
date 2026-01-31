import api from "@/lib/api";
import { SingleAnalysisPayload } from "../types/recap.type";
import { ApiResponse } from "@/common/types/api";

const CLASSIFY_PREFIX = "/classify";

// ==========================================
// 1. CLASSIFICATION SERVICES
// ==========================================

export const classifiesApi = async (payload: SingleAnalysisPayload) => {
  const { data } = await api.post(`${CLASSIFY_PREFIX}`, payload);
  return data;
};
