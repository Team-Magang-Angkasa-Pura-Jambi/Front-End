"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const AnalysisChart = () => {
  const [activeTab, setActiveTab] = useState("Air");

  const generateDailyData = (baseUsage, target, noise) => {
    const today = new Date().getDate(); // Mendapatkan tanggal hari ini (misal: 13)

    return Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;

      // Logika untuk menghasilkan nilai dasar pemakaian
      const usageValue = Math.round(
        baseUsage +
          (Math.random() - 0.5) * noise +
          Math.sin(day / 5) * (noise / 2)
      );

      // Pemakaian dan target hanya diisi hingga hari ini
      const pemakaian = day <= today ? usageValue : null;
      const currentTarget = day <= today ? target : null;

      // Prediksi diisi hingga besok (hari ini + 1)
      const prediksi =
        day <= today + 1
          ? Math.round(usageValue * (1 + (Math.random() - 0.4) * 0.1))
          : null;

      return {
        name: `${day}`,
        pemakaian: pemakaian,
        target: currentTarget,
        prediksi: prediksi,
      };
    });
  };

  const waterData = generateDailyData(120, 115, 20);
  const electricityData = generateDailyData(250, 240, 40);
  const fuelData = generateDailyData(50, 45, 10);

  const data =
    activeTab === "Air"
      ? waterData
      : activeTab === "Listrik"
      ? electricityData
      : fuelData;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm col-span-2 ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">
          Analisis Pemakaian Sumber Daya
        </h3>
        <div className="flex items-center border border-gray-200 rounded-lg p-1 space-x-1">
          <button
            onClick={() => setActiveTab("Air")}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
              activeTab === "Air"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Air
          </button>
          <button
            onClick={() => setActiveTab("Listrik")}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
              activeTab === "Listrik"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Listrik
          </button>
          <button
            onClick={() => setActiveTab("Fuel")}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
              activeTab === "Fuel"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Fuel
          </button>
        </div>
      </div>
      <div className="w-full overflow-x-auto" style={{ height: 320 }}>
        <LineChart
          width={1200}
          height={300}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(5px)",
              border: "1px solid #e0e0e0",
              borderRadius: "0.75rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
          <Line
            type="monotone"
            dataKey="pemakaian"
            name="Pemakaian"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="target"
            name="Target Efisiensi"
            stroke="#a1a1aa"
            strokeWidth={2}
            strokeDasharray="5 5"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="prediksi"
            name="Prediksi"
            stroke="#22c55e"
            strokeWidth={2}
            connectNulls={false}
          />
        </LineChart>
      </div>
    </div>
  );
};
