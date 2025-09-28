"use client";
import { motion } from "framer-motion"; // Impor yang lebih umum untuk varian
import { NotificationCard } from "./NotificationCard";
import { StatCard } from "./StatCard";
import { AnalysisChart } from "./AnalysisChart";
import { Header } from "./Header";
import { Droplet, Fuel, Plane, Zap } from "lucide-react";
import { ActivityLog } from "./ActivityLog";
import { MachineLearningAnalysis } from "./MachineLearningAnalysis";
import { useQuery } from "@tanstack/react-query";
import { summaryApi } from "@/services/summary.service";
import { useMemo, useState } from "react";
import { StatCardSkeleton } from "./statCardSkeleton";

export const Page = () => {
  const [thisMonth, setThisMonth] = useState(() => new Date());

  const year = String(thisMonth.getFullYear());
  const month = String(thisMonth.getMonth() + 1).padStart(2, "0");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => summaryApi(year, month),
  });

  // [FIX] Memproses data API dengan benar
  const processedStats = useMemo(() => {
    // Jika tidak ada data, kembalikan array kosong untuk mencegah error
    if (!data?.data?.summary) return [];

    // Ambil array summary dari respons API
    const summaryArray = data.data.summary;

    // Cari data untuk setiap tipe energi di dalam array
    const electricityData = summaryArray.find(
      (item) => item.energyType === "Electricity"
    );
    const waterData = summaryArray.find((item) => item.energyType === "Water");
    const fuelData = summaryArray.find((item) => item.energyType === "Fuel");
    const dataPax = data?.data?.totalPax; // Asumsi "Fuel" ada di API

    return [
      {
        icon: Zap,
        label: "Electricity",
        // Gunakan optional chaining (?.) dan fallback (?? 0) jika data tidak ada
        value: (electricityData?.totalConsumption ?? 0).toLocaleString("id-ID"),
        unit: electricityData?.unit ?? "N/A",
        iconBgColor: "bg-yellow-500",
      },
      {
        icon: Droplet,
        label: "Water",
        value: (waterData?.totalConsumption ?? 0).toLocaleString("id-ID"),
        unit: waterData?.unit ?? "N/A",
        iconBgColor: "bg-sky-500",
      },
      {
        icon: Fuel,
        label: "Fuel",
        value: (fuelData?.totalConsumption ?? 0).toLocaleString("id-ID"),
        unit: fuelData?.unit ?? "N/A",
        iconBgColor: "bg-orange-500",
      },
      {
        icon: Plane,
        label: "Pax",
        value: dataPax, // Data Pax tetap dummy sesuai kode awal
        unit: "Orang",
        iconBgColor: "bg-red-500",
      },
    ];
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

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
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <MachineLearningAnalysis />
        </motion.div>
        <motion.div
          className="lg:col-span-2 space-y-6"
          variants={containerVariants}
        >
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
