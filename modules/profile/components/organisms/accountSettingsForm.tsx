"use client";

import { ImageUpload } from "@/common/components/form/ImageUpload";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { UserProfileData } from "@/common/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Save,
  User2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { ProfileFormValues, profileSchema } from "../../schemas/profile.schema";

export const AccountSettingsForm = ({
  user,
  onSubmit,
  isPending,
  isEditing,
  setIsEditing,
}: {
  user: UserProfileData;
  onSubmit: (values: ProfileFormValues) => void;
  isPending: boolean;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
    values: {
      username: user?.username || "",
      full_name: user?.full_name || "",
      email: user?.email || "",
      role_id: user?.role?.role_id,
      is_active: user?.is_active ?? true,
      password: "",
      image_url: user?.image_url || "",
    },
  });

  return (
    <Card className="border-muted/60 overflow-hidden shadow-md transition-all duration-300">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Fingerprint className="text-primary h-5 w-5" />
              Pengaturan Akun
            </CardTitle>
            <CardDescription>
              Perbarui identitas dan keamanan akun Anda dalam satu tempat.
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-9">
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Section: Informasi Publik */}
                <div className="space-y-4">
                  <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <User2 className="h-4 w-4" /> Informasi Profil
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nama Lengkap</Label>
                      <Input
                        id="full_name"
                        {...form.register("full_name")}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...form.register("username")}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                      <KeyRound className="h-4 w-4" /> Keamanan & Email
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input id="email" type="email" {...form.register("email")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Ganti Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...form.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload: Dibuat minimalis karena sudah ada avatar di ProfilePage */}
                  <div className="bg-muted/20 flex flex-col gap-4 rounded-lg border border-dashed p-3">
                    <div className="space-y-0.5">
                      <Label className="text-xs">Foto Profil</Label>
                      <p className="text-muted-foreground text-[10px]">
                        Klik icon untuk ganti gambar
                      </p>
                    </div>
                    <ImageUpload
                      value={form.watch("image_url") || ""}
                      onChange={(url: string) =>
                        form.setValue("image_url", url, { shouldDirty: true })
                      }
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Section: Keamanan */}
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2"
              >
                <div className="group space-y-1">
                  <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                    Nama Lengkap
                  </p>
                  <p className="text-base font-medium">{user.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                    Username
                  </p>
                  <p className="text-primary text-base font-medium">@{user.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                    Email
                  </p>
                  <div className="flex items-center gap-2 text-base font-medium">
                    <Mail className="text-muted-foreground h-4 w-4" /> {user.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                    Status Akun
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${user.is_active ? "animate-pulse bg-emerald-500" : "bg-red-500"}`}
                    />
                    <span className="text-sm font-semibold">
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {isEditing && (
          <CardFooter className="bg-muted/30 flex justify-end gap-3 border-t p-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              <XCircle className="mr-2 h-4 w-4" /> Batal
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !form.formState.isDirty}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
};
