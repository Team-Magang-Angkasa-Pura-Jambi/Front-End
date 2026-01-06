export type ActivityTypeLabel =
  | "Pencatatan Meter"
  | "Pengaturan Harga"
  | "Pengaturan Target";

export interface ActivityHistoryItem {
  id: number;
  type: ActivityTypeLabel;
  timestamp: string;
  description: string;
}

export interface UserWithActivityResponse {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
  photo_profile_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  history: ActivityHistoryItem[];
}
