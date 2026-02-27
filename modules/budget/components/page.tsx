"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  FileText,
  MoreVertical,
  Pencil,
  PlusCircle,
  SearchX,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/common/components/ui/sheet";

import { EnergyTypeName } from "@/common/types/energy";
import { getEnergyIcon } from "@/modules/Dashboard/components/modernBudgetAnalysis/constants";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { formatCurrencySmart } from "@/utils/formatCurrencySmart";
import { useAnnualBudgetLogic } from "../hooks/useAnnualBudgetLogic";
import { BudgetForm } from "./BudgetForm";
import { AnnualBudgetDetailView } from "./molecules/PricingSchemeDetail";

export default function AnnualBudgetPage() {
  const {
    childBudgets,
    isLoading,
    selectedYear,
    setSelectedYear,
    availableYears,
    selectedEnergyType,
    setSelectedEnergyType,
    deleteMutation,
  } = useAnnualBudgetLogic();

  // --- STATE ---
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);

  const { data: energyRes } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
  });

  const energyTypes = useMemo(() => energyRes?.data || [], [energyRes]);

  // --- HANDLERS ---
  const handleAddClick = () => {
    setEditingBudgetId(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (id: number) => {
    setEditingBudgetId(id);
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-background min-h-screen p-4 transition-colors duration-500 md:p-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* HEADER */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-8 w-2 rounded-full" />
              <h1 className="text-4xl font-black tracking-tighter md:text-5xl">
                Sentinel <span className="text-primary">Budget</span>
              </h1>
            </div>
            <p className="text-muted-foreground font-medium italic">
              Monitoring efisiensi energi Bandara Sultan Thaha.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-background/40 border-border flex items-center gap-2 rounded-2xl border p-1 shadow-sm backdrop-blur-xl">
              <div className="w-px" />
              <Select value={selectedEnergyType} onValueChange={setSelectedEnergyType}>
                <SelectTrigger className="border-none bg-transparent text-xs font-bold uppercase shadow-none focus:ring-0">
                  <SelectValue placeholder="Energi" />
                </SelectTrigger>
                <SelectContent className="border-none shadow-2xl">
                  <SelectItem value="all">Semua Energi</SelectItem>
                  {energyTypes?.map((e) => (
                    <SelectItem key={e.energy_type_id} value={e.energy_type_id.toString()}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddClick}
              variant="default"
              className="rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Tambah Budget
            </Button>
          </div>
        </header>

        {/* CARDS GRID */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted h-80 animate-pulse rounded-4xl" />
              ))
            ) : childBudgets.length > 0 ? (
              childBudgets.map((budget, index: number) => (
                <motion.div
                  key={budget.budget_id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <Card className="hover:border-primary group bg-card relative flex h-full flex-col overflow-hidden border shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                    {/* Background Decorative */}
                    <div className="text-muted-foreground absolute -top-8 -right-8 p-12 opacity-[0.05] transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">
                      {getEnergyIcon(budget.energy_type.name as EnergyTypeName)}
                    </div>

                    <CardHeader className="relative z-10 pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-lg font-bold">
                          {getEnergyIcon(budget.energy_type.name as EnergyTypeName)}
                          <span className="ml-1.5">{budget.fiscal_year}</span>
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl border-none shadow-2xl"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditClick(budget.budget_id)}
                              className="cursor-pointer gap-2 font-medium"
                            >
                              <Pencil size={14} /> Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(budget.budget_id)}
                              className="text-destructive cursor-pointer gap-2 font-medium"
                            >
                              <Trash2 size={14} /> Hapus Anggaran
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="mt-4 line-clamp-2 text-2xl leading-tight font-extrabold tracking-tight italic">
                        {budget.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative z-10 flex-1 space-y-6 pt-2">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                            Total Anggaran
                          </p>
                          <h3 className="text-3xl font-black">
                            {formatCurrencySmart(budget.total_amount).full}
                          </h3>
                        </div>
                      </div>
                      {budget.efficiency_target_percentage && (
                        <div className="bg-accent/50 flex items-center gap-4 rounded-2xl border p-4 backdrop-blur-sm">
                          <TrendingDown className="text-primary h-5 w-5" />
                          <div>
                            <p className="text-muted-foreground mb-1 text-[10px] leading-none font-bold uppercase">
                              Saving Target
                            </p>
                            <p className="text-sm font-black">
                              {Number(budget.efficiency_target_percentage) * 100}% Lebih Hemat
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="bg-muted/30 relative z-10 mt-auto border-t p-4">
                      <Button
                        onClick={() => setSelectedBudgetId(budget.budget_id)}
                        variant="ghost"
                        className="group/btn w-full justify-between font-bold hover:bg-transparent"
                      >
                        EXPLORE ALLOCATION
                        <div className="bg-background rounded-full border p-1 shadow-sm transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                          <ArrowUpRight size={14} className="text-primary" />
                        </div>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-20 text-center">
                <SearchX className="text-muted-foreground h-16 w-16 opacity-20" />
                <h3 className="text-xl font-bold">Data Tidak Ditemukan</h3>
                <Button onClick={handleAddClick} variant="outline" className="rounded-xl">
                  Buat Anggaran Baru
                </Button>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* DIALOG FORM - Sekarang hanya memanggil BudgetForm */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="flex max-h-[95vh] flex-col overflow-hidden border-none p-0 shadow-2xl sm:max-w-3xl">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-black tracking-tight italic">
                {editingBudgetId ? "⚙️ Edit Anggaran" : "➕ Buat Anggaran"}
                <span className="text-primary ml-2">Tahunan</span>
              </DialogTitle>
            </DialogHeader>

            {/* SEKARANG FORM ADA DI DALAM SINI */}
            <BudgetForm
              editingBudgetId={editingBudgetId}
              onClose={() => setIsDialogOpen(false)}
              energyTypes={energyTypes}
            />
          </DialogContent>
        </Dialog>

        {/* SIDE SHEET DETAIL */}
        <Sheet open={!!selectedBudgetId} onOpenChange={() => setSelectedBudgetId(null)}>
          <SheetContent
            side="right"
            className="bg-background/95 w-full overflow-y-auto border-none px-3 shadow-2xl backdrop-blur-md sm:max-w-150"
          >
            <SheetHeader className="mb-6 pt-4">
              <div className="bg-muted text-muted-foreground mb-2 flex w-fit items-center gap-2 rounded-full p-1 px-3 text-[10px] font-black uppercase">
                <FileText size={12} /> Detail Budget Log
              </div>
              <SheetTitle className="text-2xl font-black tracking-tighter italic">
                Overview & Alokasi Anggaran
              </SheetTitle>
            </SheetHeader>
            {selectedBudgetId && <AnnualBudgetDetailView schemeId={selectedBudgetId} />}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
