export const ENERGY_TYPES = {
  ELECTRICITY: "Electricity",
  WATER: "Water",
  FUEL: "Fuel",
} as const;

export type EnergyTypeName = (typeof ENERGY_TYPES)[keyof typeof ENERGY_TYPES];

export interface Meter {
  meter_code: string;
  name: string;
}

export interface MeterConfig {
  meter: Meter;
}

export interface ReadingType {
  reading_type_id: number;
  energy_type_id: number;
  type_name: string;
  unit: string;
  // Sesuai data JSON: meter_configs ada di dalam reading_type
  meter_configs?: MeterConfig[];
  scheme_rates?: any[]; // Tambahkan jika ada data rate/tarif
}

export interface EnergyType {
  energy_type_id: number;
  name: string;
  unit_standard: string;
  is_active: boolean;
  reading_types?: ReadingType[];
}
