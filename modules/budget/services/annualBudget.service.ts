import { ApiResponse } from "@/common/types/api";
import { AnnualBudget, AnnualBudgetDetail, AnnualBudgetRemaining } from "@/common/types/budget";
import { EnergyTypeName } from "@/common/types/energy";
import api from "@/lib/api";
import { AnnualBudgetFormValues } from "@/modules/budget/schemas/annualBudget.schema";

export type BudgetTrackingType = {
  year: string;
  energyType: string;
  initial: number;
  used: number[];
  saved: number[];
};
export type YearOptionsData = {
  availableYears: number[];
};

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

  getById: async (budgetId: number): Promise<ApiResponse<AnnualBudgetDetail>> => {
    const response = await api.get(`/annual-budgets/${budgetId}`);
    return response.data;
  },

  create: async (data: AnnualBudgetFormValues): Promise<ApiResponse<AnnualBudget>> => {
    const response = await api.post("/annual-budgets", data);
    return response.data;
  },

  update: async (id: number, data: AnnualBudgetFormValues): Promise<ApiResponse<AnnualBudget>> => {
    const response = await api.patch(`/annual-budgets/${id}`, data);
    return response.data;
  },

  delete: async (budgetId: number): Promise<void> => {
    await api.delete(`/annual-budgets/${budgetId}`);
  },

  showRemaining: async (id: number): Promise<ApiResponse<AnnualBudgetRemaining>> => {
    const response = await api.get(`/annual-budgets/${id}/remaining`);
    return response.data;
  },
};

export const getBudgetTrackingApi = async (
  year: number,
  energyTypeId: number
): Promise<ApiResponse<BudgetTrackingType>> => {
  const result = await api.get(`/annual-budgets/tracking`, {
    params: {
      year,
      energy_type_id: energyTypeId,
    },
  });

  return result.data;
};

export const getAnnualBudgetApi = annualBudgetApi.getAll;
