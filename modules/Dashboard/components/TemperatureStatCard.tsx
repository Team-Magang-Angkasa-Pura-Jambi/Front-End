"use client";

import { ArrowDown, ArrowUp, Thermometer } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const formatTemp = (value: number | undefined | null) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
};

// Helper component untuk menampilkan item statistik dengan perubahan persentase
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
  let percentageColor = "text-gray-500";
  let PercentageIcon = null;

  if (percentageChange !== null && percentageChange !== undefined) {
    if (percentageChange < 0) {
      percentageColor = "text-green-600"; // Suhu turun (lebih dingin) itu bagus
      PercentageIcon = ArrowDown;
    } else if (percentageChange > 0) {
      percentageColor = "text-red-600"; // Suhu naik (lebih panas)
      PercentageIcon = ArrowUp;
    }
  }

  return (
    <div>
      <p className="text-xs">{label}</p>
      <p className="font-bold ">
        {value}
        <span className="text-sm font-normal text-gray-600">{unit}</span>
      </p>
      {percentageChange !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${percentageColor}`}
        >
          {PercentageIcon && <PercentageIcon className="h-3 w-3" />}
          <span>{Math.abs(percentageChange ?? 0)}%</span>
        </div>
      )}
    </div>
  );
};

export const TemperatureStatCard = ({ data }) => {
  if (!data) return null;

  const { averageTemperature, averageMaxTemperature, todayTemperature } = data;

  const [activePanel, setActivePanel] = useState(0);
  const panels = ["Hari Ini", "Bulanan"];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePanel((prev) => (prev + 1) % panels.length);
    }, 10000); // Ganti panel setiap 10 detik

    return () => clearInterval(timer); // Membersihkan interval saat komponen unmount
  }, [panels.length]);

  const panelVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="bg-card p-5 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold ">Suhu & Cuaca</p>
        <div className="p-3 rounded-full bg-red-500">
          <Thermometer className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex-grow flex flex-col justify-center relative mt-2 min-h-[57px]">
        <AnimatePresence mode="wait">
          {activePanel === 0 && (
            <motion.div
              key="today"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              <StatItem
                label="Suhu Rata-rata"
                value={formatTemp(todayTemperature?.avg_temp)}
                unit="°C"
              />
              <StatItem
                label="Suhu Maksimum"
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
              transition={{ duration: 0.5, type: "tween" }}
              className="grid grid-cols-2 gap-4 "
            >
              <StatItem
                label="Rerata Suhu"
                value={formatTemp(averageTemperature?.currentValue)}
                unit="°C"
                percentageChange={averageTemperature?.percentageChange}
              />
              <StatItem
                label="Rerata Suhu Maks."
                value={formatTemp(averageMaxTemperature?.currentValue)}
                unit="°C"
                percentageChange={averageMaxTemperature?.percentageChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-center items-center gap-2 pt-4">
        {panels.map((_, index) => (
          <button
            key={index}
            onClick={() => setActivePanel(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              activePanel === index ? "bg-red-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
