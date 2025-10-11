// src/pages/Profile/Page.tsx
"use client";

import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUserApi,
  getUserActivitiesApi,
  updateUserApi,
} from "@/services/users.service";
import { UpdateUserPayload } from "@/types/users.types";
import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Save,
  XCircle,
  ShieldCheck,
  History,
  Target,
  Bell,
  BookCopy,
  FileText,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

// Tipe untuk data mockup riwayat aktivitas
type Activity = {
  id: string | number;
  type:
    | "TARGET_SET"
    | "ALERT_ACK"
    | "LOGBOOK_ENTRY"
    | "READING_SESSION"
    | "PRICE_SCHEME_SET"
    | string; // Fallback for other types
  description: string;
  createdAt: Date;
};

// Helper untuk mendapatkan inisial dari username
const getInitials = (name: string) => {
  // PERBAIKAN: Tambahkan pengecekan untuk memastikan `name` tidak undefined
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper untuk ikon aktivitas
const getActivityIcon = (type: string) => {
  switch (type) {
    case "Penetapan Target":
      return <Target className="h-5 w-5 text-blue-500" />;
    case "Pengakuan Peringatan":
      return <Bell className="h-5 w-5 text-yellow-500" />;
    case "Entri Logbook":
      return <BookCopy className="h-5 w-5 text-green-500" />;
    case "Pencatatan Meter":
      return <History className="h-5 w-5 text-indigo-500" />;
    case "Pengaturan Harga":
      return <FileText className="h-5 w-5 text-orange-500" />;
    default:
      return <History className="h-5 w-5 text-gray-500" />;
  }
};

export const ProfilePage = () => {
  const { user, token, setToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserPayload>({
    username: "",
    photo_profile_url: "",
    // PERBAIKAN: Hanya butuh satu field untuk password baru
    password: "",
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Mengambil data user terbaru dari API menggunakan ID dari global state
  const {
    data: userProfileData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", user?.id], // Gunakan user.id dari store
    queryFn: () => getUserApi(user!.id), // Panggil API dengan user.id
    enabled: !!user?.id,
    // PERBAIKAN: Pilih objek 'data' dari dalam respons API
    select: (response) => response.data,
    refetchOnWindowFocus: false,
  });

  // Sinkronisasi state form ketika data user dari store berubah
  useEffect(() => {
    if (userProfileData) {
      setFormData({
        username: userProfileData.username,
        photo_profile_url: userProfileData.photo_profile_url || "",
        // Reset password fields saat data baru dimuat
        password: "",
      });
    }
  }, [userProfileData]);

  // BARU: Query terpisah untuk mengambil riwayat aktivitas pengguna
  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["userActivities", user?.id],
    queryFn: () => getUserActivitiesApi(user!.id),
    enabled: !!user?.id,
    // PERBAIKAN: Pilih array 'history' dari dalam objek data
    select: (data) => data.data.history,
  });

  // PERBAIKAN: Memproses data aktivitas dari API dengan struktur baru
  const userActivities = useMemo(() => {
    if (!activitiesData) return [];
    // API sudah mengembalikan data terurut, tetapi kita bisa memprosesnya di sini
    // untuk memastikan formatnya sesuai dengan tipe `Activity`
    return activitiesData.map((activity: any, index: number) => ({
      id: `${activity.type}-${activity.timestamp}-${index}`, // Buat ID unik
      type: activity.type,
      description: activity.description,
      createdAt: new Date(activity.timestamp),
    }));
  }, [activitiesData]);

  const { mutate: updateUserProfile, isPending } = useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      // PERBAIKAN: Kirim hanya field yang tidak kosong
      updateUserApi(
        userProfileData!.user_id,
        Object.fromEntries(Object.entries(payload).filter(([_, v]) => v))
      ),
    onSuccess: (data) => {
      toast.success("Profil berhasil diperbarui!");
      setToken(token!, data.data); // Update user di Zustand store
      queryClient.invalidateQueries({
        queryKey: ["user", userProfileData!.user_id],
      });
      setIsEditing(false);
      setIsConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui profil.";
      toast.error(errorMessage);
      setIsConfirmDialogOpen(false);
    },
  });

  // PERBAIKAN: Tampilkan loading jika isLoading atau userProfileData belum ada
  if (isLoading || !userProfileData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !userProfileData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data profil.</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Kembalikan form ke data user asli
    setFormData({
      username: userProfileData.username,
      photo_profile_url: userProfileData.photo_profile_url || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // PERBAIKAN: Cek perubahan pada semua field, termasuk password
    const hasProfileChanged =
      formData.username !== userProfileData.username ||
      formData.photo_profile_url !== (userProfileData.photo_profile_url || "");
    const hasPasswordChanged = formData.password !== "";

    if (!hasProfileChanged && !hasPasswordChanged) {
      toast.info("Tidak ada perubahan yang perlu disimpan.");
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSave = () => {
    updateUserProfile(formData);
  };

  return (
    // REFAKTOR: Tambahkan judul halaman dan padding yang lebih konsisten
    <div className="container mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profil Pengguna
        </h1>
        <p className="text-muted-foreground">
          Kelola informasi profil dan lihat aktivitas Anda.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Kartu Profil Utama */}
        <aside className="lg:col-span-1">
          <Card className="overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
            {/* REFAKTOR: Header kartu dengan latar belakang gradien */}
            <CardHeader className="relative items-center bg-gradient-to-b from-muted/60 to-muted/20 p-6 text-center">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage
                  src={userProfileData.photo_profile_url ?? ""}
                  alt={userProfileData.username}
                />
                <AvatarFallback className="text-3xl font-semibold">
                  {getInitials(userProfileData.username)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-2xl">
                {userProfileData.username}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {userProfileData?.role?.role_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              {/* REFAKTOR: Detail profil yang lebih terstruktur */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">
                    Email
                  </span>
                  <span className="font-medium">{userProfileData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">
                    Total Aktivitas
                  </span>
                  <span className="font-medium">{userActivities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">
                    Status
                  </span>
                  <Badge
                    variant={
                      userProfileData.is_active ? "default" : "destructive"
                    }
                  >
                    {userProfileData.is_active ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="font-semibold text-muted-foreground">
                  Bergabung Sejak
                </span>
                <span>
                  {/* PERBAIKAN: Tambahkan pengecekan untuk memastikan created_at ada sebelum diformat */}
                  {userProfileData?.created_at
                    ? format(
                        new Date(userProfileData.created_at),
                        "d MMMM yyyy",
                        {
                          locale: id,
                        }
                      )
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Kolom Kanan: Pengaturan & Aktivitas */}
        <main className="space-y-8 lg:col-span-2">
          {/* Kartu Pengaturan Profil */}
          <Card
            as="form"
            onSubmit={handleSubmit}
            className="shadow-lg transition-shadow hover:shadow-xl"
          >
            <CardHeader>
              <CardTitle>Pengaturan Profil</CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda di sini.
              </CardDescription>
            </CardHeader>
            {/* REFAKTOR: Gabungkan semua field ke dalam satu CardContent */}
            <CardContent className="space-y-6">
              {/* Field Username */}
              <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                <Label htmlFor="username" className="sm:text-right">
                  Username
                </Label>
                <div className="sm:col-span-2">
                  {isEditing ? (
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="font-medium text-foreground">
                      {userProfileData.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Field URL Foto Profil */}
              <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                <Label htmlFor="photo_profile_url" className="sm:text-right">
                  URL Foto Profil
                </Label>
                <div className="sm:col-span-2">
                  {isEditing ? (
                    <Input
                      id="photo_profile_url"
                      name="photo_profile_url"
                      placeholder="https://example.com/photo.jpg"
                      value={formData.photo_profile_url}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="truncate font-medium text-muted-foreground">
                      {userProfileData.photo_profile_url || "Belum diatur"}
                    </p>
                  )}
                </div>
              </div>

              {/* BARU: Field untuk ubah kata sandi, hanya muncul saat mode edit */}
              {isEditing && (
                <>
                  <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                    <Label htmlFor="password" className="sm:text-right">
                      Kata Sandi Baru
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="sm:col-span-2"
                      placeholder="Kosongkan jika tidak ingin mengubah"
                      value={formData.new_password}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              {isEditing ? (
                <>
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    <XCircle className="mr-2 h-4 w-4" /> Batal
                  </Button>
                  <Button type="submit" disabled={isPending} className="z-10">
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan Perubahan
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit();
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Ubah Profil
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Kartu Riwayat Aktivitas */}
          <Card className="shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
              <CardDescription>
                Aktivitas terbaru yang Anda lakukan di platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto pr-2">
              {isLoadingActivities ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : userActivities.length > 0 ? (
                // REFAKTOR: Mengubah daftar menjadi timeline visual
                <ul className="relative border-l border-dashed border-border pl-6">
                  {userActivities.map((activity) => (
                    <li key={activity.id} className="mb-6 last:mb-0">
                      <span className="absolute -left-[1.1rem] flex h-8 w-8 items-center justify-center rounded-full bg-background ring-4 ring-background">
                        {getActivityIcon(activity.type)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Tidak ada aktivitas terbaru.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan pada profil Anda?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
