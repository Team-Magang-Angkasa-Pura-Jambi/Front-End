import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { authService } from "../services";
import { LoginCredentials, LoginResponseDTO } from "../types/auth.dto";
import { ApiErrorResponse } from "@/common/types/api";
import { AxiosError } from "axios";

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<
    LoginResponseDTO,
    AxiosError<ApiErrorResponse>,
    LoginCredentials
  >({
    mutationFn: authService.login,

    onSuccess: (response) => {
      const { token, user } = response.data;

      setAuth(token, user);

      router.push("/");
    },

    onError: (error) => {
      
      const errorMessage =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat login.";

      console.error("Pesan Error Backend:", errorMessage);
    },
  });
};
