// types/user.ts
export type Role = {
  role_name: string;
  role_id: number;
};

export type AuditLog = {
  log_id: number;
  user_id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity_table: string;
  entity_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  // Kita buat partial karena bisa null
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
};

export type UserProfileData = {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  role: Role;
  audit_logs: AuditLog[];
};

export type UserResponse = {
  status: { code: number; message: string };
  data: UserProfileData;
};
