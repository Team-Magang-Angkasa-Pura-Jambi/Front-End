import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const fetchUserProfile = async () => {
  const { data } = await api.get("/profile");
  return data;
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });
};
