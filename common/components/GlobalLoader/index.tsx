"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Radio, Server, Zap } from "lucide-react";
import { loadingMessages } from "./constants";

export const GlobalLoader = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-32 h-32 border-t-2 border-r-2 border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute w-24 h-24 border-b-2 border-l-2 border-emerald-500 rounded-full opacity-70"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="relative z-10 bg-slate-900 p-4 rounded-full border border-slate-800 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Plane className="w-8 h-8 text-blue-400 fill-blue-400/20" />
        </motion.div>
      </div>

      <div className="mt-8 h-8 flex flex-col items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-mono text-blue-300 tracking-wider"
          >
            {loadingMessages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-4 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
