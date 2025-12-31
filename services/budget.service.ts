import api from "@/lib/api";

/**
 * Tipe data untuk alokasi anggaran bulanan yang diterima dari backend.
 */
export type MonthlyBudgetAllocation = {
  month: number;
  monthName: string;
  allocatedBudget: number;
  realizationCost: number;
  remainingBudget: number;
  realizationPercentage: number | null;
};

/**
 * Tipe data untuk payload saat memproses anggaran.
 */
export type ProcessBudgetPayload = {
  pjj_rate: number;
  process_date?: string; // Format: "YYYY-MM-DD"
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

export const budgetApi = {
  /**
   * Mengambil data alokasi anggaran bulanan dari backend.
   * Berinteraksi dengan: GET /api/v1/analysis/budget-allocation
   *
   * @param year Tahun yang akan dianalisis.
   * @returns Promise yang berisi array data alokasi anggaran bulanan.
   */
  getAllocation: async (year: number): Promise<MonthlyBudgetAllocation[]> => {
    const response = await api.get("/analysis/budget-allocation", {
      params: { year },
    });
    // Biasanya, data ada di dalam `response.data.data` jika menggunakan wrapper `res200`
    return response.data.data;
  },

  /**
   * Memicu proses kalkulasi ulang anggaran di backend.
   * Berinteraksi dengan: POST /api/v1/budget/process
   *
   * @param payload Data yang dibutuhkan untuk proses, seperti pjj_rate.
   * @returns Promise yang berisi hasil dari proses kalkulasi.
   */
  process: async (payload: ProcessBudgetPayload) => {
    const response = await api.post("/budget/process", payload);
    return response.data;
  },

  /**
   * Mengambil data pratinjau alokasi anggaran bulanan.
   * Berinteraksi dengan: POST /api/v1/analysis/budget-preview
   *
   * @param payload Data yang dibutuhkan untuk pratinjau.
   * @returns Promise yang berisi array data alokasi anggaran bulanan.
   */
  getPreview: async (
    payload: BudgetPreviewPayload
  ): Promise<BudgetPreviewResponse> => {
    const response = await api.post("/analysis/budget-preview", payload);
    return response.data.data;
  },
};
