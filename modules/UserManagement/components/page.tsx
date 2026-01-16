"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "@/modules/profile/services/users.service";
import { CreateUserPayload, UpdateUserPayload } from "@/types/users.types";

// --- Komponen UI ---
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { createColumns } from "./CreateColumns";
import { Button } from "@/common/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { toast } from "sonner";
import { UserForm } from "./UserForm";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { DataTable } from "../../../common/components/table/dataTable";
import RolesPage from "./role";
import { User } from "@/common/types/user";

export const Page = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  const users = usersResponse?.data || [];

  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: (userData: CreateUserPayload) => createUserApi(userData),
    onSuccess: () => {
      toast.success("Pengguna baru berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsFormOpen(false);
    },
    onError: (error) => toast.error(`Gagal membuat pengguna: ${error.message}`),
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: (variables: { userId: number; data: UpdateUserPayload }) =>
      updateUserApi(variables.userId, variables.data),
    onSuccess: () => {
      toast.success("Data pengguna berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsFormOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => toast.error(`Gagal memperbarui data: ${error.message}`),
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (userId: number) => deleteUserApi(userId),
    onSuccess: () => {
      toast.success("Pengguna berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteOpen(false);
      setSelectedUser(null);
    },
    onError: (error) =>
      toast.error(`Gagal menghapus pengguna: ${error.message}`),
  });

  const handleOpenForm = (user: User | null = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (values: CreateUserPayload | UpdateUserPayload) => {
    if (selectedUser) {
      updateUser({ userId: selectedUser.user_id, data: values });
    } else {
      createUser(values as CreateUserPayload);
    }
  };

  const columns = useMemo(
    () => createColumns(handleOpenForm, handleOpenDelete),
    []
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">
        Manajemen Pengguna & Peran
      </h2>
      <p className="text-muted-foreground">
        Kelola semua akun pengguna dan peran yang terdaftar di sistem.
      </p>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        {/* --- Tabel Pengguna --- */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Pengguna</CardTitle>
              <Button size="sm" onClick={() => handleOpenForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={users} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* --- Tabel Peran --- */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Peran</CardTitle>
          </CardHeader>
          <CardContent>
            <RolesPage />
          </CardContent>
        </Card>
      </div>
      {/* Dialog untuk Tambah/Edit Pengguna */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
            <DialogDescription>
              Kelola semua akun pengguna yang terdaftar di sistem.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleFormSubmit}
            isPending={isCreating || isUpdating}
            defaultValues={selectedUser || undefined} // Pass defaultValues directly
            // The schema prop is not needed here as it's handled internally by UserForm
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Konfirmasi Hapus */}
      {selectedUser && (
        <DeleteUserDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => deleteUser(selectedUser.user_id)}
          username={selectedUser.username}
        />
      )}
    </div>
  );
};
