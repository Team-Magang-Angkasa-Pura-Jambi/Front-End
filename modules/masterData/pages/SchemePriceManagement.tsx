"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, Landmark, Plus } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/common/components/table/dataTable";
import { DataTableRowActions } from "@/common/components/table/dataTableRowActions";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/common/components/ui/card";

import { PriceSchemeType, Tariff } from "@/common/types/schemaPrice";
import { PriceSchemeForm } from "../components/forms/priceSchema.form";
import { ConfirmDeleteDialog } from "../components/templates/ConfirmDeleteDialog";
import { MasterDataDialog } from "../components/templates/MasterDataDialog";
import { PageHeader } from "../components/templates/PageHeader";
import { usePriceSchemes } from "../hooks/usePriceSchemes";

const TariffsCell = ({ tariffs }: { tariffs: Tariff[] }) => {
  if (!tariffs || tariffs.length === 0)
    return <span className="text-muted-foreground text-xs italic">Belum diatur</span>;

  return (
    <div className="flex flex-col gap-1.5 py-1">
      {tariffs.map((t, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-4 border-b border-dashed pb-1 last:border-0 last:pb-0"
        >
          <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            {t.label}
          </span>
          <span className="text-primary font-mono text-xs font-bold">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 2,
            }).format(Number(t.value))}
            <span className="text-muted-foreground ml-1 text-[9px] font-normal italic">
              /{t.unit}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

const MeterSummaryCell = ({ row }: { row: Row<PriceSchemeType> }) => {
  const meterSummary = row.original.meter_summary || [];
  const totalMeters = row.original.total_meters || 0;

  if (meterSummary.length === 0) {
    return <span className="text-muted-foreground text-xs italic">-</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {meterSummary.slice(0, 3).map((name, i) => (
          <Badge key={i} variant="secondary" className="px-1.5 py-0 text-[9px]">
            {name}
          </Badge>
        ))}
      </div>
      {totalMeters > 3 && (
        <span className="text-muted-foreground pl-1 text-[10px] italic">
          +{totalMeters - 3} meter lainnya
        </span>
      )}
    </div>
  );
};

export const getPriceSchemeColumns = (
  onEdit: (item: PriceSchemeType) => void,
  onDelete: (item: PriceSchemeType) => void
): ColumnDef<PriceSchemeType>[] => [
  {
    accessorKey: "name",
    header: "Skema & Pembuat",
    cell: ({ row }) => (
      <div className="max-w-[220px]">
        <div className="text-primary text-sm leading-tight font-bold">{row.original.name}</div>
        <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
          Oleh: <span className="font-medium">{row.original.created_by || "-"}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "effective_date",
    header: "Efektif",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-xs">
        <Calendar className="text-muted-foreground h-3 w-3" />
        {row.original.effective_date
          ? format(new Date(row.original.effective_date), "dd MMM yyyy")
          : "-"}
      </div>
    ),
  },
  {
    id: "meters",
    header: "Meter Terhubung",
    cell: ({ row }) => <MeterSummaryCell row={row} />,
  },
  {
    accessorKey: "tariffs",
    header: "Detail Tarif",
    cell: ({ row }) => <TariffsCell tariffs={row.original.tariffs} />,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.is_active ? "default" : "secondary"}
        className="h-5 text-[9px] uppercase"
      >
        {row.original.is_active ? "Aktif" : "Non-Aktif"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
      </div>
    ),
  },
];

export const SchemePriceManagement = () => {
  const {
    data: schemes,
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
    isSaving,
    save,
    closeForm,
  } = usePriceSchemes();

  const columns = useMemo(
    () => getPriceSchemeColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <Card className="bg-background/50 overflow-hidden border-none shadow-xl shadow-slate-200/50 backdrop-blur">
        <CardHeader className="bg-muted/10 flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Data Skema Harga"
            description="Manajemen tarif dasar energi, periode efektif, dan rincian biaya pembacaan meter."
            icon={Landmark}
            iconClassName="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          />

          <MasterDataDialog
            isOpen={isFormOpen}
            onOpenChange={(open) => {
              if (!open) closeForm();
              else setIsFormOpen(true);
            }}
            triggerLabel="Tambah Skema"
            onTriggerClick={handleCreate}
            triggerIcon={<Plus className="mr-1.5 h-4 w-4" />}
            title={editingItem ? "Edit Skema Harga" : "Tambah Skema Harga Baru"}
            description="Atur parameter tarif berdasarkan jenis pembacaan meter dan tanggal efektif."
            maxWidth="xl"
          >
            <PriceSchemeForm
              initialData={editingItem}
              onSubmit={save as unknown as (payload: unknown) => void}
              isLoading={isSaving}
              // onCancel={closeForm}
            />
          </MasterDataDialog>
        </CardHeader>

        <CardContent className="pt-0">
          <DataTable
            columns={columns}
            data={schemes}
            isLoading={isLoading}
            filterColumnId="name"
            filterPlaceholder="Cari nama skema..."
          />
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Skema Harga"
        description={
          <>
            Apakah Anda yakin ingin menghapus skema <strong>{itemToDelete?.name}</strong>? Seluruh
            rincian tarif terkait akan dihapus permanen.
          </>
        }
      />
    </div>
  );
};
