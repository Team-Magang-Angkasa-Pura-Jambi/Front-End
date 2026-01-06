"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createRoleApi,
  CreateRolePayload,
  deleteRoleApi,
  getRolesApi,
  Role,
  updateRoleApi,
  UpdateRolePayload,
} from "@/services/role.service";
import { DataTable } from "@/components/DataTable";
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

const createRoleColumns = (): ColumnDef<Role>[] => [
  {
    accessorKey: "role_name",
    header: "Nama Peran",
  },
];

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRolesApi,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
  const roles = useMemo(() => rolesData?.data || [], [rolesData?.data]);

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
  });

  const columns = useMemo(() => createRoleColumns(), []);

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
