// Tipe data spesifik yang digabungkan dari Prisma
// Ini merepresentasikan satu baris data di tabel riwayat Anda

import { EnergyTypeName } from "@/common/types/energy";
import { DateRange } from "react-day-picker";

export interface ReadingType {
  reading_type_id: number;
  type_name: string;
  energy_type_id: number;
}

// Tipe untuk props filter di komponen Header

export interface HistoryFilters {
  // Filter Utama
  type: EnergyTypeName;
  meterId?: number; // Opsional karena user mungkin memilih "All Meters" atau belum memilih

  // Filter Waktu
  date: DateRange | undefined;

  // Sorting & Pagination
  sortBy: "reading_date" | "created_at";
  sortOrder: "asc" | "desc";
}
