import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { EnergyType } from "@/common/types/energy";
import {
  EnergyTypeFormValues,
  energyTypeSchema,
} from "../../schemas/energyType.schema";

interface EnergyTypeFormProps {
  initialData?: EnergyType | null;
  onSubmit: (values: EnergyTypeFormValues) => void;
  isLoading?: boolean;
}

export const EnergyTypeForm = ({
  initialData,
  onSubmit,
  isLoading,
}: EnergyTypeFormProps) => {
  const form = useForm<EnergyTypeFormValues>({
    resolver: zodResolver(energyTypeSchema) as Resolver<EnergyTypeFormValues>,
    defaultValues: {
      type_name: "",
      unit_of_measurement: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        type_name: initialData.type_name,
        unit_of_measurement: initialData.unit_of_measurement,
        is_active: initialData.is_active,
      });
    } else {
      form.reset({
        type_name: "",
        unit_of_measurement: "",
        is_active: true,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Field: Nama Jenis Energi */}
          <FormField
            control={form.control}
            name="type_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Jenis Energi</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Listrik, Air, BBM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field: Satuan Ukur */}
          <FormField
            control={form.control}
            name="unit_of_measurement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan Ukur</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: kWh, m³, Liter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field: Status Active */}
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Status Aktif</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
