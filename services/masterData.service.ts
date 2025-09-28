// PERBAIKAN: Impor instance axios yang sudah dikonfigurasi.
// Pastikan path ini menunjuk ke file api yang kita buat sebelumnya.
import api from "@/lib/api";

/**
 * Factory function untuk membuat metode CRUD dasar untuk sebuah endpoint API.
 * @param endpoint Nama endpoint (misal: 'meters', 'price-schemes')
 * @returns Objek dengan metode getAll, getByEnergyType, create, update, dan delete.
 */
const createApiMethods = <T>(endpoint: string) => {
  return {
    /**
     * Mengambil semua data dari endpoint.
     * Maps to: GET /api/v1/{endpoint}
     */
    getAll: async (): Promise<T[]> => {
      // PERBAIKAN: Menggunakan api secara konsisten
      const response = await api.get<T[]>(`/${endpoint}`);
      return response.data;
    },

    /**
     * Mengambil data berdasarkan energy_type_id.
     * Maps to: GET /api/v1/{endpoint}?energyTypeId={id}
     */
    getByEnergyType: async (id: number): Promise<T[]> => {
      const response = await api.get<T[]>(`/${endpoint}?energyTypeId=${id}`);
      return response.data;
    },

    /**
     * Membuat data baru.
     * Maps to: POST /api/v1/{endpoint}
     */
    create: async (data: Partial<T>): Promise<T> => {
      const response = await api.post<T>(`/${endpoint}`, data);
      return response.data;
    },

    /**
     * Memperbarui data berdasarkan ID.
     * Maps to: PATCH /api/v1/{endpoint}/{id}
     */
    update: async (id: number, data: Partial<T>): Promise<T> => {
      const response = await api.patch<T>(`/${endpoint}/${id}`, data);
      return response.data;
    },

    /**
     * Menghapus data berdasarkan ID.
     * Maps to: DELETE /api/v1/{endpoint}/{id}
     */
    delete: async (id: number): Promise<void> => {
      await api.delete(`/${endpoint}/${id}`);
    },
  };
};

// PERBAIKAN: Nama ekspor diubah menjadi 'api' agar sesuai dengan cara impor di komponen.
export const masterData = {
  // Nama endpoint disesuaikan dengan file routes di backend Anda
  category: createApiMethods("meters-category"),
  energyType: createApiMethods("energy-types"),
  tax: createApiMethods("tax"),
  meter: createApiMethods("meters"),
  readingType: createApiMethods("reading-types"),
  priceScheme: createApiMethods("price-schemes"),
  efficiencyTarget: createApiMethods("efficiency-targets"),
  // Anda bisa tambahkan endpoint lain di sini sesuai kebutuhan
  // user: createApiMethods('users'),
  // role: createApiMethods('roles'),
};
