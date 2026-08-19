"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, PieChart, TrendingUp, User, Zap } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Progress } from "@/common/components/ui/progress";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Skeleton } from "@/common/components/ui/skeleton";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { annualBudgetApi } from "../../services/annualBudget.service";

interface BudgetDetailProps {
  schemeId: number;
}

export const AnnualBudgetDetailView = ({ schemeId }: BudgetDetailProps) => {
  const { data: detailRes, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["annualBudgetDetail", schemeId],
    queryFn: () => annualBudgetApi.getById(schemeId),
    enabled: !!schemeId,
  });

  const { data: remainingRes, isLoading: isLoadingRemaining } = useQuery({
    queryKey: ["annualBudgetRemaining", schemeId],
    queryFn: () => annualBudgetApi.showRemaining(schemeId),
    enabled: !!schemeId,
  });

  const detail = detailRes?.data;
  const remainingData = remainingRes?.data;
  const isLoading = isLoadingDetail || isLoadingRemaining;

  if (isLoading) return <DetailSkeleton />;

  if (!detail || !remainingData)
    return (
      <div className="border-muted text-muted-foreground flex h-40 items-center justify-center rounded-xl border border-dashed italic">
        Data anggaran tidak lengkap.
      </div>
    );

  const realizationPercentage =
    (Number(remainingData.total_realization) / Number(detail.total_amount)) * 100;

  return (
    <ScrollArea className="h-[calc(100vh-120px)] pr-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8 pb-10"
      >
        {/* SECTION 1: Financial Overview Hero */}
        <Card className="relative overflow-hidden border-none bg-slate-950 text-white shadow-2xl">
          <div className="absolute -top-10 -right-10 rotate-12 p-12 opacity-10">
            <PieChart size={180} />
          </div>

          <CardHeader className="relative z-10 border-b border-white/5 bg-white/5 pb-6">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="secondary" className="border-white/20 bg-white/10 text-white">
                FY {detail.fiscal_year}
              </Badge>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  {detail.energy_type.name}
                </span>
              </div>
            </div>
            <CardTitle className="text-3xl leading-tight font-black tracking-tight">
              {detail.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="relative z-10 space-y-8 pt-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Total Plafon
                </p>
                <h3 className="text-2xl font-black">
                  {formatCurrencySmart(detail.total_amount).full}
                </h3>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                  Sisa Dana
                </p>
                <h3 className="text-2xl font-black text-emerald-400">
                  {formatCurrencySmart(remainingData.remaining_budget).full}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Penyerapan</p>
                  <p className="text-lg font-bold">
                    {formatCurrencySmart(remainingData.total_realization).full}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">{realizationPercentage.toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={realizationPercentage} className="h-3 bg-white/10" />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Metadata Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="bg-muted/30 shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <User className="text-primary h-4 w-4" />
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-[9px] font-bold uppercase">Perencana</p>
                <p className="text-xs font-bold">@{detail.creator?.username || "admin"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="text-primary h-4 w-4" />
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-[9px] font-bold uppercase">Tgl Terbit</p>
                <p className="text-xs font-bold">
                  {new Date(detail.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Target Info Alert Style */}
        {detail.efficiency_target_percentage && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-tight text-amber-800 uppercase dark:text-amber-500">
                  Target Efisiensi
                </p>
                <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-slate-400">
                  Direncanakan penghematan sebesar{" "}
                  <span className="font-bold text-amber-900 dark:text-amber-300">
                    {/* Perbaikan kalkulasi persentase: dikali 100 */}
                    {Math.round(Number(detail.efficiency_target_percentage) * 100)}%
                  </span>{" "}
                  dari konsumsi riil sebelumnya.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </ScrollArea>
  );
};

// Loading Skeleton Component
const DetailSkeleton = () => (
  <div className="space-y-8 pr-4">
    <Skeleton className="h-[280px] w-full rounded-2xl" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
    <Skeleton className="h-24 w-full rounded-xl" />
  </div>
);
