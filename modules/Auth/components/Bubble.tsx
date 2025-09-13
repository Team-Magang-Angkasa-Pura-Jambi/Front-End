import React from "react";
import { motion } from "framer-motion";

// Komponen untuk ilustrasi di sisi kanan (TIDAK BERUBAH)

// Komponen gelembung (bubble)
export const Bubble = ({ size, style, delay }) => {
  // Menghasilkan nilai random untuk gerakan horizontal
  const randomX = (Math.random() - 0.5) * 60; // Gerakan horizontal antara -30px dan +30px

  return (
    <motion.div
      className="absolute rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
      style={{ width: size, height: size, ...style }}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: 1,
        y: -120, // Bergerak lebih jauh ke atas
        x: [0, randomX / 2, randomX], // Menambahkan gerakan menyamping yang random
      }}
      transition={{
        duration: 5 + Math.random() * 6, // Durasi lebih bervariasi
        delay: delay,
        ease: "easeOut",
        repeat: Infinity,
        repeatDelay: Math.random() * 4,
      }}
    />
  );
};
