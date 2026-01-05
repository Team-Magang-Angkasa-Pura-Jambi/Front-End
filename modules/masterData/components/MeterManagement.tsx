import { MoreHorizontal, PlusCircle } from "lucide-react";
import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Asumsi Anda menggunakan shadcn/ui untuk komponen ini
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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

import { Badge } from "@/components/ui/badge";
import { masterData } from "@/services/masterData.service";
import { DataTable } from "@/modules/UserManagement/components/DataTable";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import { MeterForm } from "./forms/meter.form";
import { MeterFormValues } from "../schemas/meter.schema";
import { SubmitHandler } from "react-hook-form";
import { DataTableRowActions } from "./dataTableRowActions";
import { getMetersApi } from "@/services/meter.service";
import { MeterType } from "@/common/types/meters";

export const createMeterColumns = (
  onEdit: (meter: MeterType) => void,
  onDelete: (meter: MeterType) => void
): ColumnDef<MeterType>[] => [
  { accessorKey: "meter_code", header: "Kode Meter" },
  { accessorKey: "category.name", header: "Lokasi" },
  { accessorKey: "energy_type.type_name", header: "Energi" },
  {
    header: "Keterangan",
    cell: ({ row }) => {
      const { tariff_group } = row.original;
      const { tank_height_cm } = row.original;
      const { tank_volume_liters } = row.original;
      const { rollover_limit } = row.original;
      const isFuel =
        row.original.energy_type.type_name.toLowerCase() === "fuel";
      if (!tariff_group) return "-";
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="outline">Gol: {tariff_group.group_code}</Badge>
          <Badge variant="secondary">
            Faktor Kali: x{tariff_group.faktor_kali}
          </Badge>
          {isFuel && tank_height_cm && tank_volume_liters ? (
            <>
              <Badge variant="secondary">Tinggi: {tank_height_cm} cm,</Badge>
              <Badge variant="secondary">Volume: {tank_volume_liters} L</Badge>
            </>
          ) : null}
          {rollover_limit && (
            <Badge variant="outline" className="bg-sky-100 text-sky-800">
              Rollover: {new Intl.NumberFormat("id-ID").format(rollover_limit)}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === "Active"
          ? "default"
          : status === "Inactive"
          ? "secondary"
          : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions
          row={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];

export const MeterManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<MeterType | null>(null);
  const [meterToDelete, setMeterToDelete] = useState<MeterType | null>(null);

  const {
    data: metersResponse,
    isLoading,
    isError,  
  } = useQuery({
    queryKey: ["meters"],
    queryFn: () => getMetersApi(),
    refetchOnWindowFocus: false,
  });

  const metersData = useMemo(
    () => metersResponse?.data || [],
    [metersResponse?.data]
  );

  const { mutate: createOrUpdateMeter, isPending: isMutating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    MeterFormValues
  >({
    mutationFn: (meterData) => {
      const id = editingMeter ? editingMeter.meter_id : undefined;
      return id
        ? masterData.meter.update(id, meterData)
        : masterData.meter.create(meterData);
    },
    onSuccess: () => {
      toast.success(
        `Data meter berhasil ${editingMeter ? "diperbarui" : "disimpan"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setIsFormOpen(false);
      setEditingMeter(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteMeter, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    MeterType
  >({
    mutationFn: (meter) => masterData.meter.delete(meter.meter_id),
    onSuccess: () => {
      toast.success("Meter berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setMeterToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan tidak terduga.";
      toast.error(message);
    },
  });

  const handleEdit = (meter: MeterType) => {
    setEditingMeter(meter);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (meter: MeterType) => {
    setMeterToDelete(meter);
  };

  const handleFormSubmit: SubmitHandler<MeterFormValues> = (data) => {
    createOrUpdateMeter(data);
  };

  const columns = createMeterColumns(handleEdit, handleDeleteRequest);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Daftar Meter</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data meter di sistem.
            </CardDescription>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingMeter(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingMeter(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Meter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMeter ? "Edit Meter" : "Tambah Meter Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail meter di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <MeterForm
                initialData={editingMeter}
                onSubmit={handleFormSubmit}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable<MeterType, unknown>
          columns={columns}
          data={metersData ?? []}
          isLoading={isLoading}
          filterColumnId="meter_code"
          filterPlaceholder="Cari kode meter..."
        />
      </CardContent>
      <AlertDialog
        open={!!meterToDelete}
        onOpenChange={() => setMeterToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus meter{" "}
              <span className="font-bold">{meterToDelete?.meter_code}</span>.
              Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMeter(meterToDelete!)}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
