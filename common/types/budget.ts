export interface EnergyType {
  energy_type_id: number;
  name: string;
  unit_standard: string;
}

/**
 * Interface Alokasi per Meteran
 */
export interface AnnualBudgetAllocation {
  allocation_id: number;
  budget_id: number;
  meter_id: number;
  allocated_amount: string; // JSON mengirim string untuk Decimal
  allocated_volume: string; // JSON mengirim string
  monthly_distribution_profile: Record<string, number>;
  created_at: string;
  updated_at: string;

  // Relasi Meter
  meter: {
    name: string;
    meter_code: string;
  };

  // Virtual Fields untuk UI (Opsional jika dihitung di FE)
  total_realization?: number;
  remaining_budget?: number;
  realization_percentage?: number;
}

/**
 * Interface Base Budget (Digunakan untuk List/Daftar)
 */
export interface AnnualBudget {
  budget_id: number;
  fiscal_year: number;
  energy_type_id: number;
  name: string;
  total_amount: string; // Decimal dikirim string
  total_volume: string;
  efficiency_target_percentage: string | number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;

  // Relations
  energy_type: EnergyType;

  // Metadata dari Prisma (_count)
  _count?: {
    allocations: number;
  };
}

/**
 * Interface Detail Budget (Response Lengkap)
 */
export interface AnnualBudgetDetail extends AnnualBudget {
  allocations: AnnualBudgetAllocation[];
  creator: {
    username: string;
  };
}

/**
 * Response Wrapper Standar API (Untuk React Query)
 */
