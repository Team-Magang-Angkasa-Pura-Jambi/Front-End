import { EnergyType } from "./energy";
import { MeterType } from "./meters";

export type EfficiencyTarget = {
  target_id: number;
  kpi_name: string;
  target_value: number;
  target_cost: number;
  period_start: string;
  period_end: string;
  meter_id: number;

  meter?: MeterType;
  energy_type?: EnergyType;
  set_by_user?: {
    id: number;
    username: string;
  };
};
