import api from "@/lib/api";

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
