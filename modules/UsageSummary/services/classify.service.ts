import api from "@/lib/api";

export interface EvaluationPayload {
  meter_id: number;
  summary_id: number;
  suhu_rata?: number;
  suhu_max?: number;
  pax?: number;
  is_hari_kerja?: number;
}

export const classifiesApi = async (payload: EvaluationPayload) => {
  const { data } = await api.post(`/evaluations/run`, payload);
  return data;
};
