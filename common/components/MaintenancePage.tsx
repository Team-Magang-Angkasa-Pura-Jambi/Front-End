"use client";

import React from "react";
import { Settings, Wrench } from "lucide-react";
import { motion } from "framer-motion";

export const MaintenancePage = () => {
  return (
    <div className="min-h-full flex-1 flex items-center justify-center p-6 relative overflow-hidden h-[80vh]">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-xl w-full flex flex-col items-center text-center p-12 rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex gap-4 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Settings className="w-16 h-16 text-emerald-500" />
          </motion.div>
          <motion.div
            animate={{ rotate: [-20, 20, -20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wrench className="w-16 h-16 text-cyan-500" />
          </motion.div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6 pb-2">
          Dalam Perbaikan
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
          Halaman atau fitur ini sedang dalam proses pemeliharaan berkala untuk meningkatkan performa dan stabilitas. Silakan kembali beberapa saat lagi.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Estimasi selesai: Segera
        </div>
      </motion.div>
    </div>
  );
};
