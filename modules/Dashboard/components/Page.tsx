"use client";

import { useRealtimeNotification } from "@/modules/Dashboard/hooks/useRealtimeNotification";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getDashboardCardConfigApi } from "@/modules/Dashboard/service/visualizations.service";
import { EnergyPaxCorrelationCard } from "./EnergyPaxCorrelationCard";
import { Header } from "./Header";
import { WelcomeBriefing } from "./WelcomeBriefing";
import { AnalysisChart } from "./analysisChart";
import { AnalysisYearlyChart } from "./analysisYearlyChart";
import { FuelRefillAnalysis } from "./fuelRefillAnalysis/fuelRefillAnalysis";
import { ModernEfficiencyDashboard } from "./modernEfficiencyDashboard";
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

  const { data: configResponse } = useQuery({
    queryKey: ["dashboardCardConfig"],
    queryFn: getDashboardCardConfigApi,
    staleTime: 1000 * 60 * 5,
  });

  const visualConfig = configResponse?.data?.config as any;

  const showHeatmap = visualConfig?.yearly_heatmap?.show !== false;
  const showTrend = visualConfig?.trend_analysis?.show !== false;
  const showFuel = visualConfig?.fuel_logistics?.show !== false;
  const showSpending = visualConfig?.yearly_spending?.show !== false;
  const showPax = visualConfig?.pax_correlation?.show !== false;

  const isMiddleRowVisible = showHeatmap || showTrend || showFuel;
  const isBottomRowVisible = showSpending || showPax;

  return (
    <main className="min-h-screen w-full space-y-8 p-1 pb-20">
      <Header />
      <WelcomeBriefing />
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <ResourceConsumptionSummary />

          {isMiddleRowVisible && (
            <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3">
              {showHeatmap && (
                <motion.div variants={itemVariants}>
                  <ModernEfficiencyDashboard />
                </motion.div>
              )}
              {showTrend && (
                <motion.div variants={itemVariants}>
                  <AnalysisChart />
                </motion.div>
              )}
              {showFuel && (
                <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
                  <FuelRefillAnalysis />
                </motion.div>
              )}
            </div>
          )}

          {isBottomRowVisible && (
            <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
              {showSpending && (
                <motion.div variants={itemVariants} className="w-full">
                  <AnalysisYearlyChart />
                </motion.div>
              )}
              {showPax && (
                <motion.div variants={itemVariants}>
                  <EnergyPaxCorrelationCard />
                </motion.div>
              )}
            </div>
          )}

          <motion.footer variants={itemVariants} className="py-10 text-center opacity-40">
            <p className="font-mono text-[10px] tracking-widest uppercase italic">
              Airport Operational Intelligence Dashboard
            </p>
          </motion.footer>
        </motion.div>
      </AnimatePresence>
    </main>
  );
};
