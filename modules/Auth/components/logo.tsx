import { motion, Variants } from "framer-motion";
import Image from "next/image";

// 1. Definisi Animasi (Variants)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay 0.2 detik antar elemen
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 }, // Muncul dari bawah sedikit
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

export const HeaderLogo = () => {
  return (
    <motion.div
      variants={containerVariants} // Assign variant parent
      initial="hidden"
      animate="visible"
      className="flex h-24 w-full items-center justify-center gap-2"
    >
      {/* --- LOGO 1 --- */}
      <motion.div variants={itemVariants} className="relative h-full flex-1">
        <Image
          src="/image/logo.png"
          alt="Logo Utama"
          fill
          className="object-contain object-left"
          sizes="(max-width: 768px) 30vw, 20vw"
          priority // Logo utama sebaiknya diprioritaskan load-nya
        />
      </motion.div>

      {/* --- LOGO 2 --- */}
      <motion.div variants={itemVariants} className="relative h-3/4 flex-1">
        <Image
          src="/image/logo-angkasa-pura.jpeg"
          alt="Logo Partner"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 30vw, 20vw"
        />
      </motion.div>

      {/* --- TEKS --- */}
      {/* Perbaikan: flex-2 diganti flex-[2] agar valid Tailwind */}
      <motion.div
        variants={itemVariants}
        className="relative flex flex-2 flex-col items-end justify-center text-right"
      >
        <h1 className="text-sm leading-tight font-bold text-yellow-400">
          Sultan Thaha Jambi
        </h1>
        <h2 className="text-sm font-medium tracking-wide text-gray-500">
          Airport
        </h2>
      </motion.div>
    </motion.div>
  );
};
