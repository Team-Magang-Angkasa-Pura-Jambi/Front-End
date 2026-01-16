"use client";

import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale"; // Make sure this is imported
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import {
  Loader2,
  Pencil,
  Save,
  ShieldCheck,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
  getUserApi,
  getUserActivitiesApi,
  updateUserApi,
} from "@/services/users.service";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password minimal 6 karakter",
    }),
});

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: userProfileData, isLoading } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUserApi(user!.id),
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
  });

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["userActivities", user?.id],
    queryFn: () => getUserActivitiesApi(user!.id),
    enabled: !!user?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      username: userProfileData?.data?.username || "",
      password: "",
    },
  });

  const { mutate: updateUser, isPending: isPending } = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== "")
      );
      return updateUserApi(user!.id, payload);
    },
    onSuccess: (response) => {
      toast.success(response.status.message);

      queryClient.invalidateQueries({ queryKey: ["user", user!.id] });

      setIsEditing(false);
      form.reset({ ...form.getValues(), password: "" });
    },
    onError: (error) => {
      toast.error(
        error.message || "Terjadi kesalahan saat memperbarui profil."
      );
    },
  });

  const userActivities = useMemo(
    () => activitiesData?.data || [],
    [activitiesData?.data]
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const hasUsernameChanged =
      values.username !== userProfileData?.data?.username;
    const hasPasswordChanged = values.password?.trim() !== "";

    if (!hasUsernameChanged && !hasPasswordChanged) {
      toast.info("Tidak ada perubahan yang perlu disimpan.");
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const profile = userProfileData?.data;

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-bold">Profil Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola username dan password akun Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ✅ Kartu Profil */}
        <aside className="lg:col-span-1">
          <Card className="shadow-lg transition hover:shadow-xl">
            <CardHeader className="from-muted/50 to-muted/20 bg-gradient-to-b text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarImage src={profile?.photo_profile_url ?? ""} />
                <AvatarFallback>
                  {profile?.username
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-xl">
                {profile?.username}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-1">
                <ShieldCheck className="text-primary h-4 w-4" />
                {profile?.role?.role_name || "User"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant={profile?.is_active ? "default" : "destructive"}>
                  {profile?.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Bergabung</span>
                <span>
                  {profile?.created_at ? (
                    format(
                      new Date(profile.created_at.replace(" ", "T")), // Fix for Safari/SQL dates
                      "d MMMM yyyy",
                      {
                        locale: id,
                      }
                    )
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* ✅ Form Edit Username & Password */}
        <main className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Akun</CardTitle>
            </CardHeader>

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="edit-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Username */}
                      <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                        <Label htmlFor="username" className="sm:text-right">
                          Username
                        </Label>
                        <Input
                          id="username"
                          {...form.register("username")}
                          placeholder="Masukkan username baru"
                          className="sm:col-span-2"
                        />
                      </div>

                      {/* Password Baru */}
                      <div className="relative grid gap-2 sm:grid-cols-3 sm:items-center">
                        <Label htmlFor="password" className="sm:text-right">
                          Password Baru
                        </Label>
                        <div className="relative sm:col-span-2">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password baru"
                            {...form.register("password")}
                          />
                          <button
                            type="button"
                            className="text-muted-foreground absolute right-3 top-2.5"
                            onClick={() => setShowPassword((p) => !p)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-destructive text-right text-sm sm:col-span-2">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.p
                      key="view-mode"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                    >
                      Username: <strong>{profile?.username}</strong>
                    </motion.p>
                  )}
                </AnimatePresence>
              </CardContent>

              <CardFooter className="my-2 justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Batal
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {/* 1. Bungkus Logika Ikon dalam span sendiri */}
                      <span className="mr-2 inline-flex items-center">
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </span>

                      {/* 2. PENTING: Bungkus teks "Simpan" dalam span juga */}
                      <span>Simpan</span>
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Ubah Profil
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>

          {/* ✅ Riwayat Aktivitas */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {isLoadingActivities ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : userActivities.length > 0 ? (
                <ul className="border-l border-dashed pl-6">
                  {userActivities.map((a) => (
                    <li key={a.id} className="mb-4">
                      <p className="font-medium">{a.description}</p>
                      <p className="text-muted-foreground text-xs">
                        {/* FIX: Use .replace to ensure ISO format compatibility */}
                        {formatDistanceToNow(
                          new Date(a.timestamp.replace(" ", "T")),
                          {
                            addSuffix: true,
                            locale: id,
                          }
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  Tidak ada aktivitas terbaru.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* ✅ Dialog Konfirmasi */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan username atau
              password?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateUser(form.getValues())}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
