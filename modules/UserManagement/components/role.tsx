"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { MoreHorizontal, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createRoleApi,
  CreateRolePayload,
  deleteRoleApi,
  getRolesApi,
  Role,
  updateRoleApi,
  UpdateRolePayload,
} from "@/services/role.service";
import { DataTable } from "@/modules/UserManagement/components/DataTable";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Skema validasi menggunakan Zod
const roleSchema = z.object({
  role_name: z.string().min(3, "Nama peran minimal 3 karakter."),
});

const createRoleColumns = (
  onEdit: (role: Role) => void,
  onDelete: (role: Role) => void
): ColumnDef<Role>[] => [
  {
    accessorKey: "role_name",
    header: "Nama Peran",
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const role = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(role)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(role)}
              className="text-red-600"
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null); // --- Fetching Data ---

  const { data: rolesResponse, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRolesApi,
  });
  const roles = rolesResponse?.data || []; // --- Mutations ---

  const { mutate: createRole, isPending: isCreating } = useMutation({
    mutationFn: (roleData: CreateRolePayload) => createRoleApi(roleData),
    onSuccess: () => {
      toast.success("Peran baru berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsFormOpen(false);
    },
    onError: (error) => toast.error(`Gagal membuat peran: ${error.message}`),
  });

  const { mutate: updateRole, isPending: isUpdating } = useMutation({
    mutationFn: (variables: { roleId: number; data: UpdateRolePayload }) =>
      updateRoleApi(variables.roleId, variables.data),
    onSuccess: () => {
      toast.success("Data peran berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsFormOpen(false);
      setSelectedRole(null);
    },
    onError: (error) => toast.error(`Gagal memperbarui data: ${error.message}`),
  });

  const { mutate: deleteRole, isPending: isDeleting } = useMutation({
    mutationFn: (roleId: number) => deleteRoleApi(roleId),
    onSuccess: () => {
      toast.success("Peran berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsDeleteOpen(false);
      setSelectedRole(null);
    },
    onError: (error) => toast.error(`Gagal menghapus peran: ${error.message}`),
  }); // --- Handlers ---

  const handleOpenForm = (role: Role | null = null) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (values: CreateRolePayload) => {
    if (selectedRole) {
      updateRole({ roleId: selectedRole.role_id, data: values });
    } else {
      createRole(values);
    }
  };

  const columns = useMemo(
    () => createRoleColumns(handleOpenForm, handleOpenDelete),
    []
  );

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={roles} isLoading={isLoading} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Peran" : "Tambah Peran Baru"}
            </DialogTitle>
          </DialogHeader>

          <Form
            {...useForm({
              resolver: zodResolver(roleSchema),
              defaultValues: { role_name: selectedRole?.role_name || "" },
            })}
          >
            <form
              onSubmit={useForm().handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={useForm().control}
                name="role_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Peran</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Teknisi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {selectedRole && (
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus peran{" "}
                <strong>{selectedRole.role_name}</strong> secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteRole(selectedRole.role_id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
