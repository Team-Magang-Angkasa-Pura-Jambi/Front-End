import { EnergyTypeName } from "@/common/types/energy";
import { DateRange } from "react-day-picker";

// 1. Definisikan Enum/Union untuk konsistensi di seluruh aplikasi
export type ClassificationStatus =
  | "HEMAT"
  | "NORMAL"
  | "BOROS"
  | "UNKNOWN"
  | null;

// 2. Gunakan satu interface utama untuk data baris tabel
export interface RecapDataRow {
  date: string | Date;
  consumption: number | null;
  wbp: number | null;
  lwbp: number | null;
  target: number | null;
  pax: number | null;
  cost: number | null;
  cost_before_tax?: number | null; // Tambahkan untuk mendukung kalkulasi pajak
  max_temp: number | null;
  avg_temp: number | null;
  is_workday?: boolean | null;
  classification: ClassificationStatus;
  confidence_score?: number | null;
  prediction?: number | null;
  remaining_stock?: number | null;
  meter?: {
    meter_id: number;
    meter_code: string;
    location?: string;
  };
}

// 3. Gabungkan RecapMeta dan RecapSummary karena strukturnya identik
export interface RecapSummary {
  totalCost: number;
  totalCostBeforeTax: number;
  totalTarget: number;
  totalConsumption: number;
  totalWbp: number;
  totalLwbp: number;
  totalPax: number;
}

// Alias untuk menjaga backward compatibility jika diperlukan
export type RecapMeta = RecapSummary;

// 4. Struktur Response API
export interface RecapApiResponse {
  status: {
    code: number;
    message: string;
  };
  data: RecapDataRow[];
  meta: RecapSummary;
}

// 5. Interface untuk Parameter Query dan Filter
export interface RecapQueryParams {
  type: EnergyTypeName;
  startDate: string;
  endDate: string;
  sortBy?: string;
  meterId?: number | null;
}

export interface ConsumpFilter {
  type: EnergyTypeName;
  date: DateRange | undefined;
  sortBy: string | undefined;
  meterId: number | undefined;
}

// 6. Payload untuk Mutasi/Post
export interface RecapSingleClassificationPayload {
  date: string;
  meterId: number;
}

export interface RecapRecalculatePayload {
  startDate: string;
  endDate: string;
  meterId?: number | null;
}
export interface SingleAnalysisPayload {
  date: string;
  meterId: number;
}

/**
 * Tipe data untuk request bulk range (Prediksi mingguan/bulanan)
 */
export interface BulkPredictionPayload {
  /**
   * Tanggal mulai periode.
   * Format wajib: "YYYY-MM-DD"
   */
  start_date: string;

  /**
   * Tanggal akhir periode.
   * Format wajib: "YYYY-MM-DD"
   * Syarat: end_date >= start_date
   */
  end_date: string;

  /**
   * ID Meteran (Integer)
   */
  meter_id: number;
}
