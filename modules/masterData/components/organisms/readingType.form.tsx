import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/common/components/ui/button";
import { DialogFooter } from "@/common/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Separator } from "@/common/components/ui/separator";

import { ReadingTypeFormValues, readingTypeSchema } from "../../schemas/readingType.schema";
import { getEnergyTypeByIdApi } from "../../services/energyType.service";
import { createReadingTypeApi, updateReadingTypeApi } from "../../services/readingsType.service";

interface ReadingTypeFormProps {
  energyId: number; // Jadikan wajib, karena baik create maupun edit butuh ID parent ini
  readingTypeId?: number;
  onSuccessCallback?: () => void;
}

export function ReadingTypeForm({
  energyId,
  readingTypeId,
  onSuccessCallback,
}: ReadingTypeFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!readingTypeId;

  // 1. SINGLE QUERY: Ambil data Energy saja
  const { data: response, isLoading: isLoadingQuery } = useQuery({
    queryKey: ["energy", energyId],
    queryFn: () => getEnergyTypeByIdApi(energyId),
    enabled: !!energyId, // Query berjalan jika energyId ada
  });

  const energyData = response?.data;

  // 2. Cari data Reading Type di dalam array jika sedang mode Edit
  const selectedReadingType = isEditing
    ? energyData?.reading_types?.find((rt: any) => rt.reading_type_id === readingTypeId)
    : null;

  // 3. Setup Form RHF
  const form = useForm<ReadingTypeFormValues>({
    resolver: zodResolver(readingTypeSchema) as Resolver<ReadingTypeFormValues>,
    // RHF `values` akan otomatis reaktif ketika energyData selesai di-fetch
    values: {
      energy_type: {
        energy_type_id: energyData?.energy_type_id || energyId,
        name: energyData?.name || "",
      },
      type_name: selectedReadingType?.type_name || "",
      unit: selectedReadingType?.unit || "",
    },
  });

  // 4. Mutasi Setup (Create & Update)
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) =>
      isEditing ? updateReadingTypeApi(readingTypeId, payload) : createReadingTypeApi(payload),
    onSuccess: () => {
      toast.success(`Parameter berhasil di${isEditing ? "perbarui" : "tambahkan"}!`);
      // Invalidate query tabel utama dan query energy spesifik ini
      queryClient.invalidateQueries({ queryKey: ["readingTypes"] });
      queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      toast.error("Terjadi Kesalahan", {
        description: error?.response?.data?.message || "Gagal menyimpan data.",
      });
    },
  });

  // 5. Payload Mapping
  const onSubmit = (values: ReadingTypeFormValues) => {
    const payload = {
      energy_type_id: Number(values.energy_type.energy_type_id),
      type_name: values.type_name,
      unit: values.unit,
    };
    mutate(payload);
  };

  if (isLoadingQuery) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* ENERGY TYPE DISPLAY (Read-Only) */}
          <FormField
            control={form.control}
            name="energy_type.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Kategori Energi</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Memuat data..." disabled className="bg-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* READING TYPE INPUTS */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-bold uppercase">
                    Nama Tipe (ex: WBP)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama tipe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-bold uppercase">
                    Unit Standar (ex: kWh)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="submit"
            className="w-full px-8 font-bold shadow-md transition-all active:scale-95 sm:w-auto"
            disabled={isPending || !form.formState.isDirty}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Konfigurasi
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
