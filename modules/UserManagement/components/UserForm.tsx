"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { getRolesApi } from "@/services/role.service";
import { Button } from "@/components/ui/button";
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
import { formSchema, UserFormProps } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  isPending,
  defaultValues,
}) => {
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: getRolesApi,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: defaultValues?.username || "",
      role_id: defaultValues?.role?.role_id || undefined,
    },
  });

  // Mengambil data peran dari API

  const roles = rolesData?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    defaultValues
                      ? "Kosongkan jika tidak ingin mengubah"
                      : "Masukkan password"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peran</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
                disabled={isLoadingRoles || isError}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingRoles
                          ? "Memuat peran..."
                          : isError
                          ? "Gagal memuat peran"
                          : "Pilih peran pengguna"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                      key={role.role_id}
                      value={role.role_id.toString()}
                    >
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Pengguna"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
