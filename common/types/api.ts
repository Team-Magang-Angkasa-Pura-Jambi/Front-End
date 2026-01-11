export interface ApiResponse<T> {
  data: T;
  status: {
    code: number;
    message: string;
  };
}
// Sesuaikan dengan JSON Backend Anda
export interface ApiErrorResponse {
  status: {
    code: number;
    message: string; // Target kita: "Nama pengguna atau kata sandi salah."
  };
  errors: string;
}
