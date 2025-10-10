// src/socket-types.ts

// Tipe untuk membedakan meteran
export type MeterType = "LISTRIK" | "AIR";

// "Isi amplop" atau data notifikasi yang akan dikirim
export interface MissingDataPayload {
  meterType: MeterType;
  message: string;
  missingDate: string;
}

// Daftar "surat" atau event yang bisa dikirim SERVER ke CLIENT
export interface ServerToClientEvents {
  data_reminder: (payload: MissingDataPayload) => void;
  new_notification: (payload: NotificationPayload) => void;
  new_notification_available: () => void;
}

export interface ClientToServerEvents {
  join_room: (userId: string) => void; // <-- TAMBAHKAN INI
}
export interface NotificationPayload {
  title: string;
  message: string;
  link?: string;
}
