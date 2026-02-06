export type MonthlyBudgetAllocation = {
  month: number;
  monthName: string;
  allocatedBudget: number;
  realizationCost: number;
  remainingBudget: number;
  realizationPercentage: number | null;
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
