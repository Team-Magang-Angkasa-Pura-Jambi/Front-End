export interface meters {
  meter_id: number;
  meter_code: string;
  location: string;
  status: Status;
  energy_type_id: number;
}

// 1. Definisikan Sub-Types Terlebih Dahulu agar Rapi

export type MeterStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export type TankShape = "CYLINDER_VERTICAL" | "CYLINDER_HORIZONTAL" | "BOX";

export interface EnergyType {
  energy_type_id: number;
  name: string;
  unit_standard: string;
}

export interface Location {
  location_id: number;
  name: string;
  description?: string;
}

export interface Tenant {
  tenant_id: number;
  name: string;
  code?: string;
}

export interface TankProfile {
  profile_id: number;
  meter_id: number;
  shape: TankShape;
  capacity_liters: number;
  height_max_cm: number;
  diameter_cm?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
}

export interface ReadingType {
  reading_type_id: number;
  name: string;
  unit: string;
  code: string;
}

export interface ReadingConfig {
  config_id: number;
  meter_id: number;
  reading_type_id: number;
  is_active: boolean;
  alarm_min_threshold: number | null;
  alarm_max_threshold: number | null;
  // Include relation
  reading_type?: ReadingType;
}

// 2. Definisi Utama MeterType

export type MeterType = {
  // Identitas
  meter_id: number;
  meter_code: string;
  serial_number: string | null;
  name: string | null; // Bisa null sesuai schema

  // Foreign Keys
  tenant_id: number | null;
  location_id: number | null;
  calculation_template_id: string | null; // UUID biasanya string
  price_scheme_id: number | null;
  energy_type_id: number;

  // Status & Flags
  status: MeterStatus;
  is_virtual: boolean;

  // Konfigurasi Teknis
  multiplier: number; // Disarankan number di FE untuk kalkulasi
  allow_gap: boolean;
  allow_decrease: boolean;

  // Rollover
  rollover_limit: number | null;

  // Audit Trails
  created_at: string; // ISO Date
  updated_at: string; // ISO Date
  created_by: number | null; // ID User biasanya number
  updated_by: number | null;

  // --- RELASI (Nested Objects) ---
  // Gunakan optional (?) jika data ini tidak selalu di-include dari backend

  energy_type?: EnergyType;
  location?: Location | null;
  tenant?: Tenant | null;
  tank_profile?: TankProfile | null;
  reading_configs?: ReadingConfig[]; // Array konfigurasi bacaan

  calculation_template?: {
    name: string;
    creator?: { full_name: string };
    definitions: Array<{
      name: string;
      formula_items: {
        formula: string;
        variables: Array<{
          label: string;
          type: string;
          timeShift: number;
        }>;
      };
    }>;
  };
  // Jika ada data user pembuat/pengupdate
  updater?: {
    full_name: string;
  };
};

enum Status {
  "Active",
  "UnderMaintenance",
  "Inactive",
  "DELETED",
}
