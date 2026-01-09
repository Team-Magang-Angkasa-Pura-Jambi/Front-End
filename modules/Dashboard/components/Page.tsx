"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Droplet, Fuel, Plane, Zap } from "lucide-react";

// Components & Services
import { Header } from "./Header";
import { StatCard } from "./StatCard";
import { StatCardSkeleton } from "./statCardSkeleton";
import { NotificationCard } from "./NotificationCard";
import { TemperatureStatCard } from "./TemperatureStatCard";
import { AnalysisChart } from "./AnalysisChart";
import { DailyAnalysisLog } from "./DailyAnalysisLog";
import { EnergyDistributionChart } from "./EnergyDistributionChart";
import { ClassificationSummaryChart } from "./ClassificationSummaryChart";
import { AnalysisYearlyChart } from "./analysisYearlyChart";
import { UnifiedEnergyComparisonChart } from "./dayTypeComparisonChart";
import { ModernEfficiencyDashboard } from "./modernEfficiencyDashboard";
import { MeterEfficiencyRanking } from "./meterEfficiencyRanking";
import { ToggleConsumptionCostChart } from "./toggleConsumptionCostChart";
import { DailyAveragePaxChart } from "./dailyAveragePaxChart";
import { FuelRefillAnalysis } from "./fuelRefillAnalysis";
import { EfficiencyRatioChart } from "./efficiencyRatioChart";
import { BudgetBurnRateChart } from "./budgetBurnRateChart";
import { MLDailyDashboard } from "./mlInsightsDashboard";
import { ModernBudgetAnalysis } from "./modernBudgetAnalysis";
import { summaryApi } from "@/services/summary.service";
import { useRealtimeNotification } from "@/hooks/useRealtimeNotification";
import { MultiEnergyForecastCard } from "./energyForecastCard";

const statConfig = {
  Electricity: { icon: Zap, iconBgColor: "bg-yellow-500" },
  Water: { icon: Droplet, iconBgColor: "bg-sky-500" },
  Fuel: { icon: Fuel, iconBgColor: "bg-orange-500" },
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardSummary", year, month],
    queryFn: () => summaryApi(year, month),
    staleTime: 1000 * 60 * 5,
  });

  const energyDistributionData = useMemo(
    () => data?.data?.summary || [],
    [data]
  );

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
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (isError)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error: {error?.message}
      </div>
    );

  return (
    <main className="w-full min-h-screen  p-1 space-y-12">
      <Header />

      <div className="space-y-6 ">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <NotificationCard />
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5  gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : processedStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <StatCard {...stat} />
                </motion.div>
              ))}
          {!isLoading && data?.data && (
            <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
              <TemperatureStatCard data={data.data} />
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2  ">
        <motion.div
          className="col-span-12 lg:col-span-4  "
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className=" flex flex-col gap-3 ">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 min-h-0 "
            >
              <MeterEfficiencyRanking />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="col-span-12 lg:col-span-4 flex flex-col gap-2  "
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className=" flex flex-col gap-3 ">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="min-h-0"
            >
              <ModernEfficiencyDashboard />
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="min-h-0"
            >
              <MultiEnergyForecastCard />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="col-span-12 lg:col-span-4   "
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <ModernBudgetAnalysis />
        </motion.div>
      </div>

      {/* --- LAYER 3: CORE OPERATIONAL TRENDS (FULL WIDTH & DISTRIBUTION) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="lg:col-span-1"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <AnalysisYearlyChart />
        </motion.div>
        <motion.div
          className="lg:col-span-1 flex flex-col gap-6"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <EfficiencyRatioChart />
        </motion.div>
      </div>

      {/* --- LAYER 4: DETAILED CONSUMPTION (2 COLUMN GRID) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 gap-6">
            <AnalysisChart />
            {/* <AnalysisChart typeEnergy="Water" /> */}
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <UnifiedEnergyComparisonChart />
        </motion.div>
      </div>

      {/* --- LAYER 6: LOGISTICS & AUXILIARY DATA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <DailyAveragePaxChart />
        </motion.div>
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <BudgetBurnRateChart />
        </motion.div>
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <FuelRefillAnalysis />
        </motion.div>
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <DailyAnalysisLog />
        </motion.div>
      </div>

      {/* --- LAYER 7: STRATEGIC FINANCIALS (FULL WIDTH) --- */}

      <footer className="text-center py-10 opacity-40">
        <p className="text-[10px] font-mono tracking-widest uppercase italic">
          Airport Operational Intelligence Dashboard // v3.1.0
        </p>
      </footer>
    </main>
  );
};
