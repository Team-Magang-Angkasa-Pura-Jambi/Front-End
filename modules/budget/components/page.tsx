"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  Loader2,
  XCircle,
  TrendingDown,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { getMetersApi, MeterType } from "@/services/meter.service";
import {
  getBudgetSummaryApi,
  BudgetSummaryByEnergy,
  getprepareNextPeriodBudgetApi,
} from "@/services/analysis.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { se } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Hook untuk Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Atur timeout untuk memperbarui nilai setelah delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Batalkan timeout jika nilai berubah (misalnya, pengguna masih mengetik)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya panggil ulang efek jika nilai atau delay berubah

  return debouncedValue;
}

// --- Komponen Analisis & Ringkasan ---
const BudgetPreview = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<AnnualBudgetFormValues>();

  // 1. Awasi field untuk mendapatkan nilai secara instan
  const watchedFields = useWatch({
    control,
    name: ["total_budget", "period_start", "period_end", "allocations"],
  });

  // 2. Terapkan debounce pada nilai yang diawasi (delay 500ms)
  const debouncedFields = useDebounce(watchedFields, 500);
  const [total_budget, period_start, period_end, allocations] = debouncedFields;

  // Cek apakah ada error pada field yang relevan
  const hasErrors =
    errors.total_budget || errors.period_start || errors.period_end;

  const canFetchPreview =
    !hasErrors &&
    total_budget > 0 &&
    period_start instanceof Date &&
    period_end instanceof Date;

  // 3. Gunakan nilai yang sudah di-debounce untuk query
  const {
    data: previewData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["budgetPreview", total_budget, period_start, period_end],
    queryFn: () =>
      budgetApi.getPreview({
        total_budget,
        period_start: period_start.toISOString().split("T")[0], // Format ke YYYY-MM-DD
        period_end: period_end.toISOString().split("T")[0],
        allocations: allocations.map((alloc) => ({
          meter_id: alloc.meter_id,
          weight: alloc.weight,
        })), // Format ke YYYY-MM-DD
      }),
    enabled: canFetchPreview,
  });

  return (
    <Card className="col-span-2 bg-muted/50 border-dashed transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pratinjau Alokasi Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        {!canFetchPreview && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Isi Total Budget, Periode Mulai, dan Periode Selesai untuk melihat
            pratinjau.
          </p>
        )}
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Menghitung pratinjau...
          </p>
        )}
        {isError && (
          <p className="text-sm text-destructive">Gagal memuat pratinjau.</p>
        )}
        {previewData && !isLoading && !isError && (
          <>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(
                previewData.monthlyAllocation[0]?.allocatedBudget || 0
              )}{" "}
              / bulan
            </p>
            <p className="text-xs text-muted-foreground">
              Estimasi alokasi rata-rata per bulan berdasarkan data historis.
            </p>
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold">Pratinjau per Meter:</h4>
              {previewData.meterAllocationPreview.map((meter) => (
                <div
                  key={meter.meterId}
                  className="text-xs text-muted-foreground flex justify-between"
                >
                  <span>{meter.meterName}</span>
                  <span className="font-medium">
                    {formatCurrency(meter.allocatedBudget)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const BudgetSummaryCard = ({ icon: Icon, title, value, description }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const BudgetSummaryCarousel = () => {
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ["budgetSummary"],
    queryFn: getBudgetSummaryApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    if (!summaryData) return;
    setCurrentIndex((prev) => (prev + 1) % summaryData.length);
  }, [summaryData]);

  useEffect(() => {
    if (!summaryData || summaryData.length <= 1) return;
    const interval = setInterval(handleNext, 15000); // Ganti kartu setiap 5 detik
    return () => clearInterval(interval);
  }, [summaryData, handleNext]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
      </div>
    );
  }

  if (!summaryData || summaryData.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        Tidak ada ringkasan budget.
      </div>
    );
  }

  const currentItem = summaryData[currentIndex];
  const budget = currentItem.currentPeriod;

  const cardVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <BudgetSummaryCard
            title={`Alokasi ${currentItem.energyTypeName}`}
            value={formatCurrency(budget?.totalBudget || 0)}
            description={`Tahun Anggaran ${new Date(
              budget?.periodStart || Date.now()
            ).getFullYear()}`}
            icon={Landmark}
          />
          <BudgetSummaryCard
            title={`Realisasi ${currentItem.energyTypeName}`}
            value={formatCurrency(budget?.totalRealization || 0)}
            description="Anggaran yang sudah digunakan"
            icon={DollarSign}
          />
          <BudgetSummaryCard
            title={`Sisa Budget ${currentItem.energyTypeName}`}
            value={formatCurrency(budget?.remainingBudget || 0)}
            description={
              budget?.remainingBudget >= 0
                ? "Masih ada sisa budget"
                : "Melebihi alokasi budget"
            }
            icon={budget?.remainingBudget >= 0 ? TrendingUp : TrendingDown}
          />
          <BudgetSummaryCard
            title={`Persentase Realisasi ${currentItem.energyTypeName}`}
            value={`${(budget?.realizationPercentage || 0).toFixed(2)}%`}
            description="Dari total alokasi budget"
            icon={
              budget?.realizationPercentage > 100 ? TrendingDown : TrendingUp
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const BudgetAllocationChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Bulan
              </span>
              <span className="font-bold">{label}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Alokasi
              </span>
              <span className="font-bold text-primary ">
                {formatCurrency(payload[0].value)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Realisasi
              </span>
              <span className="font-bold text-destructive ">
                {formatCurrency(payload[1].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp${value / 1_000_000} Jt`}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Legend wrapperStyle={{ fontSize: "14px" }} />
        <Bar
          dataKey="allocatedBudget"
          name="Alokasi"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="realizationCost"
          name="Realisasi"
          fill="hsl(var(--destructive))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const MeterAllocationDetails = ({
  annualBudget,
}: {
  annualBudget: AnnualBudget;
}) => {
  const meterAllocations = annualBudget.allocations || [];

  return (
    <div className="p-4 bg-muted/50 border-t border-dashed">
      <h4 className="font-semibold mb-2 text-sm">Detail Alokasi per Meter</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {meterAllocations.map((alloc) => (
          <Card key={alloc.allocation_id} className="bg-background/50">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">
                {alloc.meter.meter_code}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 pb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alokasi:</span>
                <span className="font-medium">
                  {formatCurrency(alloc.allocatedBudget)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Realisasi:</span>
                <span className="font-medium">
                  {formatCurrency(alloc.totalRealization)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa:</span>
                <span
                  className={cn(
                    "font-medium",
                    alloc.remainingBudget < 0 && "text-destructive"
                  )}
                >
                  {formatCurrency(alloc.remainingBudget)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Persentase:</span>
                <span className="font-bold text-primary">
                  {alloc.realizationPercentage.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- Komponen Detail Bulanan untuk Accordion ---
const MonthlyUsageDetails = ({
  annualBudget,
}: {
  annualBudget: AnnualBudget;
}) => {
  const year = new Date(annualBudget.period_start).getFullYear();
  const monthlyData = annualBudget.monthlyAllocation || [];
  const isLoading = false; // Data is now passed directly
  const isError = !monthlyData;

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Memuat detail bulanan...
        </p>
      </div>
    );
  }

  if (isError || !monthlyData) {
    return (
      <div className="p-4 text-center text-destructive">
        Gagal memuat detail pemakaian bulanan.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50">
      <MeterAllocationDetails annualBudget={annualBudget} />

      <h4 className="font-semibold mb-2 mt-6">
        Detail Pemakaian Anggaran Tahun {year}
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bulan</TableHead>
            <TableHead className="text-right">Alokasi</TableHead>
            <TableHead className="text-right">Realisasi</TableHead>
            <TableHead className="text-right">Sisa</TableHead>
            <TableHead className="text-right">Persentase</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthlyData.map((item) => (
            <TableRow key={item.month}>
              <TableCell>{item.monthName}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.allocatedBudget)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.realizationCost)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.remainingBudget)}
              </TableCell>
              <TableCell className="text-right">
                {item.realizationPercentage != null
                  ? `${item.realizationPercentage.toFixed(2)}%`
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// --- Komponen DataTable Internal ---
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
// --- Akhir Komponen DataTable Internal ---

// --- Komponen Aksi Baris Tabel Internal ---
interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onEdit: (data: TData) => void;
  onDelete: (data: TData) => void;
}

function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
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
        <DropdownMenuItem
          className="text-red-600 focus:text-red-700 focus:bg-red-50"
          onClick={() => onDelete(row.original)}
        >
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
// --- Akhir Komponen Aksi Baris Tabel Internal ---

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
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
    header: "Periode Mulai",
    cell: ({ row }) =>
      format(new Date(row.getValue("period_start")), "d LLL y"),
  },
  {
    accessorKey: "period_end",
    header: "Periode Selesai",
    cell: ({ row }) => format(new Date(row.getValue("period_end")), "d LLL y"),
  },
  {
    accessorKey: "total_budget",
    header: "Total Budget",
    cell: ({ row }) => formatCurrency(parseFloat(row.getValue("total_budget"))),
  },
  {
    accessorKey: "efficiency_tag",
    header: "Efficiency Tag",
    cell: ({ row }) => `${(row.getValue("efficiency_tag") * 100).toFixed(0)}%`,
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
      total_budget: 0,
      efficiency_tag: 0,
      allocations: [],
      parent_budget_id: null,
    },
    values: { budgetType: budgetType }, // Tambahkan budgetType ke nilai form
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
        allocations: budget.allocations || [],
      });
    } else {
      form.reset({
        total_budget: 0,
        efficiency_tag: 0,
        period_start: undefined,
        period_end: undefined,
        allocations: [],
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
    mutationFn: (values: AnnualBudgetFormValues) => {
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
    if (budgetType === "parent") form.setValue("parent_budget_id", null);
  }, [budgetType, form]);
  useEffect(() => {
    if (!processToConfirm) {
      processForm.reset({
        pjj_rate: 0.85,
        process_date: new Date(),
      });
    }
  }, [processToConfirm, processForm]);

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ScrollArea className="max-h-[70vh] overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <FormLabel>Tipe Anggaran</FormLabel>
                    <RadioGroup
                      onValueChange={(value: "parent" | "child") => {
                        setBudgetType(value);
                        form.setValue("budgetType", value);
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
                          <PopoverContent className="w-auto p-0" align="start">
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                (form.getValues("period_start") || new Date(0))
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
                            min={
                              prepareNextPeriodBudget?.availableBudgetForNextPeriod ||
                              0
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

                {/* --- Bagian Alokasi Meter --- */}
                {(budgetType === "child" ||
                  (editingBudget && editingBudget.allocations?.length > 0)) && (
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
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createOrUpdateMutation.isPending}
                  >
                    {createOrUpdateMutation.isPending
                      ? "Menyimpan..."
                      : "Simpan"}
                  </Button>
                </DialogFooter>
              </ScrollArea>
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
              onClick={() => deleteMutation.mutate(budgetToDelete!.budget_id)}
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
