"use client";

import { ArrowDown, ArrowUp, Thermometer } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
// Sesuaikan path import Card Anda
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
  CardFooter,
} from "@/common/components/ui/card";
import { SummaryData } from "@/services/summary.service";

const formatTemp = (value: number | undefined | null) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
};

const StatItem = ({
  label,
  value,
  unit,
  percentageChange,
}: {
  label: string;
  value: string;
  unit: string;
  percentageChange?: number | null;
}) => {
  let percentageColor = "text-slate-500";
  let PercentageIcon = null;

  if (percentageChange !== null && percentageChange !== undefined) {
    if (percentageChange < 0) {
      percentageColor = "text-emerald-600 dark:text-emerald-500";
      PercentageIcon = ArrowDown;
    } else if (percentageChange > 0) {
      percentageColor = "text-red-600 dark:text-red-500";
      PercentageIcon = ArrowUp;
    }
  }

  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-foreground text-xl font-bold">{value}</p>
        <span className="text-muted-foreground text-sm font-normal">
          {unit}
        </span>
      </div>

      {percentageChange !== undefined && (
        <div
          className={`mt-1 flex items-center gap-1 text-xs font-bold ${percentageColor}`}
        >
          {PercentageIcon && <PercentageIcon className="h-3 w-3" />}
          <span>{Math.abs(percentageChange ?? 0)}%</span>
        </div>
      )}
    </div>
  );
};

export const TemperatureStatCard = ({ data }: { data: SummaryData }) => {
  const { averageTemperature, averageMaxTemperature, todayTemperature } = data;

  const [activePanel, setActivePanel] = useState(0);
  const panels = ["Hari Ini", "Bulanan"];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePanel((prev) => (prev + 1) % panels.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [panels.length]);

  const panelVariants = {
    enter: { opacity: 0, x: 20 }, // Ubah ke x agar slide ke samping
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <Card className="h-full border-l-4 border-l-transparent transition-all hover:border-l-red-500/50">
      {/* 1. HEADER: Judul & Icon */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-wide">
            Suhu & Cuaca
          </CardTitle>
          <CardAction>
            <div className="rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-500/20 dark:text-red-500">
              <Thermometer className="h-5 w-5" />
            </div>
          </CardAction>
        </div>
      </CardHeader>

      {/* 2. CONTENT: Animasi Data */}
      <CardContent className="relative flex min-h-[80px] flex-grow flex-col justify-center">
        <AnimatePresence mode="wait">
          {activePanel === 0 && (
            <motion.div
              key="today"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid w-full grid-cols-2 gap-6"
            >
              <StatItem
                label="Rata-rata Hari Ini"
                value={formatTemp(todayTemperature?.avg_temp)}
                unit="°C"
              />
              <StatItem
                label="Maksimum Hari Ini"
                value={formatTemp(todayTemperature?.max_temp)}
                unit="°C"
              />
            </motion.div>
          )}

          {activePanel === 1 && (
            <motion.div
              key="monthly"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid w-full grid-cols-2 gap-6"
            >
              <StatItem
                label="Rerata Bulanan"
                value={formatTemp(averageTemperature?.currentValue)}
                unit="°C"
                percentageChange={averageTemperature?.percentageChange}
              />
              <StatItem
                label="Rerata Maks. Bulanan"
                value={formatTemp(averageMaxTemperature?.currentValue)}
                unit="°C"
                percentageChange={averageMaxTemperature?.percentageChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* 3. FOOTER: Indikator Slide (Dots) */}
      <CardFooter className="justify-center pb-4 pt-0">
        <div className="flex gap-2">
          {panels.map((_, index) => (
            <button
              key={index}
              onClick={() => setActivePanel(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activePanel === index
                  ? "w-6 bg-red-500"
                  : "bg-background dark:bg-background hover:bg-background w-1.5"
              }`}
              aria-label={`Switch to panel ${index + 1}`}
            />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};
