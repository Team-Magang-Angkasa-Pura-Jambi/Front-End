import api from "@/lib/api";

export interface PaxPayload {
  data_date: string; 
  total_pax: number;
}

export const submitPaxApi = async (payload: PaxPayload) => {
  const response = await api.post("/pax", payload);
  return response.data;
};
