import { EnergyTypeName } from "@/common/types/energy";
import api from "@/lib/api";
import { ReadingPayload } from "@/modules/EnterData/components/services";

export interface ReadingHistoryResponse {
  data: ReadingHistory[];
}

export interface ReadingHistory {
  session_id: number;
  reading_date: Date | string;
  meter: {
    meter_id: number;
    meter_code: string;
  };
  user: {
    username: string;
  };
  details: ReadingHistoryDetail[];
  paxData?: PaxData;
}

export interface ReadingHistoryDetail {
  detail_id: number;
  value: number;
  reading_type: ReadingTypeInfo;
}

export interface ReadingTypeInfo {
  reading_type_id: number;
  type_name: string;
}

export interface PaxData {
  pax: number;
  pax_id: number;
}
export type UpdateReadingSessionBody = Partial<ReadingPayload>;


export interface GetReadingSessionsQuery {
  energyTypeName?: EnergyTypeName;
  startDate?: string;
  endDate?: string;
  meterId?: number;
  sortBy?: "reading_date" | "created_at";
  sortOrder?: "asc" | "desc";
}

export const getReadingSessionsApi = async (
  params: GetReadingSessionsQuery
): Promise<ReadingHistoryResponse> => {
  const response = await api.get("/readings/history", { params });
  return response.data;
};

export const updateReadingSessionApi = async (
  sessionId: number,
  data: UpdateReadingSessionBody
) => {
  const response = await api.patch(`/readings/${sessionId}`, data);
  return response.data;
};

export const deleteReadingSessionApi = async (
  sessionId: number
): Promise<{ message: string }> => {
  const response = await api.delete(`/readings/${sessionId}`);
  return response.data;
};
