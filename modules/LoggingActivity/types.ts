import { DateRange } from "react-day-picker";

export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
}

export interface HistoryFilters {
  meter_id?: number;

  date: DateRange | undefined;
}
