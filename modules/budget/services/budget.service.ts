import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";

export type MonthlyBudgetAllocation = {
  month: number;
  monthName: string;
  allocatedBudget: number;
  realizationCost: number;
  remainingBudget: number;
  realizationPercentage: number | null;
};

export type ProcessBudgetPayload = {
  pjj_rate: number;
  process_date?: string;
};

export type BudgetPreviewPayload = {
  parent_budget_id?: number | null;
  total_budget: number;
  period_start: string;
  period_end: string;
  allocations?: { meter_id: number; weight: number }[];
};

export type MeterAllocationPreview = {
  meterId: number;
  meterName: string;
  allocatedBudget: number;
  dailyBudgetAllocation: number;
  estimatedDailyKwh: number | null;
};

export type BudgetPreviewResponse = {
  monthlyAllocation: Omit<
    MonthlyBudgetAllocation,
    "realizationCost" | "remainingBudget" | "realizationPercentage"
  >[];
  meterAllocationPreview: MeterAllocationPreview[];
  calculationDetails: {
    parentTotalBudget: number;
    efficiencyBudget: number;
    realizationToDate: number;
    remainingBudgetForPeriod: number;
    budgetPerMonth: number;
    suggestedBudgetForPeriod: number;
  } | null;
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

export type PrepareNextPeriodBudget = {
  parentBudgetId: number;
  parentTotalBudget: number;
  totalAllocatedToChildren: number;
  availableBudgetForNextPeriod: number;
  prepareNextPeriodBudget: number;
};

const prefix = "/budgets";
export const budgetApi = {
  getBudgetPreview: async (
    payload: BudgetPreviewPayload
  ): Promise<BudgetPreviewResponse> => {
    const response = await api.post(prefix + "/preview", payload);
    return response.data.data;
  },

  getSummary: async (year: number): Promise<BudgetSummaryItem[]> => {
    const response = await api.get<ApiResponse<BudgetSummaryItem[]>>(
      prefix + "/summary",
      { params: { year } }
    );
    return response.data.data;
  },
  prepareNextPeriodBudget: async (
    parentBudgetId: number
  ): Promise<PrepareNextPeriodBudget> => {
    const response = await api.get(prefix + `/prepare/${parentBudgetId}`);
    return response.data.data;
  },
};
