import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";
import { BudgetTrackingType } from "@/modules/budget/services/annualBudget.service";
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

export interface HeatmapDay {
  id: string;
  dateDisplay: string;
  status: UsageCategory;
  confidence: string | null;
  color: string;
}
export interface HeatmapMonthGroup {
  monthName: string;
  offset: number;
  days: HeatmapDay[];
}
export type YearlyHeatmapType = {
  groupedData: HeatmapMonthGroup[];
  statsSummary: Record<Exclude<UsageCategory, "UNKNOWN">, number>;
  totalDays: number;
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

export interface TodaySummaryResponse {
  meta: {
    date: Date;
    pax: number | null;
  };
  sumaries: NewDataCountNotification[];
}

export interface NewDataCountNotification {
  summary_id: number;
  summary_date: Date;
  total_consumption: number;
  total_cost: number;
  meter_code: string;
  type_name: "Electricity" | "Water" | "Fuel";
  unit_of_measurement: string;
  classification: string | null;
}

export const MeterRankApi = async (): Promise<ApiResponse<MeterRankType[]>> => {
  const result = await api.get(`${prefix}/meter-rank`);
  return result.data;
};

export const EnergyOutlookApi = async (): Promise<ApiResponse<EnergyOutlookType[]>> => {
  const result = await api.get(`${prefix}/energy-outlook`);
  return result.data;
};

export const yearlyHeatmapApi = async (
  meterId: number,
  year: number
): Promise<ApiResponse<YearlyHeatmapType>> => {
  const result = await api.get(`${prefix}/yearly-heatmap`, {
    params: {
      meterId: meterId,
      year: year,
    },
  });
  return result.data;
};

export type DailyAveragePaxType = { day: string; avgPax: number };

export interface FuelMonthRecord {
  month: string;
  consumption: number;
  refill: number;
  remainingStock: number;
}

export interface FuelAnalysisResult {
  chartData: FuelMonthRecord[];
  summary: {
    totalConsumption: number;
    totalRefill: number;
    balance: number;
    lastRefill: string;
    status: "Safe" | "Critical";
  };
  latestStockInfo: {
    month: string;
    value: number;
  };
  stockThresholds: {
    minStockLimit: number;
  };
}

export type GetAnalysisQuery = {
  energyType: string;
  month: string;
  meterId?: number;
};

export type DailyAnalysisRecord = {
  date: Date;
  actual_consumption: number | null;
  consumption_cost: number | null;
  prediction: number | null;
  classification: UsageCategory | null;
  confidence_score: number | null;
  efficiency_target: number | null;
  efficiency_target_cost: number | null;
};

export type MeterAnalysisData = {
  meterId: number;
  meterName: string;
  data: DailyAnalysisRecord[];
};

export interface MetricCompare {
  current_value: number;
  unit: string;
  growth_percentage: number;
}

export interface WeatherMetric {
  average_temp: number;
  max_temp: number;
  unit: string;
}

export interface EnergyMetricCard {
  consumption: MetricCompare;
  cost: MetricCompare;
}

export interface MetricCardsResult {
  overview_metrics: {
    pax: MetricCompare;
    weather: WeatherMetric;
    energy: Record<string, EnergyMetricCard>;
  };
}

export interface UnifiedEnergyData {
  category: string;
  weekdayValue: number;
  holidayValue: number;
  unit?: string;
}

export interface DailyPaxData {
  name: string;
  date: string; // Saat melewati API (JSON), Date akan berubah menjadi ISO string
  avgPax: number;
}

export interface EnergyPaxCorrelationResult {
  energyComparison: UnifiedEnergyData[];
  paxTrend: DailyPaxData[];
}
export const getMetricCard = async (
  year?: number,
  month?: number
): Promise<ApiResponse<MetricCardsResult>> => {
  const response = await api.get(`${prefix}/metric-cards`, {
    params: {
      year,
      month,
    },
  });

  return response.data;
};

export const getEnergyPaxCorrelationApi = async (
  year?: number,
  month?: number
): Promise<ApiResponse<EnergyPaxCorrelationResult>> => {
  const response = await api.get(`${prefix}/energy-pax-correlation`, {
    params: {
      year,
      month,
    },
  });

  return response.data;
};
export const getTrentConsumptionApi = async (
  energyId: number,
  year: number,
  month: number,
  meterId: number
): Promise<ApiResponse<MeterAnalysisData[]>> => {
  const response = await api.get(`${prefix}/trent-consumption`, {
    params: {
      energyId: energyId,
      month: month,
      meterId: meterId,
      year,
    },
  });

  return response.data;
};

export const getBudgetTrackingApi = async (): Promise<ApiResponse<BudgetTrackingType[]>> => {
  const result = await api.get(`${prefix}/budget-tracking`);
  return result.data;
};

export const getYearlyAnalysisApi = async (
  energyId: number,
  year: number
): Promise<ApiResponse<YearlyAnalysisResult>> => {
  const result = await api.get(`${prefix}/yearly-analysis`, {
    params: {
      energyId: energyId,
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
): Promise<ApiResponse<FuelAnalysisResult>> => {
  const result = await api.get(`${prefix}/yearly-logistics`, {
    params: {
      year: year,
      meterId: meterId,
    },
  });
  return result.data;
};

export const getTodaySummaryApi = async (): Promise<ApiResponse<TodaySummaryResponse>> => {
  const response = await api.get(`${prefix}/today-summary`);
  return response.data;
};

export interface DashboardCardMetersConfig {
  electricityMeterIds: number[];
  waterMeterIds: number[];
  fuelMeterIds: number[];
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

export interface DashboardCardConfigResponse {
  config: DashboardCardMetersConfig;
  availableMeters: {
    electricity: MeterOptionItem[];
    water: MeterOptionItem[];
    fuel: MeterOptionItem[];
  };
}

export const getDashboardCardConfigApi = async (): Promise<ApiResponse<DashboardCardConfigResponse>> => {
  const response = await api.get(`${prefix}/card-config`);
  return response.data;
};

export const updateDashboardCardConfigApi = async (
  payload: DashboardCardMetersConfig
): Promise<ApiResponse<DashboardCardMetersConfig>> => {
  const response = await api.put(`${prefix}/card-config`, payload);
  return response.data;
};

