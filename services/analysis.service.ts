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
    `/analysis?energyType=${type}&month=${mount}&${meterIdParams}`
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
    `/analysis/classification-summary?month=${monthQuery}&energyType=${energyType}&meterId=${meterId}`
  );
  return response.data;
};

export const getFuelStockAnalysisApi = async (
  year: string,
  month: string
): Promise<FuelStockAnalysisResponse> => {
  const monthQuery = `${year}-${month}`;
  const response = await api.get(`/analysis/fuel-stock?month=${monthQuery}`);
  return response.data;
};

export const getBudgetSummaryApi = async (): Promise<
  BudgetSummaryByEnergy[]
> => {
  const response = await api.get("/analysis/budget-summary");
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
  const response = await api.get(`/analysis/prepare-budget/${parentBudgetId}`);
  return response.data.data;
};
