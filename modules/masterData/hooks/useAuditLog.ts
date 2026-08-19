import { AuditLog } from "@/common/types/audit-log";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogsApi } from "../services/auditLog.service";

export interface AuditLogResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Gunakan objek untuk parameter agar lebih opsional dan rapi
interface AuditLogParams {
  entityTable?: string;
  start_date?: string;
  end_date?: string;
}

export const useAuditLog = ({ entityTable, start_date, end_date }: AuditLogParams) => {
  return useQuery<AuditLogResponse>({
    // Tambahkan filters ke queryKey agar otomatis refetch saat tanggal berubah
    queryKey: ["audit-logs", entityTable, start_date, end_date],

    // Kirimkan parameter tanggal ke API service
    queryFn: () =>
      getAuditLogsApi({
        entity_table: entityTable,
        start_date,
        end_date,
        limit: 20,
      }),

    // Jalankan query hanya jika entityTable sudah ada (opsional)
    enabled: !!entityTable,
    staleTime: 1000 * 60 * 2, // 2 menit
  });
};
