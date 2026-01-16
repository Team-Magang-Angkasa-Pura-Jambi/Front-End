"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ComponentLoaderProps {
  text?: string;
  className?: string;
}

export const ComponentLoader = ({
  text = "Memuat data...",
  className,
}: ComponentLoaderProps) => {
  return (
    <div
      className={`relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white/50 p-8 shadow-sm ${className}`}
    >
      {/* Background Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Icon Animation */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full bg-blue-50 p-3 text-blue-600"
        >
          <Loader2 className="h-6 w-6" />
        </motion.div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-slate-700">{text}</p>
          <p className="text-xs text-slate-400">Mohon tunggu sebentar</p>
        </div>
      </div>

      {/* Decorative Dots */}
      <div className="mt-4 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-blue-400"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2, // Stagger effect
            }}
          />
        ))}
      </div>
    </div>
  );
};
