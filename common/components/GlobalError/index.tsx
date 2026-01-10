"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RefreshCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";
import { Button } from "@/common/components/ui/button"; // Sesuaikan path button shadcn/ui Anda

interface GlobalErrorProps {
  error?: Error | string; // Bisa object Error atau string biasa
  reset?: () => void; // Fungsi untuk mencoba lagi (retry)
  title?: string;
  description?: string;
  isFullPage?: boolean; // Jika true, ambil satu layar penuh. Jika false, ambil container parent.
}

export const GlobalError: React.FC<GlobalErrorProps> = ({
  error,
  reset,
  title = "Terjadi Kesalahan Sistem",
  description = "Kami mendeteksi kendala saat memproses permintaan Anda.",
  isFullPage = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const errorMessage =
    typeof error === "string" ? error : error?.message || "Unknown Error";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 ${
        isFullPage
          ? "fixed inset-0 z-50 bg-slate-50/90 backdrop-blur-sm"
          : "w-full h-full min-h-[300px] bg-slate-50 rounded-xl border border-dashed border-slate-300"
      }`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* --- ICON SECTION --- */}
        <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center">
          {/* Pulsing Background */}
          <motion.div
            className="absolute inset-0 bg-red-100 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative bg-white p-4 rounded-full shadow-lg border border-red-100">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* --- TEXT SECTION --- */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {description}
          <br />
          <span className="text-xs opacity-70">
            Silakan coba muat ulang atau hubungi tim IT jika masalah berlanjut.
          </span>
        </p>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          {reset && (
            <Button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCcw className="w-4 h-4" />
              Coba Lagi
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Button>
        </div>

        {/* --- TECHNICAL DETAILS (TOGGLE) --- */}
        {errorMessage && (
          <div className="w-full">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-600 transition-colors mx-auto mb-2"
            >
              {showDetails ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {showDetails
                ? "Sembunyikan Detail Teknis"
                : "Lihat Detail Teknis"}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-900 text-red-300 p-4 rounded-lg text-left text-[10px] font-mono shadow-inner border border-slate-800 overflow-auto max-h-40">
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                      <Terminal className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500 font-bold uppercase">
                        System Stack Trace
                      </span>
                    </div>
                    <code>{errorMessage}</code>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
