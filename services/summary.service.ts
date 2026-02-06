import { ApiResponse } from "@/common/types/api";
import api from "@/lib/api";

// Definisikan tipe data yang diharapkan dari API untuk autocompletion dan type safety.
// Mendefinisikan tipe ini di awal adalah praktik yang baik.
// 1. Interface untuk nilai perbandingan (Current vs Previous)
// Digunakan oleh: totalPax, averageTemperature, totalConsumption, totalCost
export interface MetricComparison {
  currentValue: number;
  previousValue: number;
  percentageChange: number | null;
}

// 2. Interface untuk Period Laporan
export interface ReportPeriod {
  year: number;
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
}

// 3. Interface untuk item di dalam Array Summary (Electricity, Water, Fuel)
export interface EnergySummaryItem {
  energyType: string; // Bisa diganti "Electricity" | "Water" | "Fuel" jika tipe datanya pasti
  unit: string;
  totalConsumption: MetricComparison;
  totalCost: MetricComparison;
}

// 4. Interface untuk Data Utama
export interface SummaryData {
  reportPeriod: ReportPeriod;
  totalPax: MetricComparison;
  averageTemperature: MetricComparison;
  averageMaxTemperature: MetricComparison;
  todayTemperature: {
    avg_temp: number;
    max_temp: number;
  };
  summary: EnergySummaryItem[];
}

export const summaryApi = async (
  year: string,
  mount: string
): Promise<ApiResponse<SummaryData>> => {
  const response = await api.get(
    `/daily-summary/reports-monthly?year=${year}&month=${mount}`
  );

  return response.data;
};
