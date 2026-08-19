"use client";

import { ErrorFetchData } from "@/common/components/ErrorFetchData";
import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { useResourceConsumptionSummary } from "../../hooks/useResourceConsumptionSummary";
import { StatCard } from "./components/StatCard";
import { StatCardSkeleton } from "./components/statCardSkeleton";
import { TemperatureStatCard } from "./components/TemperatureStatCard";

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
  const [selectedDate] = useState<Date>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const { error, isError, isLoading, processedStats, cardData } = useResourceConsumptionSummary(
    year,
    month
  );

  if (isError) {
    return <ErrorFetchData message={error?.message} />;
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={`skeleton-${i}`} variants={itemVariants}>
            <StatCardSkeleton />
          </motion.div>
        ))
      ) : (
        <>
          {processedStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              layout
              initial="hidden"
              animate="visible"
            >
              <StatCard {...stat} />
            </motion.div>
          ))}

          {cardData?.data?.overview_metrics.weather &&
            (cardData?.data?.overview_metrics as any)?.card_config?.weather?.show !== false && (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              layout
              className="sm:col-span-2 lg:col-span-1"
              initial="hidden"
              animate="visible"
            >
              <TemperatureStatCard data={cardData.data} />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};
