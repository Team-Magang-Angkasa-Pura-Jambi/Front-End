import api from "@/lib/api";

// Tipe untuk payload yang dikirim ke API
export interface PaxPayload {
  data_date: string; // ISO Date String
  total_pax: number;
}

// Fungsi untuk mengirim data Pax
export const submitPaxApi = async (payload: PaxPayload) => {
  const response = await api.post("/pax", payload);
  return response.data;
};
