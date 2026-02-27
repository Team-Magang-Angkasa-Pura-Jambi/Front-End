"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, Plus, Search } from "lucide-react"; // Tambahkan History icon

import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/sheet";
import { Skeleton } from "@/common/components/ui/skeleton";

import { useEffect, useState } from "react";
import { MeterDetailSheet } from "../components/MeterDetail ";
import { MeterHeader } from "../components/molecules/MeterHeader";
import { MetersCard } from "../components/molecules/MetersCard";
import { SearchBar } from "../components/molecules/SearchBar";
import { MeterForm } from "../components/organisms/meter.form";
import { ConfirmDeleteDialog } from "../components/templates/ConfirmDeleteDialog";
import { MasterDataDialog } from "../components/templates/MasterDataDialog";
import { MeterProvider, useMeter } from "../context/MeterContext";
import { SentinelAuditLog } from "../schemas/SentinelAuditLog";

const MeterManagementContent = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    isFormOpen,
    setIsFormOpen,
    filteredMeters,
    isLoading,
    isDetailOpen,
    setIsDetailOpen,
    selectedMeterId,
    setSelectedMeterId,
    handleCloseForm,
    handleUpsert,
    isMutating,
    isDeleteOpen,
    setIsDeleteOpen,
    isDeleting,
    handleConfirmDelete,
  } = useMeter();

  if (!hasMounted) return null;

  return (
    <Card className="bg-background/50 min-h-[600px] border-none shadow-sm">
      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-y-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <MeterHeader />

          <div className="flex items-center gap-2">
            {/* Audit Log Dialog */}
            <MasterDataDialog
              isOpen={isLogOpen}
              onOpenChange={setIsLogOpen}
              triggerLabel="Riwayat"
              triggerIcon={<History className="mr-1.5 h-4 w-4" />}
              triggerClassName="bg-slate-800 hover:bg-slate-900 text-white transition-colors"
              title="Audit Log Perangkat Meter"
              description="Menampilkan jejak audit perubahan konfigurasi pada sistem meter Bandara Sultan Thaha."
              maxWidth="2xl"
            >
              <SentinelAuditLog entityTable="Meter" height="h-[65vh]" />
            </MasterDataDialog>

            {/* Upsert Meter Dialog */}
            <MasterDataDialog
              isOpen={isFormOpen}
              onOpenChange={(open) => {
                if (!open) handleCloseForm();
                else setIsFormOpen(true);
              }}
              triggerLabel="Tambah Meter"
              triggerIcon={<Plus className="mr-1.5 h-4 w-4" />}
              title={selectedMeterId ? "Edit Konfigurasi Meter" : "Registrasi Meter Baru"}
              description="Lengkapi informasi identitas, profil tangki, dan ambang batas alarm perangkat."
              maxWidth="6xl"
            >
              <MeterForm
                initialData={selectedMeterId ?? undefined}
                onSubmit={handleUpsert}
                isLoading={isMutating}
              />
            </MasterDataDialog>
          </div>
        </div>

        <SearchBar />
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={`skel-${i}`} className="h-[220px] w-full rounded-xl" />
              ))}
            </motion.div>
          ) : filteredMeters.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-muted/5 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center"
            >
              <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Search className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold">Data tidak ditemukan</h3>
              <p className="text-muted-foreground text-sm">Coba ubah kata kunci pencarian Anda.</p>
            </motion.div>
          ) : (
            <motion.div
              key="meter-list"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredMeters.map((meter) => (
                <motion.div
                  key={meter.meter_id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <MetersCard meter={meter} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Side Detail Sheet */}
      <Sheet
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedMeterId(null);
        }}
      >
        <SheetContent className="w-[95vw] overflow-y-auto p-0 sm:max-w-xl">
          <div className="bg-muted/10 bg-background/80 sticky top-0 z-10 border-b px-6 py-6 backdrop-blur">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Detail Perangkat</SheetTitle>
              <SheetDescription>Informasi teknis dan status operasional meter.</SheetDescription>
            </SheetHeader>
          </div>

          <div className="p-6">
            {selectedMeterId ? (
              <MeterDetailSheet meterId={selectedMeterId} />
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Global Delete Confirmation */}
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Meter"
        description={
          <>
            Apakah Anda yakin ingin menghapus meter ini? Data meter dan seluruh{" "}
            <strong>riwayat penggunaan</strong> akan dihapus permanen dari sistem.
          </>
        }
      />
    </Card>
  );
};

export const MeterManagement = () => {
  return (
    <MeterProvider>
      <MeterManagementContent />
    </MeterProvider>
  );
};
