import api from "@/lib/api";
import { TargetEfficiencyFormValues } from "../schemas/targetEfficiency.schema";

import { EfficiencyTarget } from "@/common/types/efficiencyTarget";
import { format } from "date-fns";

export interface EfficiencyTargetQueryParams {
  meter_id?: number;
  year?: number;
  kpi_name?: string;
}

export interface EfficiencyTargetPayload {
  kpi_name: string;
  target_value: number;
  meter_id: number;
  period_start: string;
  period_end: string;
}

export interface EfficiencyTargetPreviewPayload {
  target_value: number;
  meter_id: number;
  period_start: string;
  period_end: string;
  kpi_name?: string;
}

interface EfficiencyTargetsApiResponse {
  data: EfficiencyTarget[];
  status?: { code: number; message: string };
}

export interface EfficiencyTargetDetailApiResponse {
  data: EfficiencyTarget;
  status?: { code: number; message: string };
}

export interface EfficiencyTargetPreview {
  input: EfficiencyTargetPreviewPayload;
  budget: {
    budgetId: number;
    remainingBudget: number;
  } | null;

  preview: {
    totalDays: number;
    unitOfMeasurement: string;
    avgPricePerUnit: number;
    inputTotalKwh: number;
    estimatedTotalCost: number;
  };

  suggestion: {
    standard: {
      message: string;
      suggestedDailyKwh: number;
      suggestedTotalKwh: number;
    } | null;
    efficiency: {
      message: string;
      suggestedDailyKwh: number;
      suggestedTotalKwh: number;
    } | null;
  } | null;
}

export interface EfficiencyTargetPreviewResponse {
  data: EfficiencyTargetPreview;
}

const prefix = "/efficiency";

export const getEfficiencyTargetsApi = async (
  params?: EfficiencyTargetQueryParams
): Promise<EfficiencyTargetsApiResponse> => {
  const response = await api.get<EfficiencyTargetsApiResponse>(prefix, {
    params: params,
  });
  return response.data;
};

export const getEfficiencyTargetByIdApi = async (
  id: number
): Promise<EfficiencyTargetDetailApiResponse> => {
  const response = await api.get<EfficiencyTargetDetailApiResponse>(
    `${prefix}/${id}`
  );
  return response.data;
};

export const createEfficiencyTargetApi = async (
  data: EfficiencyTargetPayload
): Promise<EfficiencyTargetDetailApiResponse> => {
  const response = await api.post<EfficiencyTargetDetailApiResponse>(
    prefix,
    data
  );
  return response.data;
};

export const updateEfficiencyTargetApi = async (
  id: number,
  data: EfficiencyTargetPayload
): Promise<EfficiencyTargetDetailApiResponse> => {
  const response = await api.patch<EfficiencyTargetDetailApiResponse>(
    `${prefix}/${id}`,
    data
  );
  return response.data;
};

export const deleteEfficiencyTargetApi = async (id: number): Promise<void> => {
  await api.delete(`${prefix}/${id}`);
};

export const getEfficiencyTargetPreviewApi = async (
  data: TargetEfficiencyFormValues
): Promise<EfficiencyTargetPreviewResponse> => {
  const payload: EfficiencyTargetPreviewPayload = {
    meter_id: data.meter_id,
    target_value: data.target_value,
    period_start: format(data.period_start, "yyyy-MM-dd"),
    period_end: format(data.period_end, "yyyy-MM-dd"),
  };

  const response = await api.post(prefix + "/preview", payload);

  return response.data;
};
