import { ApiResponse } from "@/common/types/api"; // Asumsi ApiResponse punya prop { status, data }
import api from "@/lib/api";
import { AnnualBudget } from "@/common/types/budget";
import { EnergyTypeName } from "@/common/types/energy";

type YearOptionsData = {
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

export const yearOptionsApi = async (): Promise<
  ApiResponse<YearOptionsData>
> => {
  const response = await api.get("/annual-budgets/year-options");
  return response.data;
};

export const getBudgetSummaryApi = async (
  year: number
): Promise<BudgetSummaryItem[]> => {
  const response = await api.get<ApiResponse<BudgetSummaryItem[]>>(
    "/analysis/budget-summary",
    {
      params: { year },
    }
  );

  return response.data.data;
};

export const getAnnualBudgetApi = async (
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
};
