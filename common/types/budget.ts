import { MonthlyBudgetAllocation } from "@/modules/budget/services/analytics.service";
import { EnergyType } from "./energy";
import { MeterType } from "./meters";

export interface AnnualBudgetAllocation {
  allocation_id: number;
  weight: number;
  budget_id: number;
  meter_id: number;
  meter: {
    meter_id: number;
    meter_code: string;
  };
  allocatedBudget: number;
  totalRealization: number;
  remainingBudget: number;
  realizationPercentage: number;
}

export interface AnnualBudget {
  budget_id: number;
  period_start: string;
  period_end: string;
  total_budget: number | null;
  efficiency_tag: number | null;
  energy_type: EnergyType | null;
  parent_budget_id?: number | null;
  allocations: AnnualBudgetAllocation[];
  totalRealization: number;
  remainingBudget: number;
  realizationPercentage: number;
  monthlyAllocation: MonthlyBudgetAllocation[];
  createdAt: string;
  updatedAt: string;
}

export type MonthlyUsageDetails = {
  month: number;
  allocatedBudget: number;
};
