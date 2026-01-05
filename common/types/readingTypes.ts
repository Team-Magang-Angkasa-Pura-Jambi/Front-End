import { EnergyType } from "./energy";

export type ReadingType = {
  reading_type_id: number;
  type_name: string;
  reading_unit: string;
  energy_type_id: number;
  energy_type: EnergyType;
};
