import api from "@/lib/api";
import { ApiResponse } from "@/common/types/api";
import { AnnualBudget } from "@/common/types/budget";
import { EnergyTypeName } from "@/common/types/energy";
import { AnnualBudgetFormValues } from "@/modules/budget/schemas/annualBudget.schema";

// --- Types ---

export type YearOptionsData = {
  availableYears: number[];
};

export type BudgetSummaryItem = {
  energyTypeId: number;
  energyTypeName: string;
  currentPeriod: {
    periodStart: string | Date;
    periodEnd: string | Date;
    totalBudget: number;
    totalRealization: number;
    remainingBudget: number;
    realizationPercentage: number;
    status: "SAFE" | "WARNING" | "DANGER";
  };
};

// --- API Implementation ---

export const annualBudgetApi = {
  getAll: async (
    year: number,
    energyType?: EnergyTypeName | "all"
  ): Promise<ApiResponse<AnnualBudget[]>> => {
    const response = await api.get("/annual-budgets", {
      params: {
        year,
        energy_type: energyType === "all" ? undefined : energyType,
      },
    });
    return response.data;
  },

  getParents: async (year?: number): Promise<ApiResponse<AnnualBudget[]>> => {
    const response = await api.get("/annual-budgets/parents", {
      params: { year },
    });
    return response.data;
  },

  create: async (
    data: AnnualBudgetFormValues
  ): Promise<ApiResponse<AnnualBudget>> => {
    const response = await api.post("/annual-budgets", data);
    return response.data;
  },

  update: async (
    id: number,
    data: AnnualBudgetFormValues
  ): Promise<ApiResponse<AnnualBudget>> => {
    const response = await api.patch(`/annual-budgets/${id}`, data);
    return response.data;
  },

  delete: async (budgetId: number): Promise<void> => {
    await api.delete(`/annual-budgets/${budgetId}`);
  },

  getYearOptions: async (): Promise<ApiResponse<YearOptionsData>> => {
    const response = await api.get("/annual-budgets/year-options");
    return response.data;
  },

  getSummary: async (year: number): Promise<BudgetSummaryItem[]> => {
    const response = await api.get<ApiResponse<BudgetSummaryItem[]>>(
      "/analysis/budget-summary",
      { params: { year } }
    );
    return response.data.data;
  },
};

// Export alias untuk menjaga kompatibilitas dengan kode lama jika diperlukan
export const getAnnualBudgetApi = annualBudgetApi.getAll;
export const yearOptionsApi = annualBudgetApi.getYearOptions;
export const getBudgetSummaryApi = annualBudgetApi.getSummary;
