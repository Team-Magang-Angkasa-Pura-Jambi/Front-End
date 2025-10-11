import api from "@/lib/api";

// Tipe untuk data harian yang diterima dari API analisis
export interface DailyRecord {
  date: string;
  actual_consumption: number | null;
  prediction: number | null;
  classification: "HEMAT" | "NORMAL" | "BOROS" | null;
  efficiency_target: number | null;
  totalDaysWithClassification: number | null;
}

// Tipe untuk data per meter
export interface MeterAnalysisData {
  meterId: number;
  meterName: string;
  data: DailyRecord[];
}

// Tipe untuk respons API analisis secara keseluruhan
interface AnalysisApiResponse {
  data: MeterAnalysisData[];
}

// Tipe untuk respons API ringkasan klasifikasi
interface ClassificationSummaryResponse {
  data: {
    classification: "HEMAT" | "NORMAL" | "BOROS";
    count: number;
  }[];
}

export const analysisApi = async (
  type: "Electricity" | "Water" | "Fuel",
  mount: string,
  meterId: number[]
): Promise<AnalysisApiResponse> => {
  const meterIdParams = meterId.map((id) => `meterId=${id}`).join("&");
  const response = await api.get(
    `/analysis?energyType=${type}&month=${mount}&${meterIdParams}`
  );
  return response.data;
};

export const getClassificationSummaryApi = async (
  year: string,
  month: string,
  energyType: "Electricity" | "Water" | "Fuel",
  meterId: number
): Promise<ClassificationSummaryResponse> => {
  const monthQuery = `${year}-${month}`;
  const response = await api.get(
    `/analysis/classification-summary?month=${monthQuery}&energyType=${energyType}&meterId=${meterId}`
  );
  return response.data;
};
