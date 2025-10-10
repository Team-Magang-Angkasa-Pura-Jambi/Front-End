// Tipe data spesifik yang digabungkan dari Prisma
// Ini merepresentasikan satu baris data di tabel riwayat Anda

interface ReadingTypeDetail {
  detail_id: number;
  value: number | string; // Prisma Decimal bisa jadi string atau number
  reading_type: {
    type_name: string;
  };
}

export interface Meter {
  meter_id: number;
  meter_code: string;
  status: "Active" | "UnderMaintenance" | "Inactive" | "Deleted";
  category: MeterCategory;
  energy_type: EnergyType;
  // Relasi ini akan kita tambahkan di backend untuk mempermudah
  allowed_reading_types: ReadingType[];
}
export interface EnergyType {
  energy_type_id: number;
  type_name: string;
  unit_of_measurement: string;
}

export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
}

interface UserSummary {
  username: string;
}

interface MeterSummary {
  meter_code: string;
}

export interface ReadingSessionWithDetails {
  session_id: number; // Menggunakan ID sesi untuk key
  reading_date: string | Date;
  created_at: string | Date;
  user: UserSummary;
  meter: MeterSummary;
  details: ReadingTypeDetail[];
}

export interface MeterCategory {
  category_id: number;
  name: string;
}

// Tipe untuk props filter di komponen Header
export interface HistoryFilters {
  type: "Electricity" | "Water" | "Fuel";
  date: import("react-day-picker").DateRange | undefined;
  sortBy: "reading_date" | "created_at" | string;
  sortOrder: "asc" | "desc";
  meterId: number | null | undefined;
}
