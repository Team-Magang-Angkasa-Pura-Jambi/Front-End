// providers/SocketProvider.tsx
"use client";

import { useSocketListeners } from "@/hooks/useSocket";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export const SocketProvider = () => {
  // Panggil hook utama untuk mendaftarkan semua listener global.
  useSocketListeners();

  useEffect(() => {
    // Komponen ini hanya bertanggung jawab untuk membuka dan menutup koneksi.
    socket.connect();
    console.log("Socket connection initiated by SocketProvider.");
    return () => {
      socket.disconnect();
      console.log("Socket disconnected by SocketProvider.");
    };
  }, []);

  return null; // Komponen ini tidak merender UI apa pun.
};
