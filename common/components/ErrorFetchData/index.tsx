"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "@/common/components/ui/button"; // Sesuaikan path button Anda

interface ErrorFetchDataProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean; // True jika digunakan di widget kecil (StatCard)
}

export const ErrorFetchData: React.FC<ErrorFetchDataProps> = ({
  title = "Gagal Memuat Data",
  message = "Terjadi kesalahan saat mengambil data terbaru.",
  onRetry,
  compact = false,
}) => {
  return (
    <div className="w-full h-full min-h-[150px] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col items-center text-center ${
          compact ? "gap-2" : "gap-4"
        } w-full`}
      >
        <div
          className={`relative flex items-center justify-center rounded-full bg-red-50 text-red-500 ${
            compact ? "w-10 h-10" : "w-16 h-16"
          }`}
        >
          {compact ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <WifiOff className="w-7 h-7" />
          )}

          {!compact && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-100 opacity-75"></span>
          )}
        </div>

        <div>
          <h4
            className={`font-semibold text-slate-800 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {title}
          </h4>
          {!compact && (
            <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto">
              {message}
            </p>
          )}
        </div>

        {onRetry && (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={onRetry}
            className={`border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors ${
              compact ? "h-7 text-[10px] px-3" : "h-9 text-xs"
            }`}
          >
            <RefreshCcw
              className={`mr-2 ${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`}
            />
            {compact ? "Retry" : "Coba Lagi"}
          </Button>
        )}
      </motion.div>
    </div>
  );
};
