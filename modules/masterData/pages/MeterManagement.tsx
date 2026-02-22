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
import { DialogAction } from "../components/molecules/AlertDialog";
import { MasterDataDialog } from "../components/molecules/MasterDataDialog";
import { MeterHeader } from "../components/molecules/MeterHeader";
import { MetersCard } from "../components/molecules/MetersCard";
import { SearchBar } from "../components/molecules/SearchBar";
import { MeterForm } from "../components/organisms/meter.form";
import { MeterProvider, useMeter } from "../context/MeterContext";
import { SentinelAuditLog } from "../schemas/SentinelAuditLog";

const MeterManagementContent = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false); // State untuk modal log

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    isFormOpen,
    setIsFormOpen,
    filteredMeters,
    isLoading,
    searchQuery,
    isDetailOpen,
    setIsDetailOpen,
    selectedMeterId,
    setSelectedMeterId,
    handleCloseForm,
    handleUpsert,
    isMutating,
  } = useMeter();

  return (
    <Card className="bg-background/50 border-none shadow-sm">
      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-y-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <MeterHeader />

          <div className="flex items-center gap-2">
            {/* IMPLEMENTASI AUDIT LOG DI SINI */}
            <MasterDataDialog
              isOpen={isLogOpen}
              onOpenChange={setIsLogOpen}
              triggerLabel="Riwayat"
              triggerIcon={<History className="mr-1.5 h-4 w-4" />}
              triggerClassName="bg-slate-800 hover:bg-slate-900 text-white"
              title="Audit Log Perangkat Meter"
              description="Menampilkan jejak audit perubahan konfigurasi pada sistem meter Bandara Sultan Thaha."
              maxWidth="2xl"
            >
              <SentinelAuditLog entityTable="Meter" height="h-[65vh]" />
            </MasterDataDialog>

            {/* Dialog Form Tambah Meter */}
            <MasterDataDialog
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
              onTriggerClick={handleCloseForm}
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
        <AnimatePresence mode="popLayout" initial={false}>
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-muted/5 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
            >
              <Search className="text-muted-foreground mb-4 h-8 w-8" />
              <h3 className="font-semibold">Data tidak ditemukan</h3>
            </motion.div>
          ) : (
            <motion.div
              key="meter-list-container"
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
                    hidden: { opacity: 0, scale: 0.8, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 },
                  }}
                >
                  <MetersCard meter={meter} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Detail Sheet Tetap Sama */}
      <Sheet
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedMeterId(null);
        }}
      >
        <SheetContent className="w-[90vw] overflow-y-auto p-0 sm:max-w-xl">
          <AnimatePresence>
            {isDetailOpen && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="flex h-full flex-col"
              >
                <div className="bg-muted/10 border-b px-6 py-6">
                  <SheetHeader>
                    <SheetTitle className="text-xl font-bold">Detail Perangkat</SheetTitle>
                    <SheetDescription>
                      Informasi teknis dan status operasional meter.
                    </SheetDescription>
                  </SheetHeader>
                </div>

                <div className="flex-1 p-6">
                  {selectedMeterId ? (
                    <MeterDetailSheet meterId={selectedMeterId} />
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>

      <DialogAction />
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
