"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Droplet, Fuel, LucideIcon, Plane, Zap } from "lucide-react";

import { Header } from "./Header";
import { StatCard } from "./StatCard";
import { StatCardSkeleton } from "./statCardSkeleton";
import { TemperatureStatCard } from "./TemperatureStatCard";
import { AnalysisChart } from "./AnalysisChart";
import { DailyAnalysisLog } from "./DailyAnalysisLog";
import { ClassificationSummaryChart } from "./ClassificationSummaryChart";
import { AnalysisYearlyChart } from "./analysisYearlyChart";
import { UnifiedEnergyComparisonChart } from "./dayTypeComparisonChart";
import { ModernEfficiencyDashboard } from "./modernEfficiencyDashboard";
import { MeterEfficiencyRanking } from "./meterEfficiencyRanking";
import { DailyAveragePaxChart } from "./dailyAveragePaxChart";
import { FuelRefillAnalysis } from "./fuelRefillAnalysis";
import { EfficiencyRatioChart } from "./efficiencyRatioChart";
import { BudgetBurnRateChart } from "./budgetBurnRateChart";
import { ModernBudgetAnalysis } from "./modernBudgetAnalysis";
import { useRealtimeNotification } from "@/hooks/useRealtimeNotification";
import { MultiEnergyForecastCard } from "./energyForecastCard";
import { summaryApi } from "@/services/summary.service";
import { ResourceConsumptionSummary } from "./ResourceConsumptionSummary/index.tsx";

const statConfig: Record<string, { icon: LucideIcon; iconBgColor: string }> = {
  Electricity: { icon: Zap, iconBgColor: "bg-yellow-500" },
  Water: { icon: Droplet, iconBgColor: "bg-sky-500" },
  Fuel: { icon: Fuel, iconBgColor: "bg-orange-500" },
};

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

export const Page = () => {
  useRealtimeNotification();
  const [selectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });

  const year = String(selectedDate.getFullYear());
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");

  const {
    data: cardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboardSummary", year, month],
    queryFn: () => summaryApi(year, month),
    staleTime: 1000 * 60 * 5,
  });

  const processedStats = useMemo(() => {
    if (!cardData?.data) return [];
    const { summary, totalPax } = cardData.data;

    const energyStats =
      summary?.map((item) => {
        const config = statConfig[item.energyType] || {
          icon: Zap,
          iconBgColor: "bg-gray-500",
        };
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
      }) || [];

    return [
      ...energyStats,
      {
        icon: Plane,
        label: "Pax",
        value: (totalPax?.currentValue ?? 0).toLocaleString("id-ID"),
        unit: "Orang",
        iconBgColor: "bg-red-500",
        percentageChange: totalPax?.percentageChange,
      },
    ];
  }, [cardData]);

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-600 font-medium">
          Error: {error?.message || "Gagal memuat data dashboard"}
        </div>
      </div>
    );

  return (
    <main className="w-full min-h-screen p-1 space-y-8 pb-20">
      <Header />

      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} layout>
            <ResourceConsumptionSummary />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            variants={containerVariants}
          >
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
              <div className="flex-1 min-h-0">
                <MeterEfficiencyRanking />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-6">
              <div className="min-h-0">
                <ModernEfficiencyDashboard />
              </div>
              <div className="min-h-0">
                <MultiEnergyForecastCard />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ModernBudgetAnalysis />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="w-full">
              <AnalysisYearlyChart />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <EfficiencyRatioChart />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <AnalysisChart />
            </motion.div>
            <motion.div variants={itemVariants}>
              <UnifiedEnergyComparisonChart />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <DailyAveragePaxChart />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <BudgetBurnRateChart />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <FuelRefillAnalysis />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
              <DailyAnalysisLog />
            </motion.div>
          </div>

          <motion.footer
            variants={itemVariants}
            className="text-center py-10 opacity-40"
          >
            <p className="text-[10px] font-mono tracking-widest uppercase italic">
              Airport Operational Intelligence Dashboard
            </p>
          </motion.footer>
        </motion.div>
      </AnimatePresence>
    </main>
  );
};
