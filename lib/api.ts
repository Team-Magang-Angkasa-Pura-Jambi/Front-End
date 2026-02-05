import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

/* 🌍 Base URL */
const baseURL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT
    : process.env.NEXT_PUBLIC_API_URL_PRODUCTION;

/* 🔌 Axios instance */
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // penting kalau BE pakai cookie juga
});

/* 🔐 REQUEST INTERCEPTOR */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* 🚨 RESPONSE INTERCEPTOR (TOKEN EXPIRED HANDLER) */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    console.log(error);

    if (status === 401) {
      // 🔥 sinkronisasi FE dengan BE
      const logout = useAuthStore.getState().logout;
      logout();

      // Hindari loop redirect
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/auth-required")
      ) {
        window.location.href = "/auth-required";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
