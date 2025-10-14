import api from "@/lib/api";

interface ReadingDetailPayload {
  reading_type_id: number;
  value: number;
}
export interface GetReadingSessionsQuery {
  energyTypeName?: "Electricity" | "Water" | "Fuel";
  startDate?: string; // Direpresentasikan sebagai ISO string
  endDate?: string; // Direpresentasikan sebagai ISO string
  meterId?: number;
  sortBy?: "reading_date" | "created_at";
  sortOrder?: "asc" | "desc";
}

/**
 * Tipe data detail yang diperkaya dengan relasi,
 * merepresentasikan satu baris data di tabel riwayat.
 * Dibuat menggunakan tipe utilitas Prisma untuk sinkronisasi dengan skema.
 */
export type ReadingSessionWithDetails = Prisma.ReadingSessionGetPayload<{
  include: {
    meter: {
      select: {
        meter_code: true;
      };
    };
    user: {
      select: {
        username: true;
      };
    };
    details: {
      include: {
        reading_type: {
          select: {
            type_name: true;
          };
        };
      };
    };
  };
}>;

export interface GetReadingSessionsQuery {
  energyTypeName?: "Electricity" | "Water" | "Fuel";
  startDate?: string;
  endDate?: string;
  meterId?: number;
  sortBy?: "reading_date" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface CreateReadingSessionBody {
  meter_id: number;
  reading_date: string;
  details: ReadingDetailPayload[];
}

export type UpdateReadingSessionBody = Partial<CreateReadingSessionBody>;

/**
 * Mengambil data riwayat sesi pembacaan dari API backend.
 * @param params - Objek berisi parameter filter.
 */
export const getReadingSessionsApi = async (
  params: GetReadingSessionsQuery
): Promise<ReadingSessionApiResponse> => {
  const queryParams = new URLSearchParams();

  if (params.energyTypeName) {
    queryParams.append("energyTypeName", params.energyTypeName);
  }
  if (params.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params.meterId) {
    queryParams.append("meterId", String(params.meterId));
  }
  if (params.sortBy) {
    queryParams.append("sortBy", params.sortBy);
  }
  if (params.sortOrder) {
    queryParams.append("sortOrder", params.sortOrder);
  }

  const response = await api.get(`/readings/history?${queryParams.toString()}`);
  return response.data;
};

/**
 * Membuat sesi pembacaan baru.
 * @param data - Body request berisi detail sesi baru.
 */
export const createReadingSessionApi = async (
  data: CreateReadingSessionBody
): Promise<ReadingSessionWithDetails> => {
  const response = await api.post("/readings", data);
  return response.data;
};

/**
 * Memperbarui sesi pembacaan yang sudah ada.
 * @param sessionId - ID dari sesi yang akan diperbarui.
 * @param data - Body request berisi data yang akan diubah.
 */
export const updateReadingSessionApi = async (
  sessionId: number,
  data: UpdateReadingSessionBody
): Promise<ReadingSessionWithDetails> => {
  const response = await api.patch(`/readings/${sessionId}`, data);
  return response.data;
};

/**
 * Menghapus sesi pembacaan.
 * @param sessionId - ID dari sesi yang akan dihapus.
 */
export const deleteReadingSessionApi = async (
  sessionId: number
): Promise<{ message: string }> => {
  console.log(sessionId);

  const response = await api.delete(`/readings/${sessionId}`);
  return response.data;
};
