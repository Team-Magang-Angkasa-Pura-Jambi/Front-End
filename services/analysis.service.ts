import api from "@/lib/api";

// Tipe untuk data harian yang diterima dari API analisis
export interface DailyRecord {
  date: string;
  actual_consumption: number | null;
  prediction: number | null;
  classification: "HEMAT" | "NORMAL" | "BOROS" | null;
  efficiency_target: number | null;
  totalDaysWithClassification: number | null;
}

// Tipe untuk data per meter
export interface MeterAnalysisData {
  meterId: number;
  meterName: string;
  data: DailyRecord[];
}

// Tipe untuk respons API analisis secara keseluruhan
interface AnalysisApiResponse {
  data: MeterAnalysisData[];
}

// Tipe untuk respons API ringkasan klasifikasi
interface ClassificationSummaryResponse {
  data: {
    classification: "HEMAT" | "NORMAL" | "BOROS";
    count: number;
  }[];
}

interface FuelStockRecord {
  meter_id: number;
  meter_code: string;
  tank_volume_liters: number;
  latest_stock_liters: number;
  latest_stock_date: string;
  percentage: number;
}

interface FuelStockAnalysisResponse {
  success: boolean;
  message: string;
  data: FuelStockRecord[];
  meta: {
    year: number;
    month: number;
  };
}
export type BudgetSummaryByEnergy = {
  energyTypeId: number;
  energyTypeName: string;
  budgetThisYear: number;
  currentPeriod: {
    budgetId: number;
    periodStart: string; // ISO Date String
    periodEnd: string; // ISO Date String
    totalBudget: number;
    totalRealization: number;
    remainingBudget: number;
    realizationPercentage: number | null;
  } | null;
};

export const analysisApi = async (
  type: "Electricity" | "Water" | "Fuel",
  mount: string,
  meterId: number[]
): Promise<AnalysisApiResponse> => {
  const meterIdParams = meterId.map((id) => `meterId=${id}`).join("&");
  const response = await api.get(
    `/analytics?energyType=${type}&month=${mount}&${meterIdParams}`
  );
  return response.data;
};

export const getClassificationSummaryApi = async (
  year: string,
  month: string,
  energyType: "Electricity" | "Water" | "Fuel",
  meterId: number
): Promise<ClassificationSummaryResponse> => {
  const monthQuery = `${year}-${month}`;
  const response = await api.get(
    `/analytics/classification-summary?month=${monthQuery}&energyType=${energyType}&meterId=${meterId}`
  );
  return response.data;
};

export const getFuelStockAnalysisApi = async (
  year: string,
  month: string
): Promise<FuelStockAnalysisResponse> => {
  const monthQuery = `${year}-${month}`;
  const response = await api.get(`/analytics/fuel-stock?month=${monthQuery}`);
  return response.data;
};

export const getBudgetSummaryApi = async (): Promise<
  BudgetSummaryByEnergy[]
> => {
  const response = await api.get("/analytics/budget-summary");
  return response.data.data;
};

export type prepareNextPeriodBudget = {
  parentBudgetId: number;
  parentTotalBudget: number;
  totalAllocatedToChildren: number;
  availableBudgetForNextPeriod: number;
};
export const getprepareNextPeriodBudgetApi = async (
  parentBudgetId: number
): Promise<prepareNextPeriodBudget> => {
  const response = await api.get(`/analytics/prepare-budget/${parentBudgetId}`);
  return response.data.data;
};



export interface EfficiencyTargetPreviewPayload {
  meter_id: number;
  target_value: number; // Sesuai dengan form
  period_start: string; // Format YYYY-MM-DD
  period_end: string; // Format YYYY-MM-DD
}

export interface EfficiencyTargetPreviewResponse {
  input: any;
  budget: {
    budgetId: number;
    budgetPeriodStart: string;
    budgetPeriodEnd: string;
    meterAllocationWeight: number;
    allocatedBudgetForMeter: number;
    realizationToDate: number;
    remainingBudget: number;
  } | null;
  calculation: {
    avgPricePerUnit: number;
    totalDays: number;
    unitOfMeasurement: string;
  };
  preview: {
    totalTargetConsumption: number;
    dailyTargetConsumption: number;
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

export const getEfficiencyTargetPreviewApi = async (
  payload: EfficiencyTargetPreviewPayload
): Promise<EfficiencyTargetPreviewResponse> => {
  const response = await api.post(
    "/analytics/efficiency-target-preview",
    payload
  );
  return response.data.data;
};
