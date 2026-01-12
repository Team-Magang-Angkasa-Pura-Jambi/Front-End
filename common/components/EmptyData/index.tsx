"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Plus,
  RefreshCcw,
  SearchX,
  LucideIcon,
} from "lucide-react";
import { Button } from "../ui/button";

interface EmptyDataProps {
  title?: string;
  description?: string;
  icon?: LucideIcon; // Custom Icon
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean; // True untuk widget kecil/sempit
}

export const EmptyData: React.FC<EmptyDataProps> = ({
  title = "Data Tidak Tersedia",
  description = "Belum ada data yang terekam untuk periode ini.",
  icon: Icon = FolderOpen, // Default icon
  action,
  compact = false,
}) => {
  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 ${
        compact ? "min-h-[120px]" : "min-h-[300px]"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center max-w-[300px]"
      >
        {/* --- ICON CIRCLE --- */}
        <div
          className={`relative flex items-center justify-center rounded-full bg-white shadow-sm mb-3 ${
            compact ? "w-10 h-10" : "w-16 h-16"
          }`}
        >
          <Icon
            className={`text-slate-400 ${compact ? "w-5 h-5" : "w-7 h-7"}`}
          />
          {/* Decorative Dot */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
          </span>
        </div>

        {/* --- TEXT CONTENT --- */}
        <h3
          className={`font-semibold text-slate-700 ${
            compact ? "text-xs" : "text-base"
          }`}
        >
          {title}
        </h3>

        {!compact && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {description}
          </p>
        )}

        {/* --- OPTIONAL ACTION BUTTON --- */}
        {action && (
          <div className="mt-4">
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={action.onClick}
              className={`bg-white border-slate-200 hover:bg-slate-50 text-slate-700 ${
                compact ? "h-7 text-[10px] px-3" : ""
              }`}
            >
              {/* Cek label untuk kasih icon otomatis */}
              {action.label.toLowerCase().includes("refresh") ? (
                <RefreshCcw
                  className={`mr-2 ${compact ? "w-3 h-3" : "w-4 h-4"}`}
                />
              ) : action.label.toLowerCase().includes("tambah") ? (
                <Plus className={`mr-2 ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
              ) : null}
              {action.label}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
