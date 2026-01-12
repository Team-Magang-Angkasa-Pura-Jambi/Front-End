"use client";
import { motion, Variants } from "framer-motion";
import { StatCardSkeleton } from "./components/statCardSkeleton";
import { TemperatureStatCard } from "./components/TemperatureStatCard";
import { useState } from "react";
import { StatCard } from "./components/StatCard";
import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { useResourceConsumptionSummary } from "../../hooks/useResourceConsumptionSummary";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export const ResourceConsumptionSummary = () => {
  const [selectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });

  const year = String(selectedDate.getFullYear());
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");

  const { error, isError, isLoading, processedStats, cardData } =
    useResourceConsumptionSummary(year, month);

  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      variants={containerVariants}
    >
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        : processedStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              layout
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
      {!isLoading && cardData?.data && (
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          layout
          className="sm:col-span-2 lg:col-span-1"
        >
          <TemperatureStatCard data={cardData.data} />
        </motion.div>
      )}
    </motion.div>
  );
};
