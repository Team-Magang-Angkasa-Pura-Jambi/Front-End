export type User = {
  user_id: number;
  username: string;
  role: {
    role_id: number;
    role_name: string;
  };
  photo_profile_url?: string;
  is_active: boolean;
  created_at: string; // ISO string date
};
