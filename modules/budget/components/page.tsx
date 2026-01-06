"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  MoreHorizontal,
  PlusCircle,
  Landmark,
  ChevronDown,
  ChevronRight,
  DollarSign,
  TrendingUp,
  CornerDownRight,
  RefreshCw,
  Loader2,
  XCircle,
  TrendingDown,
  Copy,
  Zap,
  Droplets,
  Fuel,
} from "lucide-react";
import { format } from "date-fns-tz";

import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnnualBudget,
  annualBudgetFormSchema,
  AnnualBudgetFormValues,
  processBudgetFormSchema,
  ProcessBudgetFormValues,
} from "../types";
import { budgetApi } from "@/services/budget.service";
import { annualBudgetApi } from "@/services/annualBudget.service";
import { getEnergyTypesApi, EnergyType } from "@/services/energyType.service";
import {
  getMetersApi,
  MeterType,
} from "@/modules/masterData/services/meter.service";
import { getprepareNextPeriodBudgetApi } from "@/services/analysis.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/formatCurrency";
import { BudgetSummaryCarousel } from "./BudgetSummaryCarousel";
import BudgetPreview from "./BudgetPreview";
import { MonthlyUsageDetails } from "./MonthlyUsageDetails";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  getRowCanExpand: (row: Row<TData>) => boolean;
  renderSubComponent: (props: { row: Row<TData> }) => React.ReactElement;
}

function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  getRowCanExpand,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const [expanded, setExpanded] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    getRowCanExpand,
    state: {
      expanded,
    },
  });

  const TableSkeleton = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {columns.map((col, j) => (
          <TableCell key={j}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <DataTableRows
                table={table}
                columns={columns}
                renderSubComponent={renderSubComponent}
              />
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

function DataTableRows({ table, columns, renderSubComponent }) {
  return table.getRowModel().rows?.length ? (
    table.getRowModel().rows.map((row) => (
      <React.Fragment key={row.id}>
        <TableRow data-state={row.getIsSelected() && "selected"}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
        {row.getIsExpanded() && (
          <TableRow>
            <TableCell colSpan={row.getVisibleCells().length}>
              {renderSubComponent({ row })}
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        Tidak ada data.
      </TableCell>
    </TableRow>
  );
}

function DataTablePagination({ table }) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Sebelumnya
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Berikutnya
      </Button>
    </div>
  );
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
}: {
  row: Row<TData>;
  onEdit: (data: TData) => void;
  onDelete: (data: TData) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(row.original)}>
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
// --- Definisi Kolom Tabel Internal ---
const getColumns = (
  onEdit: (budget: AnnualBudget) => void,
  onDelete: (budget: AnnualBudget) => void
): ColumnDef<AnnualBudget>[] => [
  // Kolom untuk tombol expand/collapse
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: "period_start",
    header: "Periode",
    cell: ({ row }) => {
      const isChild = !!row.original.parent_budget_id;
      const startDate = format(new Date(row.original.period_start), "d LLL y");
      const endDate = format(new Date(row.original.period_end), "d LLL y");

      return (
        <div className={cn("flex items", isChild && "pl-4")}>
          {isChild && (
            <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <span>{`${startDate} - ${endDate}`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "total_budget",
    header: "Total Budget",
    cell: ({ row }) => (
      <div>{formatCurrency(parseFloat(row.getValue("total_budget")))}</div>
    ),
  },
  {
    accessorKey: "efficiency_tag",
    header: "Efficiency Tag",
    cell: ({ row }) => {
      const value = row.getValue("efficiency_tag");
      return value ? `${(value * 100).toFixed(0)}%` : "-";
    },
  },
  {
    accessorKey: "energy_type.type_name",
    header: "Tipe Energi",
    cell: ({ row }) => {
      // Menggunakan optional chaining untuk keamanan
      const energyType = row.original.energy_type;
      if (!energyType) return "-";

      const { type_name } = energyType;
      let icon;
      let text;

      switch (type_name) {
        case "Electricity":
          icon = <Zap className="h-4 w-4 mr-2 text-yellow-500" />;
          text = "Listrik";
          break;
        case "Water":
          icon = <Droplets className="h-4 w-4 mr-2 text-blue-500" />;
          text = "Air";
          break;
        case "Fuel":
          icon = <Fuel className="h-4 w-4 mr-2 text-gray-500" />;
          text = "BBM";
          break;
        default:
          icon = null;
          text = type_name;
      }

      return (
        <div className="flex items-center">
          {icon}
          <span>{text}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
// --- Akhir Definisi Kolom Tabel Internal ---

export default function AnnualBudgetPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<AnnualBudget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<AnnualBudget | null>(
    null
  );
  const [budgetType, setBudgetType] = useState<"parent" | "child">("parent");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // State untuk konfirmasi proses ulang
  const [processToConfirm, setProcessToConfirm] = useState(false);

  const form = useForm<AnnualBudgetFormValues>({
    resolver: zodResolver(annualBudgetFormSchema),
    defaultValues: {
      budgetType: "parent",
      total_budget: 0,
      efficiency_tag: 0,
      allocations: [],
      parent_budget_id: null,
      energy_type_id: undefined,
    },
  });

  const processForm = useForm<ProcessBudgetFormValues>({
    resolver: zodResolver(processBudgetFormSchema),
    defaultValues: {
      pjj_rate: 0.85, // Default 85%
      process_date: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allocations",
  });

  // "Awasi" perubahan pada field alokasi untuk mendapatkan ID meter yang sudah dipilih
  const allocationValues = useWatch({
    control: form.control,
    name: "allocations",
  });
  const selectedMeterIds = (allocationValues || []).map(
    (alloc) => alloc?.meter_id
  );
  const currentBudgetType = useWatch({
    control: form.control,
    name: "budgetType",
  });

  // "Awasi" perubahan pada energy_type_id untuk memicu query ulang meter
  const selectedEnergyTypeId = useWatch({
    control: form.control,
    name: "energy_type_id",
  });

  // Ambil data semua Tipe Energi untuk dropdown
  const { data: energyTypesResponse, isLoading: isLoadingEnergyTypes } =
    useQuery({
      queryKey: ["energyTypes"],
      queryFn: () => getEnergyTypesApi(),
    });
  const energyTypes: EnergyType[] = energyTypesResponse?.data || [];

  // Cari nama tipe energi yang dipilih untuk digunakan sebagai parameter query meter
  const selectedEnergyTypeName = useMemo(() => {
    return energyTypes.find((et) => et.energy_type_id === selectedEnergyTypeId)
      ?.type_name;
  }, [selectedEnergyTypeId, energyTypes]);

  // Ambil data meter untuk dropdown alokasi, difilter berdasarkan tipe energi yang dipilih
  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["meters", selectedEnergyTypeName],
    queryFn: () => getMetersApi(selectedEnergyTypeName),
    // Query hanya akan berjalan jika typeName sudah ditemukan
    enabled: !!selectedEnergyTypeName,
  });
  const meters: MeterType[] = metersResponse?.data || [];

  // Watch total_budget untuk pratinjau
  const totalBudget = useWatch({ control: form.control, name: "total_budget" });
  const monthlyPreview = totalBudget > 0 ? totalBudget / 12 : 0;
  const { data: budgetsResponse, isLoading } = useQuery({
    queryKey: ["annualBudgets"],
    queryFn: annualBudgetApi.getParents,
  });

  const { data: childBudgetsResponse, isLoading: isLoadingChildBudget } =
    useQuery({
      queryKey: ["childAnnualBudgets"],
      queryFn: annualBudgetApi.getAll,
    });

  const parentBudgetId = useWatch({
    control: form.control,
    name: "parent_budget_id",
  });

  const { data: prepareNextPeriodBudget, isLoading: isLoadingPrepareBudget } =
    useQuery({
      queryKey: ["prepareNextPeriodBudget", parentBudgetId],
      queryFn: () => getprepareNextPeriodBudgetApi(parentBudgetId as number),
      enabled: !!parentBudgetId && budgetType === "child",
    });
  const masterData = budgetsResponse?.data || [];
  const childData = childBudgetsResponse?.data || [];

  const parentBudgets = masterData;

  const handleOpenDialog = (budget: AnnualBudget | null = null) => {
    const isEditingChild = budget && budget.parent_budget_id;
    setBudgetType(isEditingChild ? "child" : "parent");
    setEditingBudget(budget);
    if (budget) {
      form.reset({
        ...budget,
        period_start: new Date(budget.period_start),
        period_end: new Date(budget.period_end),
        parent_budget_id: budget.parent_budget_id,
        energy_type_id: budget.energy_type?.energy_type_id,
        budgetType: isEditingChild ? "child" : "parent",
        allocations: budget.allocations || [],
      });
    } else {
      form.reset({
        total_budget: 0,
        efficiency_tag: 0,
        period_start: undefined,
        period_end: undefined,
        allocations: [],
        budgetType: "parent",
        energy_type_id: undefined,
        parent_budget_id: null,
      });
      form.setValue("budgetType", "parent"); // Set tipe default saat tambah baru
    }
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (budget: AnnualBudget) => {
    setBudgetToDelete(budget);
  };

  const handleProcessRequest = () => {
    setProcessToConfirm(true);
  };

  const createOrUpdateMutation = useMutation({
    mutationFn: (originalValues: AnnualBudgetFormValues) => {
      // Membersihkan dan memformat data sebelum dikirim ke API
      const cleanedValues: Partial<AnnualBudgetFormValues> = {
        ...originalValues,
        period_start: format(originalValues.period_start, "yyyy-MM-dd", {
          timeZone: "UTC",
        }),
        period_end: format(originalValues.period_end, "yyyy-MM-dd", {
          timeZone: "UTC",
        }),
      };

      // Hapus budgetType karena tidak diperlukan oleh backend
      delete cleanedValues.budgetType;
      const values = cleanedValues as AnnualBudgetFormValues;

      if (editingBudget) {
        return annualBudgetApi.update(editingBudget.budget_id, values);
      }
      return annualBudgetApi.create(values);
    },
    onSuccess: () => {
      toast.success(
        `Budget berhasil ${editingBudget ? "diperbarui" : "dibuat"}.`
      );
      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });
      setIsDialogOpen(false);
      setEditingBudget(null);
    },
    onError: (error) => {
      toast.error("Gagal menyimpan budget.", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => annualBudgetApi.delete(id),
    onSuccess: () => {
      toast.success("Budget berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["annualBudgets"] });
      setBudgetToDelete(null);
    },
    onError: (error) => {
      toast.error("Gagal menghapus budget.", { description: error.message });
    },
  });

  const processMutation = useMutation({
    mutationFn: (payload: ProcessBudgetFormValues) =>
      budgetApi.process(payload),
    onSuccess: () => {
      toast.success("Proses kalkulasi ulang budget berhasil dipicu.", {
        description: "Target harian akan segera diperbarui.",
      });
      setProcessToConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["budgetAllocation"] });
    },
    onError: (error) => {
      toast.error("Gagal memicu proses.", { description: error.message });
      setProcessToConfirm(false);
    },
  });

  const onSubmit = async (values: AnnualBudgetFormValues) => {
    createOrUpdateMutation.mutate(values);
  };

  const onInvalid = (errors: any) => {
    console.error("Form validation failed:", errors);
    toast.error("Validasi Gagal", {
      description:
        "Silakan periksa kembali field yang Anda isi. Detail error ada di console (F12).",
    });
  };

  const onProcessSubmit = (values: ProcessBudgetFormValues) => {
    processMutation.mutate(values);
  };

  const columns = useMemo(
    () => getColumns(handleOpenDialog, handleDeleteRequest),
    []
  );
  // Filter masterData untuk hanya menampilkan anggaran induk (parent)

  useEffect(() => {
    // Reset parent_budget_id jika tipe budget diubah ke 'parent'
    if (budgetType === "parent") {
      form.setValue("parent_budget_id", null);
      form.setValue("allocations", []);
    }
  }, [budgetType, form]);
  useEffect(() => {
    if (!processToConfirm) {
      processForm.reset({
        pjj_rate: 0.85,
        process_date: new Date(),
      });
    }
  }, [processToConfirm, processForm]);

  useEffect(() => {
    if (budgetType === "child" && parentBudgetId) {
      const selectedParent = parentBudgets.find(
        (p) => p.budget_id === parentBudgetId
      );
      if (
        selectedParent &&
        selectedParent.energy_type?.energy_type_id !==
          form.getValues("energy_type_id")
      ) {
        form.setValue(
          "energy_type_id",
          selectedParent.energy_type.energy_type_id
        );
      }
    }
  }, [parentBudgetId, budgetType, parentBudgets, form]);

  return (
    <div className="container mx-auto py-10">
      {/* --- Bagian Ringkasan & Analisis --- */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ringkasan & Analisis Budget</h2>
          <div className="flex items-center gap-2">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - 5 + i
                ).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleProcessRequest}>
              <RefreshCw className="mr-2 h-4 w-4" /> Proses Ulang
            </Button>
          </div>
        </div>

        <BudgetSummaryCarousel />
      </div>

      {/* --- Bagian Master Data Budget Tahunan --- */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Budget Tahunan</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Budget
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={childData}
        isLoading={isLoading}
        getRowCanExpand={() => true}
        renderSubComponent={({ row }) => (
          <MonthlyUsageDetails annualBudget={row.original} />
        )}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Edit" : "Tambah"} Budget
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              className="space-y-4"
            >
              <ScrollArea className="max-h-[70vh] overflow-y-auto p-4 -m-4">
                <div className="space-y-6 p-4">
                  <div className="col-span-2 space-y-2">
                    <FormLabel>Tipe Anggaran</FormLabel>
                    <RadioGroup
                      onValueChange={(value: "parent" | "child") => {
                        setBudgetType(value);
                        form.setValue("budgetType", value, {
                          shouldValidate: true,
                        });
                      }}
                      value={budgetType}
                      className="flex items-center space-x-4"
                      disabled={!!editingBudget} // Disable if editing
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="parent" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Anggaran Induk (Tahunan)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="child" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Anggaran Periode (Anak)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="period_start"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Periode Mulai</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="period_end"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Periode Selesai</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date <
                                  (form.getValues("period_start") ||
                                    new Date(0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {budgetType === "child" && (
                    <FormField
                      control={form.control}
                      name="parent_budget_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anggaran Induk</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value ? String(field.value) : ""}
                            disabled={isLoading || !!editingBudget} // Disable if editing
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isLoading
                                      ? "Memuat..."
                                      : "Pilih Anggaran Induk"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {parentBudgets.map((budget) => (
                                <SelectItem
                                  key={budget.budget_id}
                                  value={String(budget.budget_id)}
                                >
                                  {`Tahun ${new Date(
                                    budget.period_start
                                  ).getFullYear()} - ${
                                    budget.energy_type.type_name
                                  }`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="total_budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Budget</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="e.g., 50000000"
                              {...field}
                              max={
                                budgetType === "child" &&
                                prepareNextPeriodBudget?.availableBudgetForNextPeriod
                              }
                              className="pr-28" // Beri ruang untuk tombol
                            />
                            {budgetType === "child" &&
                              prepareNextPeriodBudget?.availableBudgetForNextPeriod >
                                0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                                  onClick={() =>
                                    form.setValue(
                                      "total_budget",
                                      prepareNextPeriodBudget.availableBudgetForNextPeriod
                                    )
                                  }
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Gunakan
                                </Button>
                              )}
                          </div>
                        </FormControl>
                        {budgetType === "child" && prepareNextPeriodBudget && (
                          <FormDescription>
                            Sisa budget dari induk yang dapat dialokasikan:{" "}
                            {formatCurrency(
                              prepareNextPeriodBudget.availableBudgetForNextPeriod ||
                                0
                            )}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {budgetType === "parent" && (
                    <FormField
                      control={form.control}
                      name="efficiency_tag"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Efficiency Tag (0-1)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 0.85"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentBudgetType === "parent" && (
                    <FormField
                      control={form.control}
                      name="energy_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Energi</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(Number(value));
                              // Reset alokasi saat tipe energi berubah
                              form.setValue("allocations", []);
                            }}
                            value={field.value ? String(field.value) : ""}
                            disabled={isLoadingEnergyTypes || !!editingBudget} // Disable if editing
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isLoadingEnergyTypes
                                      ? "Memuat..."
                                      : "Pilih Tipe Energi"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {energyTypes.map((type) => (
                                <SelectItem
                                  key={type.energy_type_id}
                                  value={String(type.energy_type_id)}
                                >
                                  {type.type_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {budgetType === "child" && selectedEnergyTypeName && (
                    <div className="space-y-2">
                      <Label>Tipe Energi</Label>
                      <Input
                        value={selectedEnergyTypeName}
                        disabled
                        className="font-semibold"
                      />
                      <p className="text-sm text-muted-foreground">
                        Tipe energi diwarisi dari anggaran induk yang dipilih.
                      </p>
                    </div>
                  )}

                  {/* --- Bagian Alokasi Meter --- */}
                  {(budgetType === "child" ||
                    (editingBudget &&
                      editingBudget.allocations?.length > 0)) && (
                    <div className="col-span-2">
                      <FormLabel>Alokasi Meter</FormLabel>
                      <div className="space-y-3 mt-2">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="grid grid-cols-12 gap-x-2 gap-y-2 items-start p-3 border rounded-md"
                          >
                            <div className="col-span-12 sm:col-span-6">
                              <FormField
                                control={form.control}
                                name={`allocations.${index}.meter_id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="sr-only">
                                      Meter
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={
                                        field.value ? String(field.value) : ""
                                      }
                                      disabled={
                                        isLoadingMeters || isLoadingEnergyTypes
                                      }
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={
                                              isLoadingMeters
                                                ? "Memuat..."
                                                : "Pilih Meter"
                                            }
                                          />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {meters
                                          .filter(
                                            (meter) =>
                                              !selectedMeterIds.includes(
                                                meter.meter_id.toString()
                                              ) ||
                                              field.value ===
                                                meter.meter_id.toString()
                                          )
                                          .map((meter) => (
                                            <SelectItem
                                              key={meter.meter_id}
                                              value={String(meter.meter_id)}
                                              disabled={
                                                // Nonaktifkan jika sudah dipilih di baris lain,
                                                // tapi jangan nonaktifkan untuk baris ini sendiri.
                                                selectedMeterIds.includes(
                                                  meter.meter_id
                                                ) &&
                                                meter.meter_id !== field.value
                                              }
                                            >
                                              {meter.meter_code}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="col-span-10 sm:col-span-5">
                              <FormField
                                control={form.control}
                                name={`allocations.${index}.weight`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="sr-only">
                                      Bobot
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Bobot (0-1)"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => remove(index)}
                              >
                                <XCircle className="h-5 w-5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          append({ meter_id: undefined, weight: undefined })
                        }
                        disabled={
                          !selectedEnergyTypeId ||
                          isLoadingMeters ||
                          isLoadingEnergyTypes ||
                          fields.length >= meters.length
                        }
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Alokasi
                      </Button>
                      <FormMessage />
                      <BudgetPreview />
                    </div>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="p-4 pt-0">
                <Button
                  type="submit"
                  disabled={createOrUpdateMutation.isPending}
                >
                  {createOrUpdateMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!budgetToDelete}
        onOpenChange={() => setBudgetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus budget periode
              <span className="font-bold">
                {budgetToDelete &&
                  new Date(budgetToDelete.period_start).toLocaleDateString(
                    "id-ID"
                  )}
              </span>
              . Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(budgetToDelete.budget_id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
