export interface Taxes {
  tax_id: number;
  tax_name: string;
  rate: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
