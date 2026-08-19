import api from "@/lib/api";
import { DailyPaxData } from "../components/PaxDailyTable";

export interface GetPaxQuery {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface PaxHistoryResponse {
  pax_data: DailyPaxData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const getPaxApi = async (params?: GetPaxQuery): Promise<PaxHistoryResponse> => {
  const response = await api.get("/pax", { params });
  return response.data;
};
export const updatePaxApi = async (
  paxId: number,
  payload: {
    pax_count: number;
  }
): Promise<{ message: string }> => {
  const response = await api.patch(`/pax/${paxId}`, payload);
  return response.data;
};

export const deletePaxApi = async (paxId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/pax/${paxId}`);
  return response.data;
};
