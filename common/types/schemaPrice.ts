import { ReadingType } from "./readingTypes";
import { TariffGroup } from "./tariffGroup";

export type Rate = {
  rate_id: number;
  value: string;
  reading_type_id: number;
  reading_type?: ReadingType;
};

export type PriceSchemeType = {
  scheme_id: number;
  scheme_name: string;
  effective_date: string;
  is_active: boolean;
  tariff_group_id: number;
  tariff_group: TariffGroup;
  rates: Rate[];
  taxes?: TaxOnPrice[];
};
export type TaxOnPrice = {
  tax_id: number;
  tax_name: string;
  tax: {
    tax_id: number;
    tax_name: string;
    is_active: true;
    rate: number;
  };
};
