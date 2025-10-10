import api from "@/lib/api";

interface TariffGroup {
  tariff_group_id: number;
  group_code: string;
  daya_va: number;
}

export const getTariffGroupsApi = async () => {
  const response = await api.get<{ data: TariffGroup[] }>("/tariff-groups");
  return response.data;
};
