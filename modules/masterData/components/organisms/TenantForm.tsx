"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ListFilter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";

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
import { useTenants } from "../../hooks/useTenants";
import { tenantFormSchema, TenantFormValues } from "../../schemas/tenant.schema";

interface TenantFormProps {
  initialData?: Partial<TenantFormValues>;
  onSubmit: (data: TenantFormValues) => void;
  isLoading?: boolean;
}

export const TenantForm = ({ initialData, onSubmit, isLoading }: TenantFormProps) => {
  const { categories } = useTenants();
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema) as unknown as Resolver<TenantFormValues>,
    defaultValues: initialData || {
      name: "",
      category: "",
      contact_person: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (initialData?.category) {
      const exists = categories?.includes(initialData.category);
      setIsCustomCategory(!exists && initialData.category !== "");
    }
  }, [initialData, categories]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Tenant</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama tenant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Kategori</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-primary h-auto p-0 text-[10px] font-bold hover:bg-transparent"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      form.setValue("category", "");
                    }}
                  >
                    {isCustomCategory ? (
                      <span className="flex items-center gap-1">
                        <ListFilter className="h-3 w-3" /> Pilih dari Daftar
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Buat Baru
                      </span>
                    )}
                  </Button>
                </div>

                <FormControl>
                  {isCustomCategory ? (
                    <Input placeholder="Ketik kategori baru..." {...field} autoFocus />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!categories || categories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categories?.length === 0 ? "Belum ada kategori" : "Pilih Kategori"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact_person"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person</FormLabel>
              <FormControl>
                <Input placeholder="Nama penanggung jawab" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="nama@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full shadow-lg transition-all active:scale-[0.98]"
        >
          {isLoading ? "Memproses..." : "Simpan Profil Tenant"}
        </Button>
      </form>
    </Form>
  );
};
