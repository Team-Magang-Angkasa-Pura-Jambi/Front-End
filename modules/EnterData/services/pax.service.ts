import api from "@/lib/api";

export interface PaxPayload {
  date: string;
  pax_count: number;
}

export const submitPaxApi = async (payload: PaxPayload) => {
  const response = await api.post("/pax", payload);
  return response.data;
};
