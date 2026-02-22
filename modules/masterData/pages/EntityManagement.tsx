"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Location } from "@/common/types/location";
import { Tenant } from "@/common/types/tenant";
import { AlertTriangle, Building2, MapPin, Plus } from "lucide-react";
import { LocationTable } from "../components/molecules/LocationTable";
import { MasterDataDialog } from "../components/molecules/MasterDataDialog";
import { TenantTable } from "../components/molecules/TenantTable";
import { LocationForm } from "../components/organisms/LocationForm";
import { TenantForm } from "../components/organisms/TenantForm";
import { useEntityManager } from "../hooks/useEntityManagement";

export const EntityManagement = () => {
  // Gunakan Generic secara eksplisit agar hook tahu tipe datanya
  const tenant = useEntityManager<Tenant>("tenant");
  const location = useEntityManager<Location>("location");

  // Helper untuk delete dialog
  const activeDeleteManager = tenant.isDeletingId
    ? tenant
    : location.isDeletingId
      ? location
      : null;

  const deleteTypeLabel = tenant.isDeletingId ? "Tenant" : "Lokasi";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Manajemen Entitas
        </h2>
        <p className="text-muted-foreground text-sm">
          Kelola aset strategis Sultan Thaha: Profil Mitra Tenant dan Struktur Hirarki Lokasi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Building2 className="text-primary h-5 w-5" /> Mitra Tenant
              </CardTitle>
              <CardDescription>Daftar vendor dan unit bisnis aktif.</CardDescription>
            </div>
            <MasterDataDialog
              isOpen={tenant.isOpen}
              onOpenChange={tenant.setIsOpen}
              triggerLabel="Tambah"
              triggerIcon={<Plus size={16} />}
              title={tenant.editingData ? "Edit Tenant" : "Tenant Baru"}
            >
              <TenantForm
                // Gunakan casting atau kurung untuk menangani null vs undefined
                initialData={tenant.editingData || undefined}
                onSubmit={tenant.handleUpsert}
                isLoading={tenant.isMutating}
              />
            </MasterDataDialog>
          </CardHeader>
          <CardContent>
            <TenantTable
              // Paksa tipe ke Tenant[] untuk menghindari kebingungan Union
              data={tenant.data as Tenant[]}
              isLoading={tenant.isLoading}
              onEdit={tenant.setEditingData}
              onDelete={tenant.setIsDeletingId}
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <MapPin className="text-primary h-5 w-5" /> Struktur Lokasi
              </CardTitle>
              <CardDescription>Hirarki area terminal dan gerbang.</CardDescription>
            </div>
            <MasterDataDialog
              isOpen={location.isOpen}
              onOpenChange={location.setIsOpen}
              triggerLabel="Tambah"
              triggerIcon={<Plus size={16} />}
              title={location.editingData ? "Edit Lokasi" : "Lokasi Baru"}
            >
              <LocationForm
                // Gunakan casting atau kurung untuk menangani null vs undefined
                initialData={location.editingData || undefined}
                onSubmit={location.handleUpsert}
                isLoading={location.isMutating}
              />
            </MasterDataDialog>
          </CardHeader>
          <CardContent>
            <LocationTable
              // Paksa tipe ke Location[] untuk menghindari kebingungan Union
              data={location.data as Location[]}
              isLoading={location.isLoading}
              onEdit={location.setEditingData}
              onDelete={location.setIsDeletingId}
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!activeDeleteManager}
        onOpenChange={(open) => !open && activeDeleteManager?.setIsDeletingId(null)}
      >
        <AlertDialogContent className="border-t-4 border-t-red-500">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle>Hapus Data {deleteTypeLabel}?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Tindakan ini bersifat permanen dan dapat memengaruhi relasi meter yang terhubung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={activeDeleteManager?.isDeleting}
              onClick={(e) => {
                e.preventDefault();
                activeDeleteManager?.executeDelete();
              }}
            >
              {activeDeleteManager?.isDeleting ? "Menghapus..." : "Ya, Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
