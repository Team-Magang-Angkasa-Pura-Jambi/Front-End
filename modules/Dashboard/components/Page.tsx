"use client";
import { motion } from "framer-motion";
import { NotificationCard } from "./NotificationCard";
import { StatCard } from "./StatCard";
import { AnalysisChart } from "./AnalysisChart";
import { Header } from "./Header";
import { Droplet, Fuel, Plane, Zap } from "lucide-react";
import { ActivityLog } from "./ActivityLog";
import { MachineLearningAnalysis } from "./MachineLearningAnalysis";
import { useQuery } from "@tanstack/react-query";
import { summaryApi } from "@/services/summary.service";
import React, { useMemo, useState } from "react";
import { StatCardSkeleton } from "./statCardSkeleton";

// Konfigurasi terpusat untuk setiap tipe stat
const statConfig = {
  Electricity: {
    icon: Zap,
    iconBgColor: "bg-yellow-500",
  },
  Water: {
    icon: Droplet,
    iconBgColor: "bg-sky-500",
  },
  Fuel: {
    icon: Fuel,
    iconBgColor: "bg-orange-500",
  },
};

export const Page = () => {
  const [thisMonth, setThisMonth] = useState(() => new Date());

  const year = String(thisMonth.getFullYear());
  const month = String(thisMonth.getMonth() + 1).padStart(2, "0");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardSummary", year, month],
    queryFn: () => summaryApi(year, month),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const processedStats = useMemo(() => {
    if (!data?.data) return [];
    const { summary, totalPax } = data.data;

    const energyStats = summary.map((item) => {
      const config =
        statConfig[item.energyType as keyof typeof statConfig] || {};
      return {
        icon: config.icon,
        label: item.energyType,
        value: (item.totalConsumption.currentValue ?? 0).toLocaleString(
          "id-ID"
        ),
        unit: item.unit,
        iconBgColor: config.iconBgColor,
        percentageChange: item.totalConsumption.percentageChange,
      };
    });

    const paxStat = {
      icon: Plane,
      label: "Pax",
      value: (totalPax?.currentValue ?? 0).toLocaleString("id-ID"),
      unit: "Orang",
      iconBgColor: "bg-red-500",
      percentageChange: totalPax?.percentageChange,
    };

    return [...energyStats, paxStat];
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (isError) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-500 mt-2">
            Tidak dapat memuat data dashboard. Silakan coba lagi nanti.
          </p>
          <pre className="mt-4 text-xs text-left bg-gray-100 p-2 rounded-md overflow-x-auto">
            {error?.message || "Unknown error"}
          </pre>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen space-y-6">
      <Header />
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <NotificationCard />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))
          : processedStats.map((stat) => (
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

      {/* ================================================================== */}
      {/* PERUBAHAN UTAMA: DARI LAYOUT 2 KOLOM MENJADI "BENTO GRID"           */}
      {/* ================================================================== */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6" // Menggunakan grid 3 kolom sebagai basis
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Item 1: Grafik Utama, dibuat lebih besar */}
        <motion.div
          className="lg:col-span-2 flex-col flex gap-2  "
          variants={itemVariants}
        >
          <AnalysisChart typeEnergy="Electricity" />
          <AnalysisChart typeEnergy="Water" />
        </motion.div>

        {/* Item 2: Analisis ML */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <MachineLearningAnalysis />
          <ActivityLog />
        </motion.div>

        {/* Item 3: Grafik Air */}
        {/* <motion.div variants={itemVariants} className="lg:col-span-2">
          <AnalysisChart typeEnergy="Water" />
        </motion.div> */}

        {/* Item 4: Grafik BBM */}

        {/* Item 5: Log Aktivitas */}
        {/* <motion.div variants={itemVariants}></motion.div> */}
      </motion.div>
    </main>
  );
};
