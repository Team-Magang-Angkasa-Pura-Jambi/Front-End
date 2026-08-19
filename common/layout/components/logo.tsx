"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSidebar } from "@/common/components/ui/sidebar";

export const Logo = () => {
  const { open } = useSidebar();

  // Memisahkan teks untuk styling dual-tone
  // "Sentinel" = Bold & Primary Color
  // "Angkasa Pura" = Regular & Foreground
  const brandName = "Sentinel";
  const subBrand = "Angkasa Pura";

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.03, // Lebih cepat sedikit agar responsif
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.2 },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  return (
    <Link
      href="/"
      className="group relative z-20 flex w-full items-center space-x-3 overflow-hidden py-1"
    >
      {/* --- LOGO ICON WITH TECH GLOW --- */}
      <div className="relative flex-shrink-0">
        <div className="bg-primary/20 absolute inset-0 scale-0 rounded-full blur-md transition-transform duration-500 group-hover:scale-125" />
        <Image
          src="/image/logo.png" // Pastikan path ini benar sesuai folder public Anda
          alt="Sentinel Logo"
          width={32}
          height={32}
          priority
          className="relative h-8 w-8 object-contain transition-transform group-hover:scale-105 dark:brightness-0 dark:invert"
        />
      </div>

      {/* --- ANIMATED TEXT --- */}
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col justify-center whitespace-nowrap leading-none"
          >
            {/* Baris 1: SENTINEL (Primary & Bold) */}
            <div className="text-primary flex overflow-hidden text-sm font-black uppercase tracking-wide">
              {brandName.split("").map((char, index) => (
                <motion.span key={`brand-${index}`} variants={letterVariants}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>

            {/* Baris 2: Angkasa Pura (Muted & Small) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
              className="text-muted-foreground mt-0.5 text-[10px] font-medium uppercase tracking-widest"
            >
              {subBrand}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
};
