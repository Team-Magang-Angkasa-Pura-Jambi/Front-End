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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, XCircleIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { MultiSelect } from "@/components/ui/MultiSelect";
import { TariffGroup } from "@/common/types/tariffGroup";
import {
  priceSchemeSchema,
  schemaFormValues,
} from "../../schemas/schemaPrice.schema";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { ReadingType } from "@/common/types/readingTypes";
import { PriceSchemeType } from "@/common/types/schemaPrice";
import { getTaxesApi } from "../../services/tax.service";
import { getTariffGroupsApi } from "../../services/tariffGroup.service";

interface PriceSchemeFormProps {
  initialData?: PriceSchemeType | null;
  readingTypes: ReadingType[];
  taxes: { tax_id: number; tax_name: string }[];
  onSubmit: (values: schemaFormValues) => void;
  isLoading?: boolean;
}

export function PriceSchemeForm({
  initialData,
  onSubmit,
  readingTypes,
  taxes,
  isLoading,
}: PriceSchemeFormProps) {
  const form = useForm<schemaFormValues>({
    resolver: zodResolver(priceSchemeSchema) as Resolver<schemaFormValues>,
    defaultValues: initialData
      ? {
          ...initialData,
          effective_date: new Date(initialData.effective_date),
          rates: initialData.rates.map((r) => ({
            reading_type_id: r.reading_type_id,
            value: parseFloat(r.value),
          })),
          tax_ids: initialData.taxes?.map((t) => t.tax_id) || [],
        }
      : {
          scheme_name: "",
          effective_date: new Date(),
          is_active: true,
          tariff_group_id: undefined,
          rates: [{ reading_type_id: undefined, value: undefined }],
          tax_ids: [],
        },
  });

  const { data: tariffGroupsResponse, isLoading: isLoadingTariffGroups } =
    useQuery({
      queryKey: ["tariffGroups"],
      queryFn: getTariffGroupsApi,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  const { data: taxesResponse, isLoading: isLoadingTaxes } = useQuery({
    queryKey: ["taxes"],
    queryFn: getTaxesApi,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rates",
  });

  const tariffGroups = tariffGroupsResponse?.data || [];
  const allTaxes = taxesResponse?.data || [];

  return (
    <Form {...form}>
      <form
        id="price-scheme-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="scheme_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Skema</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Tarif Dasar 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="effective_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Efektif</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
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
          name="tariff_group_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Golongan Tarif</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ? String(field.value) : ""}
                disabled={isLoadingTariffGroups}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingTariffGroups
                          ? "Memuat golongan..."
                          : "Pilih Golongan Tarif"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tariffGroups.map((tg: TariffGroup) => (
                    <SelectItem
                      key={tg.tariff_group_id}
                      value={String(tg.tariff_group_id)}
                    >
                      {tg.group_code} - {tg.group_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tax_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pajak yang Berlaku</FormLabel>
              <MultiSelect
                options={allTaxes.map((tax) => ({
                  value: String(tax.tax_id),
                  label: tax.tax_name,
                }))}
                selected={field.value?.map(String) || []}
                onChange={(selectedValues) => {
                  field.onChange(selectedValues.map(Number));
                }}
                className="w-full"
                placeholder={
                  isLoadingTaxes ? "Memuat pajak..." : "Pilih pajak..."
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <hr className="my-4 border-dashed" />

        <div>
          <h3 className="text-md font-medium mb-3">Detail Tarif</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-x-2 gap-y-4 items-start p-3 border rounded-md"
              >
                <div className="col-span-12 sm:col-span-5">
                  <FormField
                    control={form.control}
                    name={`rates.${index}.reading_type_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">
                          Jenis Pembacaan
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis Pembacaan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {readingTypes.map((rt) => (
                              <SelectItem
                                key={rt.reading_type_id}
                                value={String(rt.reading_type_id)}
                              >
                                {rt.type_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <FormField
                    control={form.control}
                    name={`rates.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Nilai Tarif</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nilai Tarif (Rp)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 sm:col-span-1 flex items-center justify-end">
                  {fields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <XCircleIcon className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ reading_type_id: 0, value: 0 })}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Tarif
        </Button>
      </form>
      <DialogFooter className="pt-4">
        <Button type="submit" form="price-scheme-form" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </Form>
  );
}
