"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import {
  categoryApi,
  CategoryType,
  CreateCategoryPayload,
} from "@/modules/masterData/services/category.service";

import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { categorySchema, categoryType } from "../schemas/category.schema";
import { DataTable } from "@/common/components/table/dataTable";
import { DataTableRowActions } from "@/common/components/table/dataTableRowActions";

// Definisi kolom dipisah agar lebih bersih, namun tetap butuh closure untuk handler
const createCategoryColumns = (
  onEdit: (item: CategoryType) => void,
  onDelete: (item: CategoryType) => void
): ColumnDef<CategoryType>[] => [
  { accessorKey: "name", header: "Nama Kategori" },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];

export const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryType | null>(
    null
  );

  const form = useForm<categoryType>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAll();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => {
      if (editingCategory) {
        return categoryApi.update(editingCategory.category_id, payload);
      }
      return categoryApi.create(payload);
    },
    onSuccess: () => {
      toast.success(
        `Kategori berhasil ${editingCategory ? "diperbarui" : "ditambahkan"}.`
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      handleDialogChange(false);
    },
    onError: (error) => {
      toast.error("Gagal menyimpan kategori.", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryToDelete(null);
    },
    onError: (error) => {
      toast.error("Gagal menghapus kategori.", {
        description: error.message,
      });
    },
  });

  const handleOpenDialog = useCallback(
    (category: CategoryType | null = null) => {
      setEditingCategory(category);
      form.reset(category ? { name: category.name } : { name: "" });
      setIsDialogOpen(true);
    },
    [form]
  );

  const handleDialogChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
        setEditingCategory(null);
        form.reset({ name: "" });
      }
    },
    [form]
  );

  const handleDeleteRequest = useCallback((item: CategoryType) => {
    setCategoryToDelete(item);
  }, []);

  const onSubmit = (values: z.infer<typeof categorySchema>) => {
    mutation.mutate(values);
  };

  const columns = useMemo(
    () => createCategoryColumns(handleOpenDialog, handleDeleteRequest),
    [handleOpenDialog, handleDeleteRequest]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manajemen Kategori</CardTitle>
            <CardDescription>
              Kelola kategori untuk pengelompokan meteran.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable<CategoryType, unknown>
          columns={columns}
          data={data || []}
          isLoading={isLoading}
          filterColumnId="name"
          filterPlaceholder="Cari Kategori"
        />
      </CardContent>

      {/* Dialog Form (Create/Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi nama kategori di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Gedung Utama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog (Delete Confirmation) */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus kategori{" "}
              <span className="text-foreground font-bold">
                {categoryToDelete?.name}
              </span>
              . Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (categoryToDelete) {
                  deleteMutation.mutate(categoryToDelete.category_id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
