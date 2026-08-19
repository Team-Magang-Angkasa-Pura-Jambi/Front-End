"use client";

import React from "react";
import { motion } from "framer-motion";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/common/components/ui/button";

export const LoginRequired = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center bg-slate-50/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl"
      >
        {/* Icon */}
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <LockKeyhole className="h-8 w-8 text-slate-600" />
          <span className="absolute right-0 top-0 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500"></span>
          </span>
        </div>

        {/* Text */}
        <h2 className="mb-2 text-xl font-bold text-slate-800">
          Akses Terbatas
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-slate-500">
          Sesi Anda telah berakhir atau Anda belum memiliki izin untuk mengakses
          halaman ini. Silakan masuk kembali.
        </p>

        {/* Action */}
        <Button
          onClick={() => router.push("/auth/login")}
          className="group h-11 w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          Halaman Login
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </div>
  );
};
