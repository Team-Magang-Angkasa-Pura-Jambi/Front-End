import { TariffGroup } from "@/common/types/tariffGroup";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import {
  tariffGroupSchema,
  tarifFormValues,
} from "../../schemas/tariffGroup.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { DialogFooter } from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

interface TariffGroupFormProps {
  initialData?: TariffGroup | null;
  onSubmit: SubmitHandler<tarifFormValues>;
  isLoading?: boolean;
}

export function TariffGroupForm({
  initialData,
  onSubmit,
  isLoading,
}: TariffGroupFormProps) {
  const form = useForm<tarifFormValues>({
    resolver: zodResolver(tariffGroupSchema) as Resolver<tarifFormValues>,
    defaultValues: initialData
      ? {
          group_code: initialData.group_code,
          group_name: initialData.group_name,
          description: initialData.description ?? "",
          daya_va: initialData.daya_va ?? null,
          faktor_kali: initialData.faktor_kali,
        }
      : {
          group_code: "",
          group_name: "",
          description: "",
          daya_va: null,
          faktor_kali: 1,
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="group_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Golongan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: R1, B2, I3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="group_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Golongan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Bisnis Tegangan Menengah"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Deskripsi singkat mengenai golongan tarif"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="faktor_kali"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faktor Kali</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daya_va"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daya (VA)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Contoh: 7700000 (kosongkan jika tidak ada)"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
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
