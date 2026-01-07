import api from "@/lib/api";

// --- Types ---

export type MonthlyBudgetAllocation = {
  month: number;
  monthName: string;
  allocatedBudget: number;
  realizationCost: number;
  remainingBudget: number;
  realizationPercentage: number | null;
};

export type PrepareNextPeriodBudget = {
  parentBudgetId: number;
  parentTotalBudget: number;
  totalAllocatedToChildren: number;
  availableBudgetForNextPeriod: number;
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

// --- API Implementation ---

export const analyticsApi = {
  getMonthlyAllocation: async (
    year: number
  ): Promise<MonthlyBudgetAllocation[]> => {
    const response = await api.get("/analytics/budget-allocation", {
      params: { year },
    });
    return response.data.data;
  },

  getBudgetPreview: async (
    payload: BudgetPreviewPayload
  ): Promise<BudgetPreviewResponse> => {
    const response = await api.post("/analytics/budget-preview", payload);
    return response.data.data;
  },

  prepareNextPeriodBudget: async (
    parentBudgetId: number
  ): Promise<PrepareNextPeriodBudget> => {
    const response = await api.get(
      `/analytics/prepare-budget/${parentBudgetId}`
    );
    return response.data.data;
  },
};

// Alias untuk kompatibilitas jika dibutuhkan
export const getBudgetPreviewApi = analyticsApi.getBudgetPreview;
export const getprepareNextPeriodBudgetApi =
  analyticsApi.prepareNextPeriodBudget;
