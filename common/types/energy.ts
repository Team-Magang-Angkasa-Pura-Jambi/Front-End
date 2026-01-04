import { meters } from "./meters";
import { readingTypes } from "./reading";

export interface EnergyType {
  energy_type_id: number;
  type_name: string;
  unit_of_measurement: string;
  is_active: boolean;
  reading_types: readingTypes[];
  meters: meters[];
}



