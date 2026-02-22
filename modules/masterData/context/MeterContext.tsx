"use client";

import { createContext, ReactNode, useContext } from "react";
import { useMeterManagement } from "../hooks/useMeterManagement";

// 1. Ambil tipe data otomatis dari Hook yang sudah ada
type MeterContextType = ReturnType<typeof useMeterManagement>;

// 2. Inisialisasi Context
const MeterContext = createContext<MeterContextType | undefined>(undefined);

// 3. Buat Provider
export const MeterProvider = ({ children }: { children: ReactNode }) => {
  const meterLogic = useMeterManagement(); // Panggil hook utama di sini

  return <MeterContext.Provider value={meterLogic}>{children}</MeterContext.Provider>;
};

// 4. Buat Custom Hook untuk digunakan oleh Child
export const useMeter = () => {
  const context = useContext(MeterContext);
  if (context === undefined) {
    throw new Error("useMeter harus digunakan di dalam MeterProvider");
  }
  return context;
};
