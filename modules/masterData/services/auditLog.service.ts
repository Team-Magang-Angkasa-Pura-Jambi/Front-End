import api from "@/lib/api";

const BASE_URL = "/audit-logs";

export const getAuditLogsApi = async (params?: {
  entity_table?: string;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};
