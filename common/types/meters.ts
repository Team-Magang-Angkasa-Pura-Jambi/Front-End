import {
  meterCategory,
  meterTarif,
  statusMeter,
} from "@/modules/masterData/types/meter.type";
import { EnergyType } from "./energy";

export interface meters {
  meter_id: number;
  meter_code: string;
  location: string;
  status: Status;
  energy_type_id: number;
}

export type MeterType = {
  meter_id: number;
  meter_code: string;
  status: statusMeter;
  energy_type_id: number;
  category_id: number;
  tariff_group_id: number;
  category: meterCategory;
  tariff_group: meterTarif;
  energy_type: EnergyType;
  tank_height_cm?: number | null;
  tank_volume_liters?: number | null;
  rollover_limit?: number | null;
  has_rollover?: boolean;
};

enum Status {
  "Active",
  "UnderMaintenance",
  "Inactive",
  "DELETED",
}
