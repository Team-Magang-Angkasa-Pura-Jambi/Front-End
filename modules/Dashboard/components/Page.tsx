"use client";
import { motion } from "motion/react"; // <-- [FIX] Impor yang benar untuk varian animasi
import { NotificationCard } from "./NotificationCard";
import { StatCard } from "./StatCard";
import { AnalysisChart } from "./AnalysisChart";
import { Header } from "./Header";
import { Droplet, Fuel, Plane, Zap } from "lucide-react"; // <-- [FIX] Mengganti TicketsPlane dengan Plane
import { ActivityLog } from "./ActivityLog";
import { MachineLearningAnalysis } from "./MachineLearningAnalysis";

export const Page = () => {
  const stats = [
    {
      icon: Zap,
      label: "Electricity",
      value: "547",
      unit: "kWh",
      iconBgColor: "bg-yellow-500",
    },
    {
      icon: Droplet,
      label: "Water",
      value: "339",
      unit: "m³",
      iconBgColor: "bg-sky-500",
    },
    {
      icon: Fuel,
      label: "Fuel",
      value: "147",
      unit: "L",
      iconBgColor: "bg-orange-500",
    },
    {
      icon: Plane, // <-- [FIX] Menggunakan nama ikon yang benar
      label: "Pax",
      value: "92",
      unit: "Orang",
      iconBgColor: "bg-red-500",
    },
  ];

  // Varian animasi untuk container (mengatur stagger)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Varian animasi untuk item di dalam container
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    // [REFACTOR] Layout utama disederhanakan menjadi satu container <main>
    <main className="w-full min-h-screen p-6 md:p-8 space-y-6">
      <Header />

      {/* 1. Notifikasi */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.1 }} // Sedikit delay agar header muncul lebih dulu
      >
        <NotificationCard />
      </motion.div>

      {/* 2. Grid Statistik */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Grid Konten Utama (Analisis dan Log) */}
      {/* [REFACTOR] Grid utama dengan layout 1/3 dan 2/3 pada layar besar */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Kolom Kiri (1/3) */}
        <motion.div variants={itemVariants}>
          <MachineLearningAnalysis />
        </motion.div>

        {/* Kolom Kanan (2/3) - Dibuat menjadi container animasi sendiri */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          variants={containerVariants} // Gunakan containerVariants lagi untuk stagger di dalamnya
        >
          {/* Item di dalam kolom kanan akan muncul berurutan */}
          <motion.div variants={itemVariants}>
            <AnalysisChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ActivityLog />
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
};
