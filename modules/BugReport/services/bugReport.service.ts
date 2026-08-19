import api from "@/lib/api";

const prefix = "/bug-reports";

export type BugCategory =
  | "UI_BUG"
  | "CALCULATION_ERROR"
  | "API_FAILURE"
  | "DATA_MISMATCH"
  | "PERFORMANCE"
  | "FEATURE_REQUEST"
  | "OTHER";

export type BugSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type BugStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export interface BugReportItem {
  report_id: string;
  title: string;
  description: string;
  category: BugCategory;
  severity: BugSeverity;
  status: BugStatus;
  page_url?: string | null;
  browser_info?: any;
  error_stack?: string | null;
  screenshot_url?: string | null;
  developer_response?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  reporter?: {
    user_id: number;
    username: string;
    full_name?: string | null;
    email: string;
    role?: {
      role_name: string;
    };
  };
}

export interface BugReportSummary {
  total_all: number;
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  REJECTED: number;
}

export interface BugReportListResponse {
  data: BugReportItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    summary?: BugReportSummary;
  };
}

export const createBugReportApi = async (payload: {
  title: string;
  description: string;
  category?: BugCategory;
  severity?: BugSeverity;
  page_url?: string | null;
  browser_info?: any;
  error_stack?: string | null;
  screenshot_url?: string | null;
}) => {
  const response = await api.post(prefix, payload);
  return response.data;
};

export const getBugReportsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  severity?: string;
  category?: string;
}): Promise<BugReportListResponse> => {
  const response = await api.get(prefix, { params });
  return response.data;
};

export const getBugReportByIdApi = async (id: string): Promise<BugReportItem> => {
  const response = await api.get(`${prefix}/${id}`);
  return response.data.data;
};

export const updateBugReportStatusApi = async (
  id: string,
  payload: {
    status: BugStatus;
    developer_response?: string | null;
  }
) => {
  const response = await api.patch(`${prefix}/${id}`, payload);
  return response.data;
};

export const deleteBugReportApi = async (id: string) => {
  const response = await api.delete(`${prefix}/${id}`);
  return response.data;
};
