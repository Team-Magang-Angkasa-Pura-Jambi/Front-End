import { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ColumnDef, Row } from "@tanstack/react-table";
import { AxiosError } from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/common/components/ui/dialog";
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
import { Badge } from "@/common/components/ui/badge";
import { DataTable } from "@/common/components/table/dataTable";

import { PriceSchemeForm } from "./forms/priceSchema.form";

import { ReadingType } from "@/common/types/readingTypes";
import { ApiErrorResponse } from "@/common/types/api";
import { PriceSchemeType } from "@/common/types/schemaPrice";
import {
  createPriceSchemeApi,
  deletePriceSchemeApi,
  getPriceSchemesApi,
  updatePriceSchemeApi,
} from "../services/priceSchema.service";
import { getReadingTypesApi } from "../services/readingsType.service";
import { getTaxesApi } from "../services/tax.service";
import { schemaFormValues } from "../schemas/schemaPrice.schema";
import { DataTableRowActions } from "@/common/components/table/dataTableRowActions";

const RatesCell = ({
  row,
  readingTypes,
}: {
  row: Row<PriceSchemeType>;
  readingTypes: ReadingType[];
}) => {
  const rates = row.original.rates;
  if (!rates || rates.length === 0)
    return <span className="text-muted-foreground">-</span>;

  const getReadingTypeName = (id: number) => {
    return (
      readingTypes.find((rt) => rt.reading_type_id === id)?.type_name ||
      `ID ${id}`
    );
  };

  return (
    <div className="flex flex-col gap-1">
      {rates.map((rate) => (
        <div key={rate.rate_id} className="flex justify-between gap-2 text-xs">
          <span className="text-muted-foreground">
            {getReadingTypeName(rate.reading_type_id)}:
          </span>
          <span className="font-mono font-medium whitespace-nowrap">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(parseFloat(String(rate.value)))}
          </span>
        </div>
      ))}
    </div>
  );
};

const TaxesCell = ({ row }: { row: Row<PriceSchemeType> }) => {
  const taxes = row.original.taxes;

  if (!Array.isArray(taxes) || taxes.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {taxes.map((item, index) => {
        const rawRate = item.tax.rate ?? 0;

        let rateValue = Number(rawRate);

        if (isNaN(rateValue)) {
          rateValue = 0;
        }

        const taxName = item.tax_name ?? "Pajak";

        return (
          <Badge
            key={item.tax_id || index}
            variant="outline"
            className="text-xs"
          >
            {taxName} (
            {new Intl.NumberFormat("id-ID", {
              style: "percent",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(rateValue)}
            )
          </Badge>
        );
      })}
    </div>
  );
};

export const createPriceSchemeColumns = (
  onEdit: (item: PriceSchemeType) => void,
  onDelete: (item: PriceSchemeType) => void,
  readingTypes: ReadingType[] = []
): ColumnDef<PriceSchemeType>[] => [
  { accessorKey: "scheme_name", header: "Nama Skema" },
  { accessorKey: "tariff_group.group_code", header: "Golongan" },
  {
    accessorKey: "effective_date",
    header: "Tanggal Efektif",
    cell: ({ row }) => {
      const date = row.original.effective_date;
      return date ? format(new Date(date), "dd MMM yyyy") : "-";
    },
  },
  {
    accessorKey: "rates",
    header: "Tarif Detil",
    cell: ({ row }) => <RatesCell row={row} readingTypes={readingTypes} />,
  },
  {
    accessorKey: "taxes",
    header: "Pajak",
    cell: ({ row }) => <TaxesCell row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];

export const SchemePriceManagement = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<PriceSchemeType | null>(
    null
  );
  const [schemeToDelete, setSchemeToDelete] = useState<PriceSchemeType | null>(
    null
  );

  const { data: schemesResponse, isLoading } = useQuery({
    queryKey: ["priceSchemes"],
    queryFn: () => getPriceSchemesApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: readingTypesResponse } = useQuery({
    queryKey: ["readingTypes"],
    queryFn: () => getReadingTypesApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: taxesResponse } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => getTaxesApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const schemes = useMemo(
    () => schemesResponse?.data || [],
    [schemesResponse?.data]
  );
  const readingTypes = useMemo(
    () => readingTypesResponse?.data || [],
    [readingTypesResponse?.data]
  );
  const allTaxes = useMemo(
    () => taxesResponse?.data || [],
    [taxesResponse?.data]
  );

  const { mutate: createOrUpdateScheme, isPending: isMutating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    schemaFormValues
  >({
    mutationFn: (data) => {
      if (editingScheme?.scheme_id) {
        return updatePriceSchemeApi(editingScheme.scheme_id, data);
      }
      return createPriceSchemeApi(data);
    },
    onSuccess: () => {
      const action = editingScheme ? "diperbarui" : "disimpan";
      toast.success(`Skema harga berhasil ${action}!`);

      queryClient.invalidateQueries({ queryKey: ["priceSchemes"] });
      setIsFormOpen(false);
      setEditingScheme(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Terjadi kesalahan.";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteScheme, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => deletePriceSchemeApi(id),
    onSuccess: () => {
      toast.success("Skema harga berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["priceSchemes"] });
      setSchemeToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Gagal menghapus data.";
      toast.error(message);
    },
  });

  const handleEdit = (scheme: PriceSchemeType) => {
    setEditingScheme(scheme);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (scheme: PriceSchemeType) => {
    setSchemeToDelete(scheme);
  };

  const columns = useMemo(
    () =>
      createPriceSchemeColumns(handleEdit, handleDeleteRequest, readingTypes),
    [readingTypes]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Manajemen Skema Harga</CardTitle>
            <CardDescription>
              Atur tarif dasar, golongan, dan pajak untuk penagihan.
            </CardDescription>
          </div>

          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingScheme(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingScheme(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Skema
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingScheme
                    ? "Edit Skema Harga"
                    : "Tambah Skema Harga Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail skema harga, tarif per tipe pembacaan, dan pajak
                  terkait.
                </DialogDescription>
              </DialogHeader>
              <PriceSchemeForm
                initialData={editingScheme}
                onSubmit={(values) => createOrUpdateScheme(values)}
                isLoading={isMutating}
                readingTypes={readingTypes}
                taxes={allTaxes}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable<PriceSchemeType, unknown>
          columns={columns}
          data={schemes ?? []}
          isLoading={isLoading}
          filterColumnId="scheme_name"
          filterPlaceholder="Cari nama skema..."
        />
      </CardContent>

      <AlertDialog
        open={!!schemeToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSchemeToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus skema harga{" "}
              <span className="font-bold">{schemeToDelete?.scheme_name}</span>.
              Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (schemeToDelete?.scheme_id) {
                  deleteScheme(schemeToDelete.scheme_id);
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
