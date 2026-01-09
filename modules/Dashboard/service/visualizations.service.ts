import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";
const prefix = "/visualizations";

type UsageCategory = "HEMAT" | "NORMAL" | "BOROS" | "UNKNOWN";
export type MeterRankType = {
  code: string;
  consumption: number;
  budget: number;
  status: UsageCategory;
  unit_of_measurement: string;
};

export type EnergyOutlookType = {
  meter_code: string;
  est: number;
  status: UsageCategory;
  over: number;
};
export type YearlyHeatmapType = {
  classification_date: string; // API mengembalikan ISO String, bukan Date object
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
  month: string; // Sumbu X: Nama bulan (Jan, Feb, dst)
  consumption: number; // Sumbu Y Kiri (Bar): Volume penggunaan (kWh/m³/Liter)
  cost: number; // Sumbu Y Kanan (Line): Biaya aktual (Rupiah)
  budget: number; // Sumbu Y Kanan (Line Putus-putus): Anggaran (Rupiah)
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

export const getBudgetTrackingApi = async (): Promise<
  ApiResponse<BudgetTrackingType[]>
> => {
  const result = await api.get(`${prefix}/budget-tracking`);
  return result.data;
};

export const getYearlyAnalysisApi = async (
  energyTypeName: string,
  year: number
): Promise<ApiResponse<YearlyAnalysisType[]>> => {
  // Kirim parameter via query string (params)
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
  // Kirim parameter via query string (params)
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
  // Kirim parameter via query string (params)
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
  // Kirim parameter via query string (params)
  const result = await api.get(`${prefix}/daily-average-pax`, {
    params: {
      year: year,
      month: month,
    },
  });
  return result.data;
};
