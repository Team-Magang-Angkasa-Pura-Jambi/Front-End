// Tipe data untuk objek Pengguna tunggal, sesuai dengan API Anda
export interface User {
  user_id: number;
  username: string;
  role: {
    role_id: number;
    role_name: string;
  };
  photo_profile_url?: stirng;
  is_active: boolean;
  created_at: string; // ISO string date
}

// Tipe untuk payload saat membuat pengguna baru
export interface CreateUserPayload {
  username: string;
  password?: string; // Opsional saat membuat, wajib di form
  role_id: number;
  photo_profile_url?: string;
}

// Tipe untuk payload saat memperbarui pengguna
export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  // Semua field opsional saat update
  is_active?: boolean;
}
