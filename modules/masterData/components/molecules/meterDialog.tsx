import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useMeter } from "../../context/MeterContext";
import { MeterForm } from "../organisms/meter.form";

export const MeterDialog = () => {
  // PENTING: createOrUpdateMeter harus diambil dari context agar bisa dipakai di onSubmit
  const {
    isFormOpen,
    setIsFormOpen,
    isMutating,
    selectedMeterId,
    setSelectedMeterId,
    handleUpsert,
  } = useMeter();

  return (
    <Dialog
      open={isFormOpen}
      onOpenChange={(open) => {
        setIsFormOpen(open);
        // Membersihkan state ID saat dialog ditutup agar tidak nyangkut saat buka "Tambah Baru"
        if (!open) setSelectedMeterId(null);
      }}
    >
      <DialogTrigger asChild>
        <Button className="shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Meter
        </Button>
      </DialogTrigger>

      <DialogContent className="h-[95vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] lg:max-w-6xl">
        <div className="bg-background flex h-full flex-col overflow-hidden rounded-lg border shadow-lg">
          {/* Header Section */}
          <div className="bg-muted/20 shrink-0 border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {selectedMeterId ? "Edit Konfigurasi Meter" : "Registrasi Meter Baru"}
              </DialogTitle>
              <DialogDescription>
                Lengkapi informasi identitas, profil tangki, dan ambang batas alarm perangkat.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Section - Tambahkan overflow-y-auto di sini agar header tetap sticky di atas */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
            <MeterForm
              initialData={selectedMeterId ?? undefined}
              onSubmit={handleUpsert}
              isLoading={isMutating}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
