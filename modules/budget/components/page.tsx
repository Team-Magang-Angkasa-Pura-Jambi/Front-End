"use client";

import React, { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import { RowData } from "@tanstack/react-table";
import { motion, Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { BudgetSummaryCarousel } from "./BudgetSummaryCarousel";
import { MonthlyUsageDetails } from "./MonthlyUsageDetails";
import { BudgetTable } from "./BudgetTable";
import { getColumns } from "./columns";
import { AnnualBudgetDialog } from "./AnnualBudgetDialog";

import { AnnualBudget } from "@/common/types/budget";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { useAnnualBudgetLogic } from "../hooks/useAnnualBudgetLogic";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

// Variants Animasi
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, when: "beforeChildren" },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 50 },
  },
};

export default function AnnualBudgetPage() {
  // 1. Ambil semua logic & data dari Hook
  const {
    childBudgets,
    parentBudgets,
    isLoading,
    isLoadingSummary,
    summaryData,
    selectedYear,
    setSelectedYear,
    availableYears,
    selectedEnergyType,
    setSelectedEnergyType,
    energyTypes,
    createOrUpdateMutation,
    deleteMutation,
  } = useAnnualBudgetLogic();

  // 2. Local State untuk Modal/Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<AnnualBudget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<AnnualBudget | null>(
    null
  );

  // 3. Handlers
  const handleOpenDialog = (budget: AnnualBudget | null = null) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingBudget(null);
  };

  const handleDeleteRequest = (budget: AnnualBudget) => {
    setBudgetToDelete(budget);
  };

  const handleFormSubmit = (values: AnnualBudgetFormValues) => {
    createOrUpdateMutation.mutate(
      { values, isEditing: !!editingBudget, id: editingBudget?.budget_id },
      { onSuccess: () => handleCloseDialog(false) }
    );
  };

  const columns = useMemo(
    () => getColumns(handleOpenDialog, handleDeleteRequest),
    []
  );

  return (
    <motion.div
      className="container mx-auto py-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* --- Bagian Summary & Filter --- */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ringkasan & Analisis Budget</h2>

          <div className="flex items-center gap-2">
            {/* Filter Tahun */}
            <Select
              value={selectedYear ? selectedYear.toString() : ""}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {availableYears?.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Energy Type (FIXED: State sendiri) */}
            <Select
              value={selectedEnergyType}
              onValueChange={(value) => setSelectedEnergyType(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipe Energi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Energi</SelectItem>
                {energyTypes?.map((e) => (
                  <SelectItem key={e.energy_type_id} value={e.type_name}>
                    {e.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Carousel Summary (FIXED: Pass Props) */}
        <BudgetSummaryCarousel
          data={summaryData}
          isLoading={isLoadingSummary}
          selectedEnergyType={selectedEnergyType}
        />
      </motion.div>

      {/* --- Header Tabel --- */}
      <motion.div
        className="flex justify-between items-center mb-4"
        variants={itemVariants}
      >
        <h1 className="text-2xl font-bold">Manajemen Budget Tahunan</h1>
        <Button
          onClick={() => handleOpenDialog(null)}
          className="transition-transform active:scale-95"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Budget
        </Button>
      </motion.div>

      {/* --- Tabel --- */}
      <motion.div variants={itemVariants}>
        <div className="rounded-md border bg-card shadow-sm">
          <BudgetTable
            columns={columns}
            data={childBudgets}
            isLoading={isLoading}
            getRowCanExpand={() => true}
            renderSubComponent={({ row }) => (
              <MonthlyUsageDetails annualBudget={row.original} />
            )}
          />
        </div>
      </motion.div>

      {/* --- Dialogs --- */}
      <AnnualBudgetDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        editingBudget={editingBudget}
        parentBudgets={parentBudgets}
        onSubmit={handleFormSubmit}
        isSubmitting={createOrUpdateMutation.isPending}
      />

      <AlertDialog
        open={!!budgetToDelete}
        onOpenChange={() => setBudgetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus budget periode{" "}
              <span className="font-bold">
                {budgetToDelete &&
                  new Date(budgetToDelete.period_start).toLocaleDateString(
                    "id-ID"
                  )}
              </span>
              . Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(budgetToDelete!.budget_id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
