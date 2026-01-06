"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Pencil,
  Save,
  ShieldCheck,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

import { useAuthStore } from "@/stores/authStore";
import {
  getUserApi,
  getUserActivitiesApi,
  updateUserApi,
} from "@/modules/profile/services/users.service";
import { ProfileFormValues } from "../schemas/profile.schema";
import { ProfileSidebar } from "./profileSidebar";
import { AccountSettingsForm } from "./accountSettingsForm";
import { ActivityLog } from "./activityLog";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    values?: ProfileFormValues;
    onSuccessCallback?: () => void;
  }>({ open: false });

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUserApi(user!.id),
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const { data: activitiesData, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ["userActivities", user?.id],
    queryFn: () => getUserActivitiesApi(user!.id),
    enabled: !!user?.id,
    select: (res) => res.data.history || [],
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { mutate: updateUser, isPending: isUpdatePending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    ProfileFormValues
  >({
    mutationFn: (values) => {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== "")
      );
      return updateUserApi(user!.id, payload);
    },
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["user", user!.id] });

      if (confirmDialog.onSuccessCallback) {
        confirmDialog.onSuccessCallback();
      }
      setConfirmDialog({ open: false });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.status?.message || "Gagal memperbarui profil"
      );
    },
  });

  const handleUpdateAttempt = (
    values: ProfileFormValues,
    onSuccessCallback: () => void
  ) => {
    const currentUsername = userProfile?.data?.username;
    const isUnchanged = values.username === currentUsername && !values.password;

    if (isUnchanged) {
      toast.info("Tidak ada perubahan yang perlu disimpan");
      return;
    }
    setConfirmDialog({ open: true, values, onSuccessCallback });
  };

  const confirmUpdate = () => {
    if (confirmDialog.values) {
      updateUser(confirmDialog.values);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  const userData = userProfile?.data;

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 pb-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profil Pengguna
        </h1>
        <p className="text-muted-foreground">
          Kelola informasi pribadi dan keamanan akun Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Kiri */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <ProfileSidebar user={userData} />
        </aside>

        {/* Konten Kanan */}
        <main className="lg:col-span-8 space-y-8">
          <AccountSettingsForm
            user={userData}
            onSubmit={handleUpdateAttempt}
            isPending={isUpdatePending}
          />
          <ActivityLog
            activities={activitiesData || []}
            isLoading={isActivitiesLoading}
          />
        </main>
      </div>

      {/* Dialog Konfirmasi Global */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan pada profil ini?
              Tindakan ini akan memperbarui data Anda di sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdate}
              disabled={isUpdatePending}
              className="bg-primary hover:bg-primary/90"
            >
              {isUpdatePending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
