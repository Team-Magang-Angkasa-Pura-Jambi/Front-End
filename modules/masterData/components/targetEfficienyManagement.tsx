import { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { AxiosError } from "axios";
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
import { DataTable } from "@/components/table/dataTable";

import { TargetEfficiencyForm } from "./forms/targetEfficiency.form";

import { ApiErrorResponse } from "@/common/types/api";
import { MeterType } from "@/common/types/meters";
import { EnergyType } from "@/common/types/energy";
import { TargetEfficiencyFormValues } from "../schemas/targetEfficiency.schema";
import {
  createEfficiencyTargetApi,
  deleteEfficiencyTargetApi,
  getEfficiencyTargetsApi,
  updateEfficiencyTargetApi,
} from "../services/targetEfficiency.service";
import { EfficiencyTarget } from "@/common/types/efficiencyTarget";
import { DataTableRowActions } from "@/components/table/dataTableRowActions";

const TargetValueCell = ({ row }: { row: Row<EfficiencyTarget> }) => {
  const unit = row.original.meter?.energy_type?.unit_of_measurement || "%";
  return (
    <span className="font-medium">
      {row.original.target_value} {unit}
    </span>
  );
};

const TargetCostCell = ({ value }: { value: number }) => {
  return (
    <span className="font-mono">
      {new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value)}
    </span>
  );
};

const DateCell = ({ dateString }: { dateString: string }) => {
  if (!dateString) return <span>-</span>;
  return <span>{format(new Date(dateString), "dd MMMM yyyy")}</span>;
};

export const createTargetEfficiencyColumns = (
  onEdit: (item: EfficiencyTarget) => void,
  onDelete: (item: EfficiencyTarget) => void
): ColumnDef<EfficiencyTarget>[] => [
  { accessorKey: "kpi_name", header: "Nama KPI" },
  {
    accessorKey: "target_value",
    header: "Target Konsumsi",
    cell: ({ row }) => <TargetValueCell row={row} />,
  },
  {
    accessorKey: "target_cost",
    header: "Target Biaya",
    cell: ({ row }) => <TargetCostCell value={row.original.target_cost} />,
  },
  {
    accessorKey: "meter.meter_code",
    header: "Kode Meter",
  },
  {
    accessorKey: "period_start",
    header: "Mulai",
    cell: ({ row }) => <DateCell dateString={row.original.period_start} />,
  },
  {
    accessorKey: "period_end",
    header: "Selesai",
    cell: ({ row }) => <DateCell dateString={row.original.period_end} />,
  },
  {
    accessorKey: "set_by_user.username",
    header: "Dibuat Oleh",
    cell: ({ row }) => row.original.set_by_user?.username || "-",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

export const TargetEfficiencyManagement = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<EfficiencyTarget | null>(
    null
  );
  const [targetToDelete, setTargetToDelete] = useState<EfficiencyTarget | null>(
    null
  );

  const { data: targetsResponse, isLoading } = useQuery({
    queryKey: ["efficiencyTargets"],
    queryFn: () => getEfficiencyTargetsApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const targetsData = useMemo(
    () => targetsResponse?.data || [],
    [targetsResponse?.data]
  );

  const { mutate: createOrUpdateTarget, isPending: isMutating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    TargetEfficiencyFormValues
  >({
    mutationFn: (formData) => {
      const payload = {
        ...formData,
        period_start: format(formData.period_start, "yyyy-MM-dd"),
        period_end: format(formData.period_end, "yyyy-MM-dd"),
      };

      if (editingTarget?.target_id) {
        return updateEfficiencyTargetApi(editingTarget.target_id, payload);
      }
      return createEfficiencyTargetApi(payload);
    },
    onSuccess: () => {
      const action = editingTarget ? "diperbarui" : "disimpan";
      toast.success(`Target efisiensi berhasil ${action}!`);

      queryClient.invalidateQueries({ queryKey: ["efficiencyTargets"] });
      setIsFormOpen(false);
      setEditingTarget(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat menyimpan.";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteTarget, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => deleteEfficiencyTargetApi(id),
    onSuccess: () => {
      toast.success("Target efisiensi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["efficiencyTargets"] });
      setTargetToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Gagal menghapus target.";
      toast.error(message);
    },
  });

  const handleEdit = (target: EfficiencyTarget) => {
    setEditingTarget(target);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (target: EfficiencyTarget) => {
    setTargetToDelete(target);
  };

  const columns = useMemo(
    () => createTargetEfficiencyColumns(handleEdit, handleDeleteRequest),
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Manajemen Target Efisiensi</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data target efisiensi dan biaya.
            </CardDescription>
          </div>

          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingTarget(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTarget(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Target
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTarget ? "Edit Target" : "Tambah Target Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail target efisiensi di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <TargetEfficiencyForm
                initialData={editingTarget}
                onSubmit={(values) => createOrUpdateTarget(values)}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable<EfficiencyTarget, unknown>
          columns={columns}
          data={targetsData}
          isLoading={isLoading}
          filterColumnId="kpi_name"
          filterPlaceholder="Cari nama KPI..."
        />
      </CardContent>

      <AlertDialog
        open={!!targetToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTargetToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus target{" "}
              <span className="font-bold">{targetToDelete?.kpi_name}</span>.
              Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (targetToDelete?.target_id) {
                  deleteTarget(targetToDelete.target_id);
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
