export interface readingTypes {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
}
export interface ReadingDetail {
  reading_type_id: number | "";
  value: number | "";
}
