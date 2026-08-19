"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Activity, CheckCircle2, Edit, Loader2, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/authStore";
import { ProfileFormValues } from "../../schemas/profile.schema";
import { getUserApi, updateUserApi } from "../../services/users.service";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Separator } from "@/common/components/ui/separator";
import { AuditLog } from "@/common/types/user";
import { AccountSettingsForm } from "../organisms/accountSettingsForm";

export const ProfilePage = () => {
  const { user: authUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<ProfileFormValues | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["userProfile", authUser?.id],
    queryFn: () => getUserApi(authUser!.id),
    enabled: !!authUser?.id,
  });

  const profile = response?.data;
  // Ambil audit logs dari data backend
  const userActivities = profile?.audit_logs || [];

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (values: Partial<ProfileFormValues>) => {
      // Filter payload agar tidak mengirim string kosong ke BE
      const payload = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== "" && v !== undefined)
      );
      return updateUserApi(profile!.user_id, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.status?.message || "Profil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] });
      setIsEditing(false);
      setIsConfirmOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal update profil");
    },
  });

  const handleFormSubmit = (values: ProfileFormValues) => {
    setPendingValues(values);
    setIsConfirmOpen(true);
  };

  const getLogConfig = (action: string) => {
    switch (action) {
      case "CREATE":
        return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" };
      case "UPDATE":
        return { icon: Edit, color: "text-blue-500", bg: "bg-blue-50" };
      case "DELETE":
        return { icon: Trash2, color: "text-red-500", bg: "bg-red-50" };
      default:
        return { icon: Activity, color: "text-gray-500", bg: "bg-gray-50" };
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground text-sm">
          Kelola kredensial dan pantau aktivitas sistem Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* KIRI: PANEL INFORMASI */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="overflow-hidden border-none shadow-xl">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
            <CardContent className="relative pb-8 text-center">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <Avatar className="border-background h-32 w-32 border-4 shadow-lg">
                  <AvatarImage src={profile.image_url || ""} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-4xl font-bold">
                    {profile.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-20 space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">{profile.full_name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="gap-1 px-3 py-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    {profile.role?.role_name || "USER"}
                  </Badge>
                  <Badge variant={profile.is_active ? "outline" : "destructive"}>
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Email
                    </p>
                    <p className="truncate text-sm font-medium">{profile.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KANAN: FORM & AUDIT LOGS */}
        <div className="space-y-6 lg:col-span-8">
          <AccountSettingsForm
            user={profile}
            onSubmit={handleFormSubmit}
            isPending={isPending}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Riwayat Aktivitas</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {userActivities.length > 0 ? (
                <div className="relative ml-3 space-y-6 border-l-2 border-slate-100 pl-6">
                  {userActivities.map((log: AuditLog) => {
                    const config = getLogConfig(log.action);
                    return (
                      <div key={log.log_id} className="relative">
                        <div
                          className={`absolute top-1 -left-[35px] flex h-8 w-8 items-center justify-center rounded-full border-4 border-white ${config.bg}`}
                        >
                          <config.icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold">
                            {log.action}{" "}
                            <span className="text-muted-foreground font-normal">pada tabel</span>{" "}
                            {log.entity_table}
                          </p>
                          <p className="text-muted-foreground text-xs italic">
                            ID Entitas: {log.entity_id}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  Tidak ada aktivitas terbaru.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data Anda akan segera diperbarui di seluruh sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingValues && updateProfile(pendingValues)}
              className="bg-primary"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
