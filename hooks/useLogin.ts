import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

interface LoginCredentials {
  username?: string;
  password?: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

interface ResponseData {
  token: string;
  user: User;
}

interface ApiResponse {
  data: ResponseData;
  status: {
    code: number;
    message: string;
  };
}

const loginUser = async (
  credentials: LoginCredentials
): Promise<ApiResponse> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const useLogin = () => {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: loginUser,
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
