import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";
const prefix = "/visualizations";

type UsageCategory = "HEMAT" | "NORMAL" | "BOROS" | "UNKNOWN";
export type MeterRankInsightType = {
  percentage_used: number;
  estimated_cost: number;
  avg_daily_consumption: number;
  trend: "NAIK" | "TURUN" | "STABIL" | "UNKNOWN";
  trend_percentage: number;
  recommendation: string;
};

export type MeterRankType = {
  code: string;
  unit_of_measurement: string;
  consumption: number;
  budget: number;
  status: string;
  insight: MeterRankInsightType;
};

export type EnergyOutlookType = {
  meter_code: string;
  est: number;
  status: UsageCategory;
  over: number;
};
export type YearlyHeatmapType = {
  classification_date: string;
  classification: UsageCategory;
  confidence_score?: number;
};
export type BudgetTrackingType = {
  year: string;
  energyType: string;
  initial: number;
  used: number[];
  saved: number[];
};

export type YearlyAnalysisType = {
  month: string;
  consumption: number;
  cost: number;
  budget: number;
};
export type YearlyAnalysisResult = {
  chartData: YearlyAnalysisType[];
  summary: {
    peakMonth: string;
    peakCost: number;
    peakConsumptionMonth: string;
    peakConsumptionValue: number;
    totalAnnualBudget: number;
    totalRealizedCost: number;
    realizedSavings: number;
    isDeficit: boolean;
    overBudgetCount: number;
    budgetUtilization: number;
    avgCostYTD: number;
  };
};

export type UnifiedEnergyComparisonType = {
  category: string;
  unit: string;
  weekday_cons: number;
  holiday_cons: number;
  weekday_cost: number;
  holiday_cost: number;
};

export type efficiencyRatioType = {
  day: string;
  terminalRatio: number;
  officeRatio: number;
  pax: number;
};

export type BudgetBurnRateType = {
  dayDate: number;
  actual: number | null;
  idea: number;
  efficent: number;
};

export const MeterRankApi = async (): Promise<ApiResponse<MeterRankType[]>> => {
  const result = await api.get(`${prefix}/meter-rank`);
  return result.data;
};

export const EnergyOutlookApi = async (): Promise<
  ApiResponse<EnergyOutlookType[]>
> => {
  const result = await api.get(`${prefix}/energy-outlook`);
  return result.data;
};

export const yearlyHeatmapApi = async (
  meterId: number,
  year: number
): Promise<ApiResponse<YearlyHeatmapType[]>> => {
  const result = await api.get(`${prefix}/yearly-heatmap`, {
    params: {
      meterId: meterId,
      year: year,
    },
  });
  return result.data;
};

export type DailyAveragePaxType = { day: string; avgPax: number };

export type getFuelRefillAnalysisType = {
  month: string;
  refill: number;
  consumption: number;
  remainingStock: number;
};

export const getBudgetTrackingApi = async (): Promise<
  ApiResponse<BudgetTrackingType[]>
> => {
  const result = await api.get(`${prefix}/budget-tracking`);
  return result.data;
};

export const getYearlyAnalysisApi = async (
  energyTypeName: string,
  year: number
): Promise<ApiResponse<YearlyAnalysisResult>> => {
  const result = await api.get(`${prefix}/yearly-analysis`, {
    params: {
      energyTypeName: energyTypeName,
      year: year,
    },
  });
  return result.data;
};

export const getUnifiedComparisonApi = async (
  energyTypeName: string,
  year: number,
  month: number
): Promise<ApiResponse<UnifiedEnergyComparisonType>> => {
  const result = await api.get(`${prefix}/unified-comparison`, {
    params: {
      energyTypeName: energyTypeName,
      year: year,
      month: month,
    },
  });
  return result.data;
};

export const getEfficiencyRatioApi = async (
  year: number,
  month: number
): Promise<ApiResponse<efficiencyRatioType[]>> => {
  const result = await api.get(`${prefix}/efficiency-ratio`, {
    params: {
      year: year,
      month: month,
    },
  });
  return result.data;
};

export const getDailyAveragePaxApi = async (
  year: number,
  month: number
): Promise<ApiResponse<DailyAveragePaxType[]>> => {
  const result = await api.get(`${prefix}/daily-average-pax`, {
    params: {
      year: year,
      month: month,
    },
  });
  return result.data;
};

export const getBudgetBurnRateApi = async (
  year: number,
  month: number
): Promise<ApiResponse<BudgetBurnRateType[]>> => {
  const result = await api.get(`${prefix}/budget-burn-rate`, {
    params: {
      year: year,
      month: month,
    },
  });
  return result.data;
};

export const getFuelRefillAnalysisApi = async (
  year: number,
  meterId: number
): Promise<ApiResponse<getFuelRefillAnalysisType[]>> => {
  const result = await api.get(`${prefix}/fuel-refill-analysis`, {
    params: {
      year: year,
      meterId: meterId,
    },
  });
  return result.data;
};
