export interface Tariff {
  rate_id: number;
  reading_type_id: 1;
  type_name: string;
  label: string; // Contoh: "WBP"
  value: string; // Contoh: "1444.7"
  unit: string; // Contoh: "kWh"
}

export interface PriceSchemeType {
  id: number; // Sesuai JSON baru
  name: string;
  description?: string; // Opsional jika tidak dikirim di list
  effective_date: string;
  is_active: boolean;
  total_meters: number;
  meter_summary: string[];
  created_by: string;
  tariffs: Tariff[]; // Pengganti 'rates' yang nested
}

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
