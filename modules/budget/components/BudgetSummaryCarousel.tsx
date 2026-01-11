import React, { useCallback, useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DollarSign, Landmark, TrendingDown, TrendingUp } from "lucide-react";

import { BudgetSummaryCard } from "./BudgetSummaryCard";
import { Skeleton } from "@/common/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatCurrency";

interface BudgetSummaryItem {
  energyTypeName: string;
  currentPeriod: {
    totalBudget: number;
    totalRealization: number;
    remainingBudget: number;
    realizationPercentage: number;
    periodStart: string | Date;
  };
}

interface BudgetSummaryCarouselProps {
  data: BudgetSummaryItem[];
  isLoading: boolean;
  selectedEnergyType: string;
}

export const BudgetSummaryCarousel = ({
  data,
  isLoading,
  selectedEnergyType,
}: BudgetSummaryCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedEnergyType === "all") return data;

    return data.filter((item) => item.energyTypeName === selectedEnergyType);
  }, [data, selectedEnergyType]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedEnergyType]);

  const handleNext = useCallback(() => {
    if (!filteredData || filteredData.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % filteredData.length);
  }, [filteredData]);

  useEffect(() => {
    if (filteredData.length <= 1) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [filteredData, handleNext]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[126px] w-full" />
        ))}
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[126px] items-center justify-center rounded-lg border border-dashed">
        Data ringkasan tidak ditemukan untuk filter ini.
      </div>
    );
  }

  const currentItem = filteredData[currentIndex];
  const budget = currentItem?.currentPeriod;

  const cardVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (!budget) return null;

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.energyTypeName}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Card 1: Alokasi */}
          <BudgetSummaryCard
            title={`Alokasi ${currentItem.energyTypeName}`}
            value={formatCurrency(budget.totalBudget || 0)}
            description={`Tahun Anggaran ${new Date(
              budget.periodStart || Date.now()
            ).getFullYear()}`}
            icon={Landmark}
          />

          {/* Card 2: Realisasi */}
          <BudgetSummaryCard
            title={`Realisasi ${currentItem.energyTypeName}`}
            value={formatCurrency(budget.totalRealization || 0)}
            description="Anggaran yang sudah digunakan"
            icon={DollarSign}
          />

          {/* Card 3: Sisa */}
          <BudgetSummaryCard
            title={`Sisa Budget ${currentItem.energyTypeName}`}
            value={formatCurrency(budget.remainingBudget || 0)}
            description={
              budget.remainingBudget >= 0
                ? "Masih ada sisa budget"
                : "Melebihi alokasi budget"
            }
            icon={budget.remainingBudget >= 0 ? TrendingUp : TrendingDown}
          />

          {/* Card 4: Persentase */}
          <BudgetSummaryCard
            title={`Persentase ${currentItem.energyTypeName}`}
            value={`${(budget.realizationPercentage || 0).toFixed(2)}%`}
            description="Dari total alokasi budget"
            icon={
              budget.realizationPercentage > 100 ? TrendingDown : TrendingUp
            }
          />
        </motion.div>
      </AnimatePresence>

      {/* Indikator Dots (Opsional: Muncul cuma kalau 'all' dipilih) */}
      {selectedEnergyType === "all" && filteredData.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {filteredData.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
