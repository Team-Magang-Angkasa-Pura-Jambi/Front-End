"use client";
import { Location } from "@/common/types/location";

import { Button } from "@/common/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { useEntityManager } from "../../hooks/useEntityManagement";
import { locationFormSchema, LocationFormValues } from "../../schemas/location.schema";

interface LocationFormProps {
  initialData?: Partial<LocationFormValues> & { location_id?: number };
  onSubmit: (data: LocationFormValues) => void;
  isLoading?: boolean;
}

export const LocationForm = ({ initialData, onSubmit, isLoading }: LocationFormProps) => {
  const { data } = useEntityManager<Location>("location");

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema) as unknown as Resolver<LocationFormValues>,
    defaultValues: {
      name: initialData?.name || "",
      parent_id: initialData?.parent_id ?? null,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        parent_id: initialData.parent_id ?? null,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lokasi / Area</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Terminal 1, Gate 5..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Induk Lokasi (Parent)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "root" ? null : Number(value))}
                value={field.value?.toString() || "root"}
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Pilih Induk Lokasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="root">-- Lokasi Utama (Root) --</SelectItem>

                  {Array.isArray(data) &&
                    (data as Location[])
                      .filter((loc) => loc.location_id !== initialData?.location_id)
                      .map((loc) => (
                        <SelectItem key={loc.location_id} value={loc.location_id.toString()}>
                          {loc.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="w-full font-semibold">
            {isLoading ? "Memproses..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
