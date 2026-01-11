export type meterCategory = {
  category_id: number;
  name: string;
};

export type meterTarif = {
  tariff_group_id: number;
  group_code: string;
  faktor_kali: number;
};

export const STATUS_METER = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  MAINTENANCE: "UnderMaintenance",
  DELETED: "DELETED",
} as const;

export type MeterPayload = {
  meter_code: string;
  status: statusMeter;
  has_rollover: boolean;
  category_id: number;
  tariff_group_id: number;
  energy_type_id: number;
  tank_height_cm?: number | null;
  tank_volume_liters?: number | null;
  rollover_limit?: number | null;
};
export type statusMeter = (typeof STATUS_METER)[keyof typeof STATUS_METER];
