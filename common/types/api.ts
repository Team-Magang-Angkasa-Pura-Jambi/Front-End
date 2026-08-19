export interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
  };
  data: T;
}
// Sesuaikan dengan JSON Backend Anda
export interface ApiErrorResponse {
  status: {
    code: number;
    message: string; // Target kita: "Nama pengguna atau kata sandi salah."
  };
  errors: string;
}
