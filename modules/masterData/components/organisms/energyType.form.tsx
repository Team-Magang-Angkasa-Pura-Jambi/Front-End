"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";

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
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        unit_standard: initialData.unit_standard,
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
