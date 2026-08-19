import api from "@/lib/api";
import { ApiResponse } from "@/common/types/api";

export interface EnvEndpointsConfig {
  backend_api_url: string;
  ml_api_base_url: string;
}

export interface ApiEndpointConfig {
  active_environment: "development" | "production";
  development: EnvEndpointsConfig;
  production: EnvEndpointsConfig;
  backend_api_url?: string;
  ml_api_base_url?: string;
}

export interface SecurityTokenConfig {
  jwt_secret: string;
  uploadthing_app_id?: string;
  uploadthing_secret?: string;
  uploadthing_token?: string;
}

export interface WeatherLocationConfig {
  airport_name: string;
  latitude: number;
  longitude: number;
  openweather_api_key: string;
}

export interface DashboardCardMetersConfig {
  electricityMeterIds: number[];
  waterMeterIds: number[];
  fuelMeterIds: number[];
}

export interface FullSystemConfigPayload {
  endpoints: ApiEndpointConfig;
  security: SecurityTokenConfig;
  weather: WeatherLocationConfig;
  dashboardCards: DashboardCardMetersConfig;
}

export interface MeterOptionItem {
  meter_id: number;
  meter_code: string;
  name: string | null;
  category: "TERMINAL" | "KANTOR" | "LAINNYA";
  energy_type_id: number;
  location?: {
    name: string;
  } | null;
}

export interface SystemConfigResponse {
  config: FullSystemConfigPayload;
  availableMeters: {
    electricity: MeterOptionItem[];
    water: MeterOptionItem[];
    fuel: MeterOptionItem[];
  };
  server_info: {
    node_env: string;
    port: number;
    uptime_seconds: number;
  };
}

export interface TestMlResult {
  status: "online" | "offline";
  target_url: string;
  latency_ms: number;
  response_code?: number;
  message: string;
  error_message?: string;
}

export interface TestWeatherResult {
  status: "success" | "error";
  latency_ms: number;
  city_name?: string;
  current_temp?: number | null;
  temp_max?: number | null;
  weather_condition?: string;
  weather_icon?: string;
  message: string;
  error_message?: string;
}

export interface MasterPackageExportData {
  version: string;
  exported_at: string;
  environment: string;
  exported_by?: {
    user_id?: number;
    username?: string;
  };
  counts: Record<string, number>;
  data: {
    energies: any[];
    reading_types: any[];
    locations: any[];
    tenants: any[];
    price_schemes: any[];
    calculation_templates: any[];
    meters: any[];
    efficiency_targets: any[];
    annual_budgets: any[];
  };
}

export interface ImportPackageResult {
  success: boolean;
  message: string;
  importedCounts: Record<string, number>;
}

const prefix = "/system-config";

export const getSystemConfigApi = async (): Promise<ApiResponse<SystemConfigResponse>> => {
  const response = await api.get(prefix);
  return response.data;
};

export const updateSystemConfigApi = async (
  payload: Partial<FullSystemConfigPayload>
): Promise<ApiResponse<FullSystemConfigPayload>> => {
  const response = await api.put(prefix, payload);
  return response.data;
};

export const testMlConnectionApi = async (url?: string): Promise<ApiResponse<TestMlResult>> => {
  const response = await api.post(`${prefix}/test-ml`, { url });
  return response.data;
};

export const testWeatherConnectionApi = async (params: {
  latitude?: number;
  longitude?: number;
  apiKey?: string;
}): Promise<ApiResponse<TestWeatherResult>> => {
  const response = await api.post(`${prefix}/test-weather`, params);
  return response.data;
};

export const exportMasterPackageApi = async (): Promise<ApiResponse<MasterPackageExportData>> => {
  const response = await api.get(`${prefix}/export-package`);
  return response.data;
};

export const importMasterPackageApi = async (payload: {
  mode?: "MERGE_UPSERT" | "CLEAN_IMPORT";
  package: any;
}): Promise<ApiResponse<ImportPackageResult>> => {
  const response = await api.post(`${prefix}/import-package`, payload);
  return response.data;
};
