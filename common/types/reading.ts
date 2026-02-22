export interface readingTypes {
  reading_type_id: number;
  type_name: string;
  unit: string;
  energy_type_id: number;
}
export interface ReadingDetail {
  reading_type_id: number | "";
  value: number | "";
}
