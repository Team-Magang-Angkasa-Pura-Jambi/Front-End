import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

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
    const requestUrl = error.config?.url;

    if (status === 401) {
      const isLoginRequest = requestUrl?.includes("/login") || requestUrl?.includes("/auth");

      if (!isLoginRequest) {
        const logout = useAuthStore.getState().logout;
        logout();

        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;

          const isCurrentlyOnAuthPage = currentPath.startsWith("/auth") || currentPath === "/login";
          const isAlreadyOnAuthRequired = currentPath.startsWith("/auth-required");

          if (!isCurrentlyOnAuthPage && !isAlreadyOnAuthRequired) {
            window.location.href = "/auth-required";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
