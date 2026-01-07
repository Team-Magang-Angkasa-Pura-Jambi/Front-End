"use client";

import React, { useMemo, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { RowData } from "@tanstack/react-table";
import { motion, Variants, AnimatePresence } from "framer-motion";

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
import { BudgetTable } from "./BudgetTable";
import { getColumns } from "./columns";
import { AnnualBudgetDialog } from "./AnnualBudgetDialog";
import { MeterAllocationDetails } from "./MeterAllocationDetails";

import { AnnualBudget } from "@/common/types/budget";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { useAnnualBudgetLogic } from "../hooks/useAnnualBudgetLogic";

// Variabel Animasi Tambahan
const tableContainerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const pulseVariants: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0.5, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function AnnualBudgetPage() {
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<AnnualBudget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<AnnualBudget | null>(
    null
  );

  const handleOpenDialog = (budget: AnnualBudget | null = null) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingBudget(null);
  };

  const handleFormSubmit = (values: AnnualBudgetFormValues) => {
    createOrUpdateMutation.mutate(
      { values, isEditing: !!editingBudget, id: editingBudget?.budget_id },
      { onSuccess: () => handleCloseDialog(false) }
    );
  };

  const columns = useMemo(
    () => getColumns(handleOpenDialog, (budget) => setBudgetToDelete(budget)),
    []
  );

  return (
    <motion.div
      className="container mx-auto py-10 px-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
    >
      {/* HEADER SECTION */}
      <motion.header
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        variants={{
          hidden: { y: -20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Manajemen Budget
          </h1>
          <p className="text-muted-foreground">
            Kelola dan analisis anggaran energi tahunan Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Select
              value={selectedYear ? selectedYear.toString() : ""}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-[120px] bg-background shadow-sm">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {availableYears?.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Select
              value={selectedEnergyType}
              onValueChange={(value) => setSelectedEnergyType(value)}
            >
              <SelectTrigger className="w-[150px] bg-background shadow-sm">
                <SelectValue placeholder="Energi" />
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
          </motion.div>
        </div>
      </motion.header>

      {/* CAROUSEL / ANALYTICS SECTION */}
      <motion.section
        className="mb-12"
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Insight Anggaran
          </h2>
        </div>
        <BudgetSummaryCarousel
          data={summaryData}
          isLoading={isLoadingSummary}
          selectedEnergyType={selectedEnergyType}
        />
      </motion.section>

      {/* TABLE ACTIONS */}
      <motion.div
        className="flex justify-between items-end mb-6"
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        }}
      >
        <div>
          <h3 className="text-lg font-bold">Daftar Anggaran Periode</h3>
          <p className="text-sm text-muted-foreground">
            Menampilkan detail budget berdasarkan periode waktu.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog(null)}
          className="shadow-lg hover:shadow-primary/20 transition-all"
          asChild
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Budget
          </motion.button>
        </Button>
      </motion.div>

      {/* DATA TABLE SECTION */}
      <motion.div variants={tableContainerVariants} className="relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="h-[400px] w-full rounded-xl border bg-muted/20 flex flex-col items-center justify-center gap-3"
            >
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">
                Menyiapkan data...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border bg-card shadow-xl overflow-hidden"
            >
              <BudgetTable
                columns={columns}
                data={childBudgets}
                isLoading={false}
                getRowCanExpand={(row) => !!row.original.allocations?.length}
                renderSubComponent={({ row }) => (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MeterAllocationDetails annualBudget={row.original} />
                  </motion.div>
                )}
              />

              {childBudgets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Search className="h-10 w-10 mb-4 opacity-20" />
                  <p>Tidak ada data anggaran ditemukan untuk filter ini.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DIALOGS */}
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Konfirmasi Penghapusan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus budget periode{" "}
              <span className="font-bold text-foreground">
                {budgetToDelete &&
                  new Date(budgetToDelete.period_start).toLocaleDateString(
                    "id-ID",
                    { month: "long", year: "numeric", day: "numeric" }
                  )}
              </span>
              . Data ini akan hilang permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-6"
              onClick={() =>
                deleteMutation.mutate(budgetToDelete!.budget_id, {
                  onSuccess: () => setBudgetToDelete(null),
                })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
