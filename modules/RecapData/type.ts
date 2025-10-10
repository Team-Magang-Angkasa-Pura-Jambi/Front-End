export interface RecapDataRow {
  date: string; // ISO String
  wbp: number | null;
  lwbp: number | null;
  consumption: number | null;
  target: number | null;
  pax: number | null;
  cost: number | null;
  classification: "HEMAT" | "NORMAL" | "BOROS" | "UNKNOWN" | null;
}

export interface RecapMeta {
  totalCost: number;
  totalTarget: number;
  totalCostBeforeTax: number;
  totalConsumption: number;
  totalPax: number;
}

export interface RecapApiResponse {
  data: RecapDataRow[];
  meta: RecapMeta;
}

export interface RecapSummary {
  /** Total biaya finansial untuk seluruh periode. */
  totalCost: number;

  /** Total biaya sebelum pajak. */
  totalCostBeforeTax: number;

  /** Total target efisiensi yang telah disesuaikan (prorata) untuk periode yang dipilih. */
  totalTarget: number;

  /** Total konsumsi energi (WBP + LWBP untuk listrik, atau total untuk jenis lain). */
  totalConsumption: number;

  /** Total konsumsi WBP (khusus untuk listrik). */
  totalWbp: number;

  /** Total konsumsi LWBP (khusus untuk listrik). */
  totalLwbp: number;

  /** Total penumpang (pax) selama periode yang dipilih. */
  totalPax: number;
}
