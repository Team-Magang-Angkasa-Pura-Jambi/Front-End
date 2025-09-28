import api from "@/lib/api";

// Definisikan tipe data yang diharapkan dari API untuk autocompletion dan type safety.
// Mendefinisikan tipe ini di awal adalah praktik yang baik.
export interface ConsumptionData {
  total_consumption: number;
  previous_period_consumption: number;
  percentage_change: number;
  unit: string;
}

export interface SummaryData {
  period: {
    start: string;
    end: string;
  };
  summary: {
    electricity: ConsumptionData;
    water: ConsumptionData;
    fuel: ConsumptionData;
  };
}

export const summaryApi = async (
  year: string,
  mount: string
): Promise<SummaryData> => {
  const response = await api.get<SummaryData>(
    `/daily-summary/reports/monthly?year=${year}&month=${mount}`
  );

  return response.data;
};
