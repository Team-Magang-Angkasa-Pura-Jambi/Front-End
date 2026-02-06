import api from "@/lib/api";
import { ApiResponse } from "@/common/types/api";
import { AnnualBudget } from "@/common/types/budget";
import { EnergyTypeName } from "@/common/types/energy";
import { AnnualBudgetFormValues } from "@/modules/budget/schemas/annualBudget.schema";

// --- Types ---

export type YearOptionsData = {
  availableYears: number[];
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
};

// Export alias untuk menjaga kompatibilitas dengan kode lama jika diperlukan
export const getAnnualBudgetApi = annualBudgetApi.getAll;
export const yearOptionsApi = annualBudgetApi.getYearOptions;
