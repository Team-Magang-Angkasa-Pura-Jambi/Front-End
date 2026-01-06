import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProfileFormValues, profileSchema } from "../schemas/profile.schema";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatePresence, motion } from "motion/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, Pencil, Save, XCircle } from "lucide-react";
import { User } from "@/common/types/user";

export const AccountSettingsForm = ({
  user,
  onSubmit,
  isPending,
}: {
  user: User;
  onSubmit: (values: ProfileFormValues, reset: () => void) => void;
  isPending: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !isEditing) {
      form.reset({ username: user.username, password: "" });
    }
  }, [user, isEditing, form]);

  const handleSubmit = (values: ProfileFormValues) => {
    onSubmit(values, () => setIsEditing(false));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pengaturan Akun</CardTitle>
        <CardDescription>
          Perbarui informasi profil dan keamanan akun Anda.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-mode"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...form.register("username")}
                    className="max-w-md"
                  />
                  {form.formState.errors.username && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <div className="relative max-w-md">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Kosongkan jika tidak ingin mengubah"
                      {...form.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-1"
              >
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Username
                  </span>
                  <p className="text-lg font-medium text-foreground">
                    {user?.username}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t bg-muted/5 px-6 py-4">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
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
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Profil
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};
