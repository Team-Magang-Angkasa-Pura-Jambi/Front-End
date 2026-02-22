"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2, Zap } from "lucide-react";
import { useEffect } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";

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
import { EnergyType } from "@/common/types/energy";
import { EnergyTypeFormValues, energyTypeSchema } from "../../schemas/energyType.schema";

interface EnergyTypeFormProps {
  initialData?: EnergyType | null;
  onSubmit: (values: EnergyTypeFormValues) => void;
  isLoading?: boolean;
}

export const EnergyTypeForm = ({ initialData, onSubmit, isLoading }: EnergyTypeFormProps) => {
  const form = useForm<EnergyTypeFormValues>({
    resolver: zodResolver(energyTypeSchema) as Resolver<EnergyTypeFormValues>,
    defaultValues: {
      name: "",
      unit_standard: "",
      reading_types: [], // Inisialisasi array kosong
    },
  });

  // Setup Field Array untuk Reading Types
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reading_types",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        unit_standard: initialData.unit_standard,
        // Map data dari API jika ada reading_types (untuk mode Edit)
        reading_types:
          initialData.reading_types?.map((rt) => ({
            type_name: rt.type_name,
            unit: rt.unit,
          })) || [],
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* IDENTITAS ENERGI */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nama Energi</FormLabel>
                  <FormControl>
                    <Input placeholder="Electricity..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit_standard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Unit Standar</FormLabel>
                  <FormControl>
                    <Input placeholder="kWh..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* DYNAMIC READING TYPES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <h4 className="text-sm font-bold tracking-wider uppercase">Parameter Bacaan</h4>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ type_name: "", unit: "" })}
                className="h-7 text-[10px]"
              >
                <Plus className="mr-1 h-3 w-3" /> Tambah Parameter
              </Button>
            </div>

            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="animate-in fade-in slide-in-from-top-2 flex items-end gap-2"
                >
                  <div className="bg-muted/5 grid flex-1 grid-cols-2 gap-2 rounded-lg border p-2">
                    <FormField
                      control={form.control}
                      name={`reading_types.${index}.type_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Nama (ex: WBP)"
                              {...field}
                              className="h-8 text-xs"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`reading_types.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Unit (ex: kWh)"
                              {...field}
                              className="h-8 text-xs"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-[10px] italic">
                  Belum ada parameter bacaan ditambahkan.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="submit"
            className="w-full px-8 font-bold shadow-md transition-all active:scale-95 sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
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
};
