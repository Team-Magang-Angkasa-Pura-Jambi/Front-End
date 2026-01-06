import React from "react";
import { ZapOff, Droplets, Flame, CheckCircle2 } from "lucide-react";
import { LogItem } from "./LogItem";

export const ActivityLog = () => {
  const activities = [
    {
      icon: ZapOff,
      iconColor: "text-red-500",
      bgColor: "bg-red-100",
      description: "Terjadi pemadaman listrik di area pompa utama.",
      time: "5 menit yang lalu",
    },
    {
      icon: Droplets,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100",
      description: "Sensor A-03 mendeteksi kebocoran air minor.",
      time: "2 jam yang lalu",
    },
    {
      icon: Flame,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-100",
      description: "Pengiriman bahan bakar solar telah diterima.",
      time: "Kemarin",
    },
    {
      icon: CheckCircle2,
      iconColor: "text-green-500",
      bgColor: "bg-green-100",
      description: "Perawatan rutin genset B selesai.",
      time: "Kemarin",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm col-span-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-gray-800">
          Log Aktivitas Terbaru
        </h3>
        <button className="text-sm text-blue-600 font-semibold">
          Lihat Semua
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity, index) => (
          <LogItem key={index} {...activity} />
        ))}
      </div>
    </div>
  );
};
