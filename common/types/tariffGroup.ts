import { PriceSchemeType } from "./schemaPrice";

export type TariffGroup = {
  tariff_group_id: number;
  group_code: string;
  group_name: string;
  description?: string | null;
  daya_va?: number | null;
  faktor_kali: number;
  price_schemes: PriceSchemeType[];
};
