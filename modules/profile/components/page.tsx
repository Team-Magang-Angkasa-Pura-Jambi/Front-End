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
  Loader2,
  Pencil,
  Save,
  XCircle,
  ShieldCheck,
  History,
  Target,
  Bell,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { updateUserApi } from "@/services/users.service";
import { UpdateUserPayload } from "@/types/users.types";
import { useEffect, useState } from "react";

// Tipe untuk data mockup riwayat aktivitas
type Activity = {
  id: number;
  type: "TARGET_SET" | "ALERT_ACK" | "LOGBOOK_ENTRY";
  description: string;
  createdAt: Date;
};

// Helper untuk mendapatkan inisial dari username
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper untuk ikon aktivitas
const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "TARGET_SET":
      return <Target className="h-5 w-5 text-blue-500" />;
    case "ALERT_ACK":
      return <Bell className="h-5 w-5 text-yellow-500" />;
    case "LOGBOOK_ENTRY":
      return <History className="h-5 w-5 text-green-500" />;
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
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Mengambil data user terbaru dari API menggunakan ID dari global state
  const {
    data: userProfileData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", user?.user_id],
    queryFn: () => user?.user_id, // Placeholder, karena data sudah ada di global state
    initialData: user, // Menggunakan data dari global state sebagai data awal
    enabled: !!user?.user_id,
    refetchOnWindowFocus: false,
  });

  // Sinkronisasi state form ketika data user dari store berubah
  useEffect(() => {
    if (userProfileData) {
      setFormData({
        username: userProfileData.username,
        photo_profile_url: userProfileData.photo_profile_url || "",
      });
    }
  }, [userProfileData]);

  const { mutate: updateUserProfile, isPending } = useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      updateUserApi(userProfileData!.user_id, payload),
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

  if (isLoading || !userProfileData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
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
    if (
      formData.username === userProfileData.username &&
      formData.photo_profile_url === (userProfileData.photo_profile_url || "")
    ) {
      toast.info("Tidak ada perubahan yang perlu disimpan.");
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSave = () => {
    updateUserProfile(formData);
  };

  // --- MOCKUP DATA untuk Riwayat Aktivitas ---
  // TODO: Ganti dengan data asli dari API endpoint (misal: /api/users/:id/activity)
  const userActivities: Activity[] = [
    {
      id: 1,
      type: "LOGBOOK_ENTRY",
      description: "Melakukan pengecekan rutin pada Meter Gedung A.",
      createdAt: new Date("2025-09-29T14:00:00"),
    },
    {
      id: 2,
      type: "TARGET_SET",
      description: `Menetapkan target efisiensi baru untuk ${userProfileData.username}.`,
      createdAt: new Date("2025-09-25T09:30:00"),
    },
    {
      id: 3,
      type: "ALERT_ACK",
      description: "Menanggapi peringatan 'Konsumsi Tinggi' pada Panel 3.",
      createdAt: new Date("2025-09-22T17:15:00"),
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Kartu Profil Utama */}
        <aside className="lg:col-span-1">
          <Card className="overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader className="items-center bg-muted/40 p-6 text-center">
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
                {userProfileData.role.role_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-sm">
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
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ubah Kata Sandi
              </Button>
            </CardFooter>
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
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="rounded-md border bg-muted px-3 py-2 text-sm">
                    {userProfileData.username}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo_profile_url">URL Foto Profil</Label>
                {isEditing ? (
                  <Input
                    id="photo_profile_url"
                    name="photo_profile_url"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.photo_profile_url}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground truncate">
                    {userProfileData.photo_profile_url || "Belum diatur"}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              {isEditing ? (
                <>
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    <XCircle className="mr-2 h-4 w-4" /> Batal
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan Perubahan
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={handleEdit}>
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
            <CardContent>
              <ul className="space-y-4">
                {userActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.createdAt, {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
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
