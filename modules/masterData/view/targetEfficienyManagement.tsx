"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Target } from "lucide-react";

import { Card, CardContent } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";

import { TargetEfficiencyForm } from "../components/organisms/targetEfficiency.form";
import { TargetKPIListRow } from "../components/molecules/TargetKPIListRow";
import { ConfirmDeleteDialog } from "../components/templates/ConfirmDeleteDialog";
import { MasterDataDialog } from "../components/templates/MasterDataDialog";
import { PageHeader } from "../components/templates/PageHeader";
import { useEfficiencyTargets } from "../hooks/useEfficiencyTargets";

export const TargetEfficiencyManagement = () => {
  // --- Custom Hook (Logic Terpusat) ---
  const {
    data: targets,
    isLoading,
    isFormOpen,
    setIsFormOpen,
    editingItem,
    itemToDelete,
    setItemToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    confirmDelete,
    isDeleting,
    closeForm,
  } = useEfficiencyTargets();

  return (
    <div className="space-y-6">
      <div className="bg-background/50 flex flex-col gap-6 rounded-2xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Target Efisiensi"
          description="Atur ambang batas penghematan energi (KPI) dan pantau performa terhadap baseline."
          icon={Target}
          iconClassName="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        />

        <div className="flex items-center gap-3">
          <MasterDataDialog
            isOpen={isFormOpen}
            onOpenChange={(v) => {
              if (!v)
                closeForm(); // Gunakan helper closeForm
              else setIsFormOpen(true);
            }}
            triggerLabel="Tambah KPI"
            // Pastikan trigger memanggil handleCreate
            onTriggerClick={handleCreate}
            triggerIcon={<PlusCircle className="h-4 w-4" />}
            title={editingItem ? "Update Target KPI" : "Buat Target KPI Baru"}
            description="Tentukan persentase efisiensi yang ingin dicapai dari baseline yang ada."
            maxWidth="2xl"
          >
            {/* Form Component: Cukup passing itemId (jika edit) dan callback penutup */}
            <TargetEfficiencyForm itemId={editingItem?.target_id} onAfterSave={closeForm} />
          </MasterDataDialog>
        </div>
      </div>

      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <motion.div
                className="space-y-3"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {targets.map((target) => (
                  <motion.div
                    key={target.target_id}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <TargetKPIListRow item={target} onEdit={handleEdit} onDelete={handleDelete} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        isOpen={!!itemToDelete}
        onOpenChange={(v) => !v && setItemToDelete(null)}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        title="Hapus Target Efisiensi"
        description={
          <>
            <strong>{itemToDelete?.kpi_name}</strong>? Data akan terpengaruh.
          </>
        }
      />
    </div>
  );
};
