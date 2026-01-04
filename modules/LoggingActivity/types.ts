// Tipe data spesifik yang digabungkan dari Prisma
// Ini merepresentasikan satu baris data di tabel riwayat Anda

import { EnergyTypeName } from "@/common/types/energy";

export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
}

// Tipe untuk props filter di komponen Header
export interface HistoryFilters {
  type: EnergyTypeName;
  date: import("react-day-picker").DateRange | undefined;
  sortBy: "reading_date" | "created_at";
  sortOrder: "asc" | "desc";
  meterId: number;
}
