import { TariffGroup } from "./tariffGroup";

export type Taxes = {
  tax_id: number;
  tax_name: string;
  rate: number;
  is_active: boolean;
  price_scheme: TariffGroup[];
};
