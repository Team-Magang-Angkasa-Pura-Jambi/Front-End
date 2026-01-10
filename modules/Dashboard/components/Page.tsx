"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Droplet, Fuel, LucideIcon, Plane, Zap } from "lucide-react";

import { Header } from "./Header";
import { StatCard } from "./resourceConsumptionSummary/components/StatCard";
import { StatCardSkeleton } from "./resourceConsumptionSummary/components/statCardSkeleton";
import { TemperatureStatCard } from "./resourceConsumptionSummary/components/TemperatureStatCard";
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
import { NotificationStyle } from "./notificationStyle";
import { ResourceConsumptionSummary } from "./resourceConsumptionSummary";

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
            <NotificationStyle />
          </motion.div>

          <ResourceConsumptionSummary />

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
