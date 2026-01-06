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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

import { taxFormValue, taxSchema } from "../../schemas/taxes.schema";
import { Taxes } from "@/common/types/taxes";

interface TaxFormProps {
  initialData?: Taxes | null;
  onSubmit: (data: taxFormValue) => void;
  isLoading?: boolean;
}

export function TaxForm({ initialData, onSubmit, isLoading }: TaxFormProps) {
  const form = useForm<taxFormValue>({
    resolver: zodResolver(taxSchema) as Resolver<taxFormValue>,
    defaultValues: {
      tax_name: "",
      rate: 0.11,
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        tax_name: initialData.tax_name,
        rate: initialData.rate,
        is_active: initialData.is_active,
      });
    } else {
      form.reset({
        tax_name: "",
        rate: 0.11,
        is_active: true,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Field: Nama Pajak */}
        <FormField
          control={form.control}
          name="tax_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pajak</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: PPN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Field: Tarif (Rate) */}
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarif (Desimal)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.11"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Masukkan nilai desimal. Contoh: 0.11 untuk 11%.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Field: Status Active */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value ? "true" : "false"}
                value={field.value ? "true" : "false"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tombol Simpan */}
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
}
