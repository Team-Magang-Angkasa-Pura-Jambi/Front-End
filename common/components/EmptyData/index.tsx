"use client";

import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus, RefreshCcw, LucideIcon } from "lucide-react";
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
      className={`flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 ${
        compact ? "min-h-[120px]" : "min-h-[300px]"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex max-w-[300px] flex-col items-center text-center"
      >
        {/* --- ICON CIRCLE --- */}
        <div
          className={`relative mb-3 flex items-center justify-center rounded-full bg-white shadow-sm ${
            compact ? "h-10 w-10" : "h-16 w-16"
          }`}
        >
          <Icon
            className={`text-slate-400 ${compact ? "h-5 w-5" : "h-7 w-7"}`}
          />
          {/* Decorative Dot */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-slate-500"></span>
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
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
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
              className={`border-slate-200 bg-white text-slate-700 hover:bg-slate-50 ${
                compact ? "h-7 px-3 text-[10px]" : ""
              }`}
            >
              {/* Cek label untuk kasih icon otomatis */}
              {action.label.toLowerCase().includes("refresh") ? (
                <RefreshCcw
                  className={`mr-2 ${compact ? "h-3 w-3" : "h-4 w-4"}`}
                />
              ) : action.label.toLowerCase().includes("tambah") ? (
                <Plus className={`mr-2 ${compact ? "h-3 w-3" : "h-4 w-4"}`} />
              ) : null}
              {action.label}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
