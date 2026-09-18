import api from "@/lib/api";

export interface ImportErrorDetail {
  row: number;
  meter_code: string;
  reading_date: string;
  message: string;
}

export interface ImportResultSummary {
  total_rows: number;
  success_count: number;
  failed_count: number;
  errors: ImportErrorDetail[];
}

export const downloadImportTemplateApi = async (
  energyTypeId: number,
  meterId?: number
): Promise<Blob> => {
  const params: Record<string, any> = { energy_type_id: energyTypeId };
  if (meterId) params.meter_id = meterId;

  const response = await api.get("/reading-sessions/import/template", {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const uploadImportDataApi = async (
  energyTypeId: number,
  file: File,
  meterId?: number
): Promise<{ message: string; data: ImportResultSummary }> => {
  const formData = new FormData();
  formData.append("energy_type_id", String(energyTypeId));
  if (meterId) formData.append("meter_id", String(meterId));
  formData.append("file", file);

  const response = await api.post("/reading-sessions/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
