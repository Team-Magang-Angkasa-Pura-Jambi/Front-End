import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { authService } from "../services";

export const useLogin = () => {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { token, user } = response.data;

      setToken(token, user);

      router.push("/");
    },
    onError: (error) => {
      console.error("Login gagal:", error);
    },
  });
};
