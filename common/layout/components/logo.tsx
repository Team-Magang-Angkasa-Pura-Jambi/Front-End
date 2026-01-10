"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSidebar } from "@/common/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
      className="relative z-20 flex items-center space-x-3 py-1 w-full overflow-hidden group"
    >
      {/* --- LOGO ICON WITH TECH GLOW --- */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full scale-0 group-hover:scale-125 transition-transform duration-500" />
        <Image
          src="/image/logo.png" // Pastikan path ini benar sesuai folder public Anda
          alt="Sentinel Logo"
          width={32}
          height={32}
          priority
          className="relative h-8 w-8 object-contain dark:brightness-0 dark:invert transition-transform group-hover:scale-105"
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
            className="flex flex-col justify-center leading-none whitespace-nowrap"
          >
            {/* Baris 1: SENTINEL (Primary & Bold) */}
            <div className="flex overflow-hidden text-sm font-black tracking-wide text-primary uppercase">
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
              className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase mt-0.5"
            >
              {subBrand}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
};
