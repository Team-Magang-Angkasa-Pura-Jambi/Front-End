import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import {
  readingTypeFormValues,
  readingTypeSchema,
} from "../../schemas/readingType.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReadingType } from "@/common/types/readingTypes";
import { getEnergyTypesApi } from "../../services/energyType.service";

interface ReadingTypeFormProps {
  initialData?: ReadingType | null;
  onSubmit: SubmitHandler<readingTypeFormValues>;
  isLoading?: boolean;
}

export function ReadingTypeForm({
  initialData,
  onSubmit,
  isLoading,
}: ReadingTypeFormProps) {
  const form = useForm<readingTypeFormValues>({
    resolver: zodResolver(readingTypeSchema) as Resolver<readingTypeFormValues>,
    defaultValues: initialData
      ? {
          type_name: initialData.type_name,
          reading_unit: initialData.reading_unit,
          energy_type_id: initialData.energy_type.energy_type_id,
        }
      : { type_name: "", reading_unit: "", energy_type_id: undefined },
  });

  const { data: energyTypesResponse, isLoading: isLoadingEnergyTypes } =
    useQuery({
      queryKey: ["energyTypes"],
      queryFn: () => getEnergyTypesApi(),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Tipe Pembacaan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: WBP, LWBP, Stand Meter"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reading_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satuan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: kWh, m³, L" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="energy_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Energi</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ? String(field.value) : ""}
                disabled={isLoadingEnergyTypes}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingEnergyTypes
                          ? "Memuat..."
                          : "Pilih Jenis Energi"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {energyTypesResponse?.data?.map((et) => (
                    <SelectItem
                      key={et.energy_type_id}
                      value={String(et.energy_type_id)}
                    >
                      {et.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
