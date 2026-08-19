"use client";

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
import { UserProfileData } from "@/common/types/user";
import { ProfileFormValues, profileSchema } from "@/modules/profile/schemas/profile.schema";
import { getRolesApi } from "@/services/role.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";

export interface UserFormProps {
  onSubmit: (values: ProfileFormValues) => void;
  isPending: boolean;
  defaultValues?: UserProfileData;
}

export const UserForm: React.FC<UserFormProps> = ({ onSubmit, isPending, defaultValues }) => {
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: getRolesApi,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
    defaultValues: {
      full_name: defaultValues?.full_name || "",
      username: defaultValues?.username || "",
      email: defaultValues?.email || "email@sentine.com",
      role_id: defaultValues?.role.role_id,
      password: "",
    },
  });

  // Sinkronisasi ulang jika defaultValues berubah (misal saat fetch detail user selesai)
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        full_name: defaultValues.full_name,
        username: defaultValues.username,
        email: defaultValues.email,
        role_id: defaultValues.role.role_id,
        password: "",
      });
    }
  }, [defaultValues, form]);

  const roles = rolesData?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username_pengguna" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@sentinel.local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={defaultValues ? "Kosongkan jika tidak berubah" : "••••••••"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Selection */}
          <FormField
            control={form.control}
            name="role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peran (Role)</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={isLoadingRoles || isError}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingRoles ? "Memuat..." : "Pilih peran"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.role_id} value={role.role_id.toString()}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Pengguna
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
