import { ReadingDetail } from "@/common/types/reading";
import api from "@/lib/api";

// ==========================================
// 1. PAYLOADS & QUERIES (Data yang dikirim ke API)
// ==========================================

export interface ReadingPayload {
  reading: {
    reading_date: Date | string;
    meter_id: number;
    details: ReadingDetail[];
    evidence_image_url?: string | null;
    notes?: string | null;
  };
}

export type UpdateReadingSessionBody = Partial<ReadingPayload["reading"]>;

export interface RecalculatePayload {
  start_date: Date | string;
  to_date: Date | string;
  meter_id: number;
}

export interface GetReadingSessionsQuery {
  meter_id: number;
  from_date: string;
  to_date: string;
}

// ==========================================
// 2. RESPONSES & MODELS (Data yang diterima dari API)
// ==========================================

export interface LastReading {
  value: number;
  reading_type_id: number;
  session: {
    reading_date: Date;
  };
}

export interface ReadingHistoryDetail {
  detail_id: number;
  session_id: number;
  reading_type_id: number;
  value: string | number; // API mengirimkan string
  reading_type: {
    reading_type_id: number;
    energy_type_id: number;
    type_name: string;
    unit: string;
  };
}

export interface ReadingHistory {
  session_id: number;
  meter_id: number; // Berada di root
  reading_date: string; // API mengirimkan ISO string
  captured_by_user_id: number;
  evidence_image_url: string | null;
  notes: string;
  created_at: string;
  details: ReadingHistoryDetail[];
  captured_by?: {
    username: string;
  };
  meter?: {
    name: string;
    meter_code?: string; // Opsional jika API sewaktu-waktu menambahkan
  };
}

export interface ReadingHistoryResponse {
  data: ReadingHistory[];
}

export interface ReadingTypeInfo {
  reading_type_id: number;
  type_name: string;
}

export interface PaxData {
  pax: number;
  pax_id: number;
}

// ==========================================
// 3. API SERVICES
// ==========================================

export const submitReadingApi = async (payload: ReadingPayload) => {
  const response = await api.post("/reading-sessions", payload);
  return response.data;
};

export const getReadingSessionsApi = async (
  params: GetReadingSessionsQuery
): Promise<ReadingHistoryResponse> => {
  const response = await api.get("/reading-sessions", { params });
  return response.data;
};

export interface LatestMeterLogResponse {
  message: string;
  data: {
    meter_id: number;
    meter_code: string;
    meter_name: string;
    last_session_id: number | null;
    last_reading_date: string | null;
    last_reading_date_formatted: string | null;
    suggested_next_date: string;
    suggested_next_date_formatted: string;
    last_consumption: number;
    last_cost: number;
    details: Array<{
      reading_type_id: number;
      reading_type_name: string;
      unit: string;
      last_value: number;
    }>;
    value?: number;
    session?: {
      reading_date: string | Date;
    };
  };
}

export const getLatestMeterLogApi = async (
  meterId: number,
  date?: string
): Promise<LatestMeterLogResponse> => {
  const query = new URLSearchParams();
  query.append("meter_id", meterId.toString());
  if (date) query.append("reading_date", date);

  const response = await api.get(`/reading-sessions/last-reading?${query.toString()}`);
  return response.data;
};

export const getLastReadingApi = async (
  meterId: number,
  readingTypeId?: number,
  date?: string
): Promise<{ data: LastReading }> => {
  const query = new URLSearchParams();
  query.append("meter_id", meterId.toString());
  if (readingTypeId) query.append("reading_type_id", readingTypeId.toString());
  if (date) query.append("reading_date", date);

  const response = await api.get(`/reading-sessions/last-reading?${query.toString()}`);
  return response.data;
};

export const updateReadingSessionApi = async (
  sessionId: number,
  data: UpdateReadingSessionBody
) => {
  const response = await api.patch(`/reading-sessions/${sessionId}`, data);
  return response.data;
};

export const deleteReadingSessionApi = async (sessionId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/reading-sessions/${sessionId}`);
  return response.data;
};

export const recalculateApi = async (payload: RecalculatePayload) => {
  const response = await api.post("/reading-sessions/recalculate", payload);
  return response.data;
};
