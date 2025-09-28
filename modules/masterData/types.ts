// Tipe data berdasarkan skema Prisma Anda

export interface EnergyType {
  energy_type_id: number;
  type_name: string;
  unit_of_measurement: string;
  is_active: boolean;
}

export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  energy_type: {
    type_name: string;
  };
}

export interface Meter {
  meter_id: number;
  meter_code: string;
  location: string | null;
  status: "Active" | "UnderMaintenance" | "Inactive" | "DELETED";
  energy_type: {
    type_name: string;
  };
}

export interface PriceScheme {
  scheme_id: number;
  scheme_name: string;
  effective_date: string; // ISO string date
  is_active: boolean;
  energy_type: {
    type_name: string;
  };
}

export interface EfficiencyTarget {
  target_id: number;
  kpi_name: string;
  target_value: number;
  period_start: string;
  period_end: string;
  energy_type: {
    type_name: string;
  };
}
