import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";

// Tipe untuk data harian yang diterima dari API analisis

// Tipe untuk data per meter

// Tipe untuk respons API analisis secara keseluruhan

// Tipe untuk respons API ringkasan klasifikasi

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

export interface TodaySummaryResponse {
  meta: {
    date: Date;
    pax: number | null;
  };
  sumaries: NewDataCountNotification[];
}

export const getTodaySummaryApi = async (): Promise<
  ApiResponse<TodaySummaryResponse>
> => {
  const response = await api.get("/analytics/today-summary");
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
export const getBudgetSummaryApi = async (
  selectedYear: number
): Promise<BudgetSummaryByEnergy[]> => {
  const response = await api.get("/analytics/budget-summary", {
    params: {
      year: selectedYear, // 🔥 Ini akan otomatis diubah jadi URL: .../budget-summary?year=2026
    },
  });

  return response.data.data;
};
