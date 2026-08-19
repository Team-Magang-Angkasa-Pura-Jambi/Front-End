import api from "@/lib/api";

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG" | "HTTP" | "DB";
  message: string;
  source?: string;
  statusCode?: number;
  durationMs?: number;
  endpoint?: string;
  request?: {
    method: string;
    url: string;
    ip?: string;
    headers?: Record<string, any>;
    query?: Record<string, any>;
    params?: Record<string, any>;
    body?: Record<string, any>;
  };
  response?: {
    statusCode: number;
    durationMs: number;
    body?: any;
  };
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
    meta?: any;
  };
}

export interface ServerSystemMetrics {
  server: {
    node_version: string;
    platform: string;
    arch: string;
    uptime_seconds: number;
    uptime_human: string;
    pid: number;
  };
  memory: {
    rss_mb: number;
    heap_total_mb: number;
    heap_used_mb: number;
    external_mb: number;
    system_free_mb: number;
    system_total_mb: number;
    system_usage_percent: number;
  };
  cpu: {
    cores: number;
    model: string;
    load_avg: number[];
  };
  logs_stats: {
    total: number;
    error_count: number;
    warn_count: number;
    http_count: number;
  };
  health?: {
    database: {
      status: "healthy" | "unhealthy" | "unknown";
      latency_ms: number;
    };
    machine_learning: {
      status: "online" | "offline" | "error" | "unknown";
      latency_ms: number;
    };
  };
}

export interface GetLogsParams {
  level?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const getServerLogsApi = async (params: GetLogsParams = {}) => {
  const query = new URLSearchParams();
  if (params.level) query.append("level", params.level);
  if (params.search) query.append("search", params.search);
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.offset) query.append("offset", params.offset.toString());

  const response = await api.get(`/system-monitor/logs?${query.toString()}`);
  return response.data;
};

export const getServerMetricsApi = async () => {
  const response = await api.get("/system-monitor/metrics");
  return response.data;
};

export const clearServerLogsApi = async () => {
  const response = await api.post("/system-monitor/clear-logs");
  return response.data;
};
