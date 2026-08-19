export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditUser {
  full_name: string;
  username: string;
}

export interface AuditLog<T = Record<string, unknown>> {
  log_id: number;
  user_id: number;
  action: AuditAction;
  entity_table: string;
  entity_id: string;
  old_values: T | null;
  new_values: T | null;
  reason: string | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: AuditUser;
}
