import { ApiErrorResponse } from "@/common/types/api";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { authService } from "../services";
import { LoginCredentials, LoginResponseDTO } from "../types/auth.dto";

export const useLogin = () => {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setAuth);

  return useMutation<LoginResponseDTO, AxiosError<ApiErrorResponse>, LoginCredentials>({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { token, user } = response.data;

      setToken(token, user);

      router.push("/dashboard");
    },
    onError: (error) => {
      console.log("Pesan Error Backend:", error.response?.data?.status?.message);
    },
  });
};
