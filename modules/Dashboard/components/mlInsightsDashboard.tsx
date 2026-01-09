"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

// --- 1. Definisi Tipe Data ---
export type EvaluationStatus = "Boros" | "Efisien" | "Normal" | "Warning";

export interface DailyEvaluationItem {
  name: string;
  deviation: number;
  status: EvaluationStatus;
  color?: string;
}

interface MLDailyDashboardProps {
  data?: DailyEvaluationItem[];
  isLoading?: boolean;
}

// --- 2. DATA DUMMY (Hardcoded di file yang sama) ---
const DUMMY_DATA: DailyEvaluationItem[] = [
  {
    name: "Terminal 1 Domestik",
    deviation: 24.5,
    status: "Boros",
    color: "#ef4444",
  },
  {
    name: "Gedung Parkir A",
    deviation: -8.2,
    status: "Efisien",
    color: "#22c55e",
  },
  {
    name: "Cargo Warehouse",
    deviation: 1.2,
    status: "Normal",
    color: "#3b82f6",
  },
  {
    name: "Main Office Center",
    deviation: 12.5,
    status: "Warning",
    color: "#f97316",
  },
];

// --- 3. Komponen Utama ---
export const MLDailyDashboard = ({
  // Menggunakan DUMMY_DATA sebagai default jika props data kosong/tidak dikirim
  data = DUMMY_DATA,
  isLoading = false,
}: MLDailyDashboardProps) => {
  // --- Logic: Generate Insight Otomatis ---
  const insight = useMemo(() => {
    if (isLoading || data.length === 0) return null;

    // Cari item yang statusnya Boros dengan deviasi tertinggi
    const worstPerformer = [...data]
      .filter((d) => d.deviation > 0)
      .sort((a, b) => b.deviation - a.deviation)[0];

    if (worstPerformer && worstPerformer.deviation > 10) {
      return {
        type: "warning",
        message: `${worstPerformer.name} terdeteksi Boros (Deviasi +${worstPerformer.deviation}%). Segera cek anomali penggunaan beban.`,
      };
    }

    return {
      type: "success",
      message:
        "Sistem berjalan optimal. Tidak ada deviasi signifikan hari ini.",
    };
  }, [data, isLoading]);

  // Helper warna status
  const getStatusColor = (status: EvaluationStatus, defaultColor?: string) => {
    if (defaultColor) return defaultColor;
    switch (status) {
      case "Boros":
        return "#ef4444";
      case "Warning":
        return "#f97316";
      case "Efisien":
        return "#22c55e";
      default:
        return "#3b82f6";
    }
  };

  const getBadgeStyle = (status: EvaluationStatus) => {
    switch (status) {
      case "Boros":
        return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
      case "Warning":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200";
      case "Efisien":
        return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
    }
  };

  return (
    <Card className="shadow-md border-none ring-1 ring-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="border-b border-slate-50 py-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
          <Activity className="w-4 h-4 text-purple-600" />
          Evaluasi AI Hari Ini
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 flex-1">
        {isLoading ? (
          // --- Loading State ---
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))
        ) : data.length === 0 ? (
          // --- Empty State ---
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada data evaluasi hari ini.
          </div>
        ) : (
          // --- Data List ---
          data.map((item, idx) => {
            const barColor = getStatusColor(item.status, item.color);
            return (
              <div key={idx} className="space-y-2">
                {/* Header Item */}
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-black text-slate-700">
                        {item.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 h-4 ${getBadgeStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-lg font-black ${
                        item.deviation > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {item.deviation > 0
                        ? `+${item.deviation}`
                        : item.deviation}
                      %
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-1000 rounded-full"
                    style={{
                      width: `${Math.min(Math.abs(item.deviation) * 4, 100)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* --- Dynamic AI Insight Footer --- */}
        {!isLoading && insight && (
          <div
            className={`p-3 border rounded-xl mt-4 flex gap-3 items-start ${
              insight.type === "warning"
                ? "bg-amber-50 border-amber-100 text-amber-800"
                : "bg-green-50 border-green-100 text-green-800"
            }`}
          >
            {insight.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}

            <div>
              <span className="text-xs font-bold uppercase tracking-tight block mb-0.5">
                AI Decision Insight
              </span>
              <p className="text-[11px] leading-relaxed opacity-90">
                {insight.message}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
