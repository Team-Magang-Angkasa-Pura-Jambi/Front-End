export interface Notification {
  id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  createdAt: string; // ISO date string
}
