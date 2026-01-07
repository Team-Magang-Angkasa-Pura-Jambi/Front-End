// @/common/types/analysis.ts

export interface SuggestedAllocation {
  meter_id: number;
  meter_name: string;
  average_usage: number; // Rata-rata pemakaian sebelumnya
  suggested_weight: number; // Rekomendasi bobot (0.0 - 1.0)
}

export interface BudgetPreparationData {
  // Rekomendasi Periode (biasanya bulan berikutnya dari budget terakhir)
  suggested_period_start: string; // Format ISO: "2024-02-01"
  suggested_period_end: string;   // Format ISO: "2024-02-29"
  
  // Informasi Keuangan Parent
  parent_budget_id: number;
  parent_total_budget: number;
  total_allocated_so_far: number; // Total yang sudah dipakai child budget lain
  remaining_budget: number;       // Sisa yang boleh dipakai (Parent - Allocated)
  
  // Rekomendasi Alokasi (Opsional)
  allocations?: SuggestedAllocation[];
}