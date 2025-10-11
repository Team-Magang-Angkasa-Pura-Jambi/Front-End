import api from "@/lib/api";

export interface LogbookEntry {
  log_id: number;
  log_date: string;
  meter_id: number;
  consumption_change_percent: string | null;
  savings_value: string | null;
  savings_cost: string | null;  
  overage_value: string | null;
  overage_cost: string | null;
  summary_notes: string;
  manual_notes: string | null;
  meter: {
    energy_type: {
      type_name: "Electricity" | "Water" | "Fuel";
    };
  };
}

export interface LogbookApiResponse {
  status: { code: number; message: string };
  data: {
    data: LogbookEntry[];
  };
}

export const getLogbooksApi = (startDate: string, endDate: string) => {
  return api.get<LogbookApiResponse>(
    `/logbooks?startDate=${startDate}&endDate=${endDate}`
  );
};
