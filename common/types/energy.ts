import { meters } from "./meters";
import { readingTypes } from "./reading";

export const ENERGY_TYPES = {
  ELECTRICITY: "Electricity",
  WATER: "Water",
  FUEL: "Fuel",
} as const;

export type EnergyTypeName = (typeof ENERGY_TYPES)[keyof typeof ENERGY_TYPES];

export interface EnergyType {
  energy_type_id: number;
  type_name: EnergyTypeName;
  unit_of_measurement: string;
  is_active: boolean;
  reading_types: readingTypes[];
  meters: meters[];
}
