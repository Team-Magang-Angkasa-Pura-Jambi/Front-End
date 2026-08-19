// Interface untuk Tenant
export interface Tenant {
  tenant_id: number;
  name: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
}

// Interface untuk Location
