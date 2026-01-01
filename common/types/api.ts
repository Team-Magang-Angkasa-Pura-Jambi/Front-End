
export interface ApiResponse<T> {
  data: T;
  status: {
    code: number;
    message: string;
  };
}
