import api from "@/lib/api";

export interface AuditLogItem {
  log_id: number;
  user_id: number;
  action: "CREATE" | "UPDATE" | "DELETE" | "UPSERT" | string;
  entity_table: string;
  entity_id: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    full_name: string;
    username: string;
  };
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entity_table?: string;
  start_date?: string;
  end_date?: string;
  user_id?: number;
}

export interface AuditLogsResponse {
  message: string;
  data: {
    data: AuditLogItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
}

export const getAuditLogsApi = async (params: GetAuditLogsParams = {}): Promise<AuditLogsResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.action && params.action !== "ALL") query.append("action", params.action);
  if (params.entity_table && params.entity_table !== "ALL") query.append("entity_table", params.entity_table);
  if (params.start_date) query.append("start_date", params.start_date);
  if (params.end_date) query.append("end_date", params.end_date);
  if (params.user_id) query.append("user_id", params.user_id.toString());

  const response = await api.get(`/audit-logs?${query.toString()}`);
  return response.data;
};
