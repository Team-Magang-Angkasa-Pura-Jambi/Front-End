export interface EnergyType {
  energy_type_id: number;
  name: string;
  unit_standard: string;
}

/**
 * Interface Base Budget (Digunakan untuk List/Daftar)
 */
export interface AnnualBudget {
  budget_id: number;
  fiscal_year: number;
  energy_type_id: number;
  name: string;
  total_amount: string; // Prisma Decimal dikirim sebagai string di JSON
  efficiency_target_percentage: string | null; // Prisma Decimal dikirim sebagai string
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;

  // Relations
  energy_type: EnergyType;
}

/**
 * Interface Detail Budget (Response untuk getById)
 */
export interface AnnualBudgetDetail extends AnnualBudget {
  creator?: {
    username: string;
  };
  updater?: {
    username: string;
  };
}

/**
 * Interface Sisa Budget (Response untuk showRemaining)
 */
export interface AnnualBudgetRemaining extends AnnualBudget {
  total_realization: number;
  remaining_budget: number;
}
