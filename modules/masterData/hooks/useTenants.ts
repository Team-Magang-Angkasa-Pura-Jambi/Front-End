import { ApiResponse } from "@/common/types/api";
import { Tenant } from "@/common/types/tenant";
import { useQuery } from "@tanstack/react-query";
import { getTenantsApi } from "../services/tenant.service";

export const useTenants = () => {
  const query = useQuery<ApiResponse<Tenant[]>, Error, Tenant[]>({
    queryKey: ["tenants"],
    queryFn: getTenantsApi,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });

  // Ekstrak kategori unik dari data tenant yang ada
  const categories = query.data
    ? Array.from(new Set(query.data.map((t) => t.category).filter(Boolean)))
    : [];

  return {
    ...query,
    tenants: query.data || [],
    categories, // Kategori unik sekarang tersedia di sini
  };
};
