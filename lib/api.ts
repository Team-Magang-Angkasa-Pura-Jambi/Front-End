import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const baseURL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT
    : process.env.NEXT_PUBLIC_API_URL_PRODUCTION;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    if (status === 401) {
      const isApiLogin = requestUrl.includes("/auth/login");

      const isFrontendLogin =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/auth/login");

      if (!isApiLogin && !isFrontendLogin) {
        const logout = useAuthStore.getState().logout;
        logout();

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/auth-required")
        ) {
          window.location.href = "/auth-required";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
