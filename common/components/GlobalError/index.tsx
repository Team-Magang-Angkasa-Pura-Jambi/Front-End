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
      className={`flex flex-col items-center justify-center p-6 text-center ${
        isFullPage
          ? "fixed inset-0 z-50 bg-slate-50/90 backdrop-blur-sm"
          : "h-full min-h-[300px] w-full rounded-xl border border-dashed border-slate-300 bg-slate-50"
      }`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* --- ICON SECTION --- */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          {/* Pulsing Background */}
          <motion.div
            className="absolute inset-0 rounded-full bg-red-100"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative rounded-full border border-red-100 bg-white p-4 shadow-lg">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* --- TEXT SECTION --- */}
        <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          {description}
          <br />
          <span className="text-xs opacity-70">
            Silakan coba muat ulang atau hubungi tim IT jika masalah berlanjut.
          </span>
        </p>

        {/* --- ACTION BUTTONS --- */}
        <div className="mb-6 flex flex-col justify-center gap-3 sm:flex-row">
          {reset && (
            <Button
              onClick={reset}
              className="gap-2 bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              <RefreshCcw className="h-4 w-4" />
              Coba Lagi
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            Ke Beranda
          </Button>
        </div>

        {/* --- TECHNICAL DETAILS (TOGGLE) --- */}
        {errorMessage && (
          <div className="w-full">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mx-auto mb-2 flex items-center justify-center gap-2 font-mono text-xs text-slate-400 transition-colors hover:text-slate-600"
            >
              {showDetails ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
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
                  <div className="max-h-40 overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-4 text-left font-mono text-[10px] text-red-300 shadow-inner">
                    <div className="mb-2 flex items-center gap-2 border-b border-slate-700 pb-2">
                      <Terminal className="h-3 w-3 text-slate-500" />
                      <span className="font-bold uppercase text-slate-500">
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
