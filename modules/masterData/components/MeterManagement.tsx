import { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { SubmitHandler } from "react-hook-form";
import { ColumnDef, Row } from "@tanstack/react-table";

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
import { DataTable } from "@/components/DataTable";

import { MeterForm } from "./forms/meter.form";
import { DataTableRowActions } from "./dataTableRowActions";

import { MeterType } from "@/common/types/meters";
import { ApiErrorResponse } from "@/common/types/api";
import { MeterFormValues } from "../schemas/meter.schema";
import {
  createMeterApi,
  deleteMeterApi,
  getMetersApi,
  updateMeterApi,
} from "../services/meter.service";

const MeterDescriptionCell = ({ row }: { row: Row<MeterType> }) => {
  const {
    tariff_group,
    tank_height_cm,
    tank_volume_liters,
    rollover_limit,
    energy_type,
  } = row.original;

  if (!tariff_group) return <span className="text-muted-foreground">-</span>;

  const isFuel = energy_type?.type_name?.toLowerCase() === "fuel";

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-2">
        <Badge variant="outline">Gol: {tariff_group.group_code}</Badge>
        <Badge variant="secondary">
          Faktor Kali: x{tariff_group.faktor_kali}
        </Badge>
      </div>

      {isFuel && tank_height_cm && tank_volume_liters && (
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            Tinggi: {tank_height_cm} cm
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Vol: {tank_volume_liters} L
          </Badge>
        </div>
      )}

      {rollover_limit && (
        <Badge
          variant="outline"
          className="bg-sky-50 text-sky-700 hover:bg-sky-50"
        >
          Rollover:{" "}
          {new Intl.NumberFormat("id-ID").format(Number(rollover_limit))}
        </Badge>
      )}
    </div>
  );
};

const MeterStatusCell = ({ status }: { status: string }) => {
  const variant =
    status === "Active"
      ? "default"
      : status === "Inactive"
      ? "secondary"
      : "destructive";

  return <Badge variant={variant}>{status}</Badge>;
};

export const createMeterColumns = (
  onEdit: (meter: MeterType) => void,
  onDelete: (meter: MeterType) => void
): ColumnDef<MeterType>[] => [
  { accessorKey: "meter_code", header: "Kode Meter" },
  { accessorKey: "category.name", header: "Lokasi" },
  { accessorKey: "energy_type.type_name", header: "Energi" },
  {
    header: "Keterangan",
    cell: ({ row }) => <MeterDescriptionCell row={row} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <MeterStatusCell status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

export const MeterManagement = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<MeterType | null>(null);
  const [meterToDelete, setMeterToDelete] = useState<MeterType | null>(null);

  const { data: metersResponse, isLoading } = useQuery({
    queryKey: ["meters"],
    queryFn: () => getMetersApi(),
    staleTime: 1000 * 60 * 5,
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
      if (editingMeter?.meter_id) {
        return updateMeterApi(editingMeter.meter_id, meterData);
      }
      return createMeterApi(meterData);
    },
    onSuccess: () => {
      const action = editingMeter ? "diperbarui" : "disimpan";
      toast.success(`Data meter berhasil ${action}!`);

      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setIsFormOpen(false);
      setEditingMeter(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat menyimpan.";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteMeter, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => deleteMeterApi(id),
    onSuccess: () => {
      toast.success("Meter berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setMeterToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat menghapus.";
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

  const columns = useMemo(
    () => createMeterColumns(handleEdit, handleDeleteRequest),
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          data={metersData}
          isLoading={isLoading}
          filterColumnId="meter_code"
          filterPlaceholder="Cari kode meter..."
        />
      </CardContent>

      <AlertDialog
        open={!!meterToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setMeterToDelete(null);
        }}
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
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (meterToDelete?.meter_id) {
                  deleteMeter(meterToDelete.meter_id);
                }
              }}
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
