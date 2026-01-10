"use client";

import React from "react";
import { motion } from "framer-motion";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/common/components/ui/button";

export const LoginRequired = () => {
  const router = useRouter();

  return (
    <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 text-center"
      >
        {/* Icon */}
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <LockKeyhole className="w-8 h-8 text-slate-600" />
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Akses Terbatas
        </h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Sesi Anda telah berakhir atau Anda belum memiliki izin untuk mengakses
          halaman ini. Silakan masuk kembali.
        </p>

        {/* Action */}
        <Button
          onClick={() => router.push("/auth/login")}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-lg group"
        >
          Halaman Login
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
};
