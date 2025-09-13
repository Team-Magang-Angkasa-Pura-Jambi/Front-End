import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

// Buat instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Buat Interceptor (penjegal) untuk request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari Zustand store
    const token = useAuthStore.getState().token;

    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
