import { ReadingDetail } from "@/common/types/reading";
import api from "@/lib/api";

export interface ReadingPayload {
  reading_date: Date | string;
  meter_id: number;
  details: ReadingDetail[];
}

export interface LastReading {
  value: number;
  reading_type_id: number;
  session: {
    reading_date: Date;
  };
}

export const submitReadingApi = async (payload: ReadingPayload) => {
  const response = await api.post("/readings", payload);
  return response.data;
};

export const getLastReadingApi = async (
  meterId: number,
  readingTypeId: number,
  date: string
): Promise<{ data: LastReading }> => {
  const response = await api.get(
    `/readings/last?meterId=${meterId}&readingTypeId=${readingTypeId}&readingDate=${date}`
  );
  return response.data;
};
