import api from "@/lib/api";

export interface AiAgentLog {
  log_id: number;
  user_id: number | null;
  session_id: string | null;
  prompt: string;
  response_json: any;
  error_message: string | null;
  latency_ms: number;
  model_used: string;
  is_success: boolean;
  created_at: string;
  user?: {
    full_name: string;
    username: string;
  } | null;
}

export interface GetAiLogsResponse {
  data: AiAgentLog[];
  total: number;
  page: number;
  limit: number;
}

export const getAiLogsApi = async (page = 1, limit = 50): Promise<GetAiLogsResponse> => {
  const { data } = await api.get("/ai-agent/logs", { params: { page, limit } });
  return data.data;
};
