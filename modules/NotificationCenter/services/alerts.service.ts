import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";

export const STATUS_ALERT = {
  NEW: "NEW",
  HANDLED: "HANDLED",
  READ: "READ",
} as const;

export type statusAlert = (typeof STATUS_ALERT)[keyof typeof STATUS_ALERT];

export type AlertsData = {
  alert_id: 1;
  target_id: null;
  title: string;
  description: string;
  status: statusAlert;
  actual_value: null;
  target_value_at_trigger: null;
  meter_code: string;
  acknowledged_by: string;
  username: string;
  alert_timestamp: Date;
};

export type AlertPayload = {
  alerts: AlertsData[];
  meta: {
    count: number;
  };
};

const prefix = "/alerts";

export const getAlertMetersApi = async (): Promise<
  ApiResponse<AlertPayload>
> => {
  const response = await api.get(`${prefix}/meters`);
  return response.data;
};

export const getAlertSystemApi = async (): Promise<
  ApiResponse<AlertPayload>
> => {
  const response = await api.get(`${prefix}/system`);
  return response.data;
};

export const readAlertApi = async (
  alertId: number
): Promise<ApiResponse<AlertsData[]>> => {
  const response = await api.patch(`${prefix}/${alertId}`);
  return response.data;
};

export const readsAllAlertsApi = async (
  alertIds: number[]
): Promise<ApiResponse<AlertsData[]>> => {
  const response = await api.patch(`${prefix}/bulk-update`, { alertIds });
  return response.data;
};

export const bulkDeleteAlertApi = async (
  alertIds: number[]
): Promise<ApiResponse<AlertsData[]>> => {
  const response = await api.post(`${prefix}/bulk-delete`, { alertIds });
  return response.data;
};
