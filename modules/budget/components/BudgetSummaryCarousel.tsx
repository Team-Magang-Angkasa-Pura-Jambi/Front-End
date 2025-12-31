import { AnimatePresence } from "motion/react";
import { BudgetSummaryCard } from "./BudgetSummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getBudgetSummaryApi } from "@/services/analysis.service";
import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { DollarSign, Landmark, TrendingDown, TrendingUp } from "lucide-react";
export const BudgetSummaryCarousel = () => {
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ["budgetSummary"],
    queryFn: getBudgetSummaryApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    if (!summaryData) return;
    setCurrentIndex((prev) => (prev + 1) % summaryData.length);
  }, [summaryData]);

  useEffect(() => {
    if (!summaryData || summaryData.length <= 1) return;
    const interval = setInterval(handleNext, 15000); // Ganti kartu setiap 5 detik
    return () => clearInterval(interval);
  }, [summaryData, handleNext]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
      </div>
    );
  }

  if (!summaryData || summaryData.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        Tidak ada ringkasan budget.
      </div>
    );
  }

  const currentItem = summaryData[currentIndex];
  const budget = currentItem.currentPeriod;

  const cardVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <BudgetSummaryCard
            title={`Alokasi ${currentItem.energyTypeName}`}
            value={formatCurrency(budget?.totalBudget || 0)}
            description={`Tahun Anggaran ${new Date(
              budget?.periodStart || Date.now()
            ).getFullYear()}`}
            icon={Landmark}
          />
          <BudgetSummaryCard
            title={`Realisasi ${currentItem.energyTypeName}`}
            value={formatCurrency(budget?.totalRealization || 0)}
            description="Anggaran yang sudah digunakan"
            icon={DollarSign}
          />
          <BudgetSummaryCard
            title={`Sisa Budget ${currentItem.energyTypeName}`}
            value={formatCurrency(budget?.remainingBudget || 0)}
            description={
              budget?.remainingBudget >= 0
                ? "Masih ada sisa budget"
                : "Melebihi alokasi budget"
            }
            icon={budget?.remainingBudget >= 0 ? TrendingUp : TrendingDown}
          />
          <BudgetSummaryCard
            title={`Persentase Realisasi ${currentItem.energyTypeName}`}
            value={`${(budget?.realizationPercentage || 0).toFixed(2)}%`}
            description="Dari total alokasi budget"
            icon={
              budget?.realizationPercentage > 100 ? TrendingDown : TrendingUp
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
