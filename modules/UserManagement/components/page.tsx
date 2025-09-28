"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod"; // Impor Zod

// --- Service dan Tipe ---
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "@/services/users.service";
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/users.types";

// --- Komponen UI ---
import { createColumns } from "./CreateColumns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserForm } from "./UserForm";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { DataTable } from "./DataTable";

// PERBAIKAN: Definisikan skema Zod untuk create dan update
const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role_id: z.number(),
  is_active: z.boolean().default(true),
});

const updateUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter."),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter.")
    .optional()
    .or(z.literal("")), // Opsional saat update
  role_id: z.number(),
  is_active: z.boolean(),
});

export const Page = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // --- Fetching Data ---
  const {
    data: usersResponse, // Ganti nama agar lebih jelas
    isLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });
  // PERBAIKAN: Akses data yang benar
  const users = usersResponse?.data || [];

  // --- Mutations (tidak ada perubahan signifikan) ---
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

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
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

  // --- Handlers ---
  const handleOpenForm = (user: User | null = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // PERBAIKAN: Logika submit disederhanakan
  const handleFormSubmit = (values: CreateUserPayload | UpdateUserPayload) => {
    if (selectedUser) {
      updateUser({ userId: selectedUser.user_id, data: values });
    } else {
      createUser(values as CreateUserPayload);
    }
  };

  // --- Columns (tidak ada perubahan) ---
  const columns = useMemo(
    () => createColumns(handleOpenForm, handleOpenDelete),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* ... (Header tidak berubah) ... */}
      </div>

      <DataTable columns={columns} data={users} isLoading={isLoading} />

      {/* Dialog untuk Tambah/Edit Pengguna */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
            <DialogDescription>
              {/* ... (Deskripsi tidak berubah) ... */}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleFormSubmit}
            isPending={isCreating || isUpdating}
            defaultValues={selectedUser}
            // PERBAIKAN: Kirim skema yang sesuai ke komponen Form
            schema={selectedUser ? updateUserSchema : createUserSchema}
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
          isPending={isDeleting}
        />
      )}
    </div>
  );
};
