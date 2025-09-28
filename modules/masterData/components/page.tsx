"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Komponen & Utilitas
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { DataTable } from "./dataTable";
import { ManagementDialog } from "./ManagementDialog";

// Konfigurasi & Tipe Data
import { masterData } from "@/services/masterData.service";
import {
  MasterDataItem,
  SUB_MENU_CONFIG,
  CATEGORY_CONFIG,
  TAX_CONFIG,
  SubMenuKey,
} from "./config";
import { EnergyType } from "../types";
import { MeterCategoryType } from "@/services/meterCategory.service";

export const Page = () => {
  const queryClient = useQueryClient();

  // --- State untuk Tabel Utama (Dinamis) ---
  const [selectedEnergyTypeId, setSelectedEnergyTypeId] = useState<
    number | null
  >(null);
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuKey>("meters");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MasterDataItem | null>(null);

  // --- State untuk Tabel Kategori ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<MeterCategoryType | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<MeterCategoryType | null>(null);

  // --- State untuk Tabel Pajak ---
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);

  // --- Data Fetching ---
  const { data: energyTypesResponse, isLoading: isLoadingEnergyTypes } =
    useQuery({
      queryKey: ["energyTypes"],
      queryFn: masterData.energyType.getAll,
    });
  const energyTypes: EnergyType[] = energyTypesResponse?.data || [];

  useEffect(() => {
    if (energyTypes.length > 0 && !selectedEnergyTypeId) {
      setSelectedEnergyTypeId(energyTypes[0].energy_type_id);
    }
  }, [energyTypes, selectedEnergyTypeId]);

  const config = SUB_MENU_CONFIG[activeSubMenu];

  const { data: tableDataResponse, isLoading: isLoadingTableData } = useQuery({
    queryKey: [activeSubMenu, selectedEnergyTypeId],
    queryFn: () => config.api.getByEnergyType(selectedEnergyTypeId!),
    enabled: !!selectedEnergyTypeId,
  });
  const tableData = tableDataResponse?.data || [];

  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery(
    {
      queryKey: ["meterCategories"],
      queryFn: CATEGORY_CONFIG.api.getAll,
    }
  );
  const categoryData: MeterCategoryType[] = categoriesResponse?.data || [];

  const { data: taxesResponse, isLoading: isLoadingTaxes } = useQuery({
    queryKey: ["taxes"],
    queryFn: TAX_CONFIG.api.getAll,
  });
  const taxData: Tax[] = taxesResponse?.data || [];

  // --- Data Mutations ---
  const { mutate: createOrUpdateItem, isPending: isMutating } = useMutation({
    mutationFn: (itemData: any) => {
      const id = editingItem
        ? editingItem[config.idKey as keyof typeof editingItem]
        : undefined;
      const payload = { ...itemData, energy_type_id: selectedEnergyTypeId };
      return id ? config.api.update(id, payload) : config.api.create(payload);
    },
    onSuccess: () => {
      toast.success(`${config.title} berhasil disimpan!`);
      queryClient.invalidateQueries({
        queryKey: [activeSubMenu, selectedEnergyTypeId],
      });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) =>
      toast.error(
        `Gagal menyimpan: ${error.response?.data?.message || error.message}`
      ),
  });
  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: (item: MasterDataItem) =>
      config.api.delete(item[config.idKey as keyof typeof item]),
    onSuccess: () => {
      toast.success(`${config.title} berhasil dihapus!`);
      queryClient.invalidateQueries({
        queryKey: [activeSubMenu, selectedEnergyTypeId],
      });
      setItemToDelete(null);
    },
    onError: (error: any) =>
      toast.error(
        `Gagal menghapus: ${error.response?.data?.message || error.message}`
      ),
  });
  const { mutate: createOrUpdateCategory, isPending: isMutatingCategory } =
    useMutation({
      mutationFn: (categoryData: any) => {
        const id = editingCategory ? editingCategory.category_id : undefined;
        return id
          ? CATEGORY_CONFIG.api.update(id, categoryData)
          : CATEGORY_CONFIG.api.create(categoryData);
      },
      onSuccess: () => {
        toast.success("Kategori berhasil disimpan!");
        queryClient.invalidateQueries({ queryKey: ["meterCategories"] });
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
      },
      onError: (error: any) =>
        toast.error(
          `Gagal menyimpan kategori: ${
            error.response?.data?.message || error.message
          }`
        ),
    });
  const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation(
    {
      mutationFn: (item: MeterCategoryType) =>
        CATEGORY_CONFIG.api.delete(item.category_id),
      onSuccess: () => {
        toast.success("Kategori berhasil dihapus!");
        queryClient.invalidateQueries({ queryKey: ["meterCategories"] });
        setCategoryToDelete(null);
      },
      onError: (error: any) =>
        toast.error(
          `Gagal menghapus kategori: ${
            error.response?.data?.message || error.message
          }`
        ),
    }
  );
  const { mutate: createOrUpdateTax, isPending: isMutatingTax } = useMutation({
    mutationFn: (taxData: any) => {
      const id = editingTax ? editingTax.tax_id : undefined;
      return id
        ? TAX_CONFIG.api.update(id, taxData)
        : TAX_CONFIG.api.create(taxData);
    },
    onSuccess: () => {
      toast.success("Pajak berhasil disimpan!");
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      setIsTaxModalOpen(false);
      setEditingTax(null);
    },
    onError: (error: any) =>
      toast.error(
        `Gagal menyimpan pajak: ${
          error.response?.data?.message || error.message
        }`
      ),
  });
  const { mutate: deleteTax, isPending: isDeletingTax } = useMutation({
    mutationFn: (item: Tax) => TAX_CONFIG.api.delete(item.tax_id),
    onSuccess: () => {
      toast.success("Pajak berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      setTaxToDelete(null);
    },
    onError: (error: any) =>
      toast.error(
        `Gagal menghapus pajak: ${
          error.response?.data?.message || error.message
        }`
      ),
  });

  // --- Handlers ---
  const handleOpenModal = (item: MasterDataItem | null = null) => {
    setIsModalOpen(true);
    setEditingItem(item);
  };
  const handleDeleteRequest = (item: MasterDataItem) => setItemToDelete(item);
  const handleOpenCategoryModal = (item: MeterCategoryType | null = null) => {
    setIsCategoryModalOpen(true);
    setEditingCategory(item);
  };
  const handleDeleteCategoryRequest = (item: MeterCategoryType) =>
    setCategoryToDelete(item);
  const handleOpenTaxModal = (item: Tax | null = null) => {
    setIsTaxModalOpen(true);
    setEditingTax(item);
  };
  const handleDeleteTaxRequest = (item: Tax) => setTaxToDelete(item);

  // --- Memoized Values ---
  const memoizedColumns = useMemo(
    () => config.columns(handleOpenModal, handleDeleteRequest),
    [config]
  );
  const memoizedCategoryColumns = useMemo(
    () =>
      CATEGORY_CONFIG.columns(
        handleOpenCategoryModal,
        handleDeleteCategoryRequest
      ),
    []
  );
  const memoizedTaxColumns = useMemo(
    () => TAX_CONFIG.columns(handleOpenTaxModal, handleDeleteTaxRequest),
    []
  );
  const selectedEnergyTypeName = useMemo(
    () =>
      energyTypes.find((e) => e.energy_type_id === selectedEnergyTypeId)
        ?.type_name || "",
    [energyTypes, selectedEnergyTypeId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Manajemen Data Master</h1>
          <p className="text-muted-foreground">
            Kelola data inti sistem untuk {selectedEnergyTypeName || "..."}.
          </p>
        </div>
      </div>

      <Tabs
        value={selectedEnergyTypeId?.toString()}
        onValueChange={(val) => setSelectedEnergyTypeId(Number(val))}
      >
        <TabsList className="grid w-full grid-cols-3">
          {isLoadingEnergyTypes ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            energyTypes.map((et) => (
              <TabsTrigger
                key={et.energy_type_id}
                value={et.energy_type_id.toString()}
              >
                {et.type_name}
              </TabsTrigger>
            ))
          )}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(Object.keys(SUB_MENU_CONFIG) as SubMenuKey[]).map((key) => (
          <Button
            key={key}
            variant={activeSubMenu === key ? "default" : "outline"}
            onClick={() => setActiveSubMenu(key)}
          >
            Manajemen {SUB_MENU_CONFIG[key].title}
          </Button>
        ))}
      </div>

      <div className="grid  grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSubMenu}-${selectedEnergyTypeId}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>
                        Daftar {config.title} untuk {selectedEnergyTypeName}
                      </CardTitle>
                      <CardDescription>
                        Berikut daftar {config.title.toLowerCase()} yang
                        terdaftar.
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenModal()}
                      disabled={!selectedEnergyTypeId}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah{" "}
                      {config.title}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={memoizedColumns}
                    data={tableData}
                    isLoading={isLoadingTableData}
                    filterColumnId={config.filterKey}
                    filterPlaceholder={`Cari ${config.title.toLowerCase()}...`}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full space-y-6">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Kategori</CardTitle>
                      <CardDescription>
                        Kelola kategori lokasi meteran.
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => handleOpenCategoryModal()}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={memoizedCategoryColumns}
                    data={categoryData}
                    isLoading={isLoadingCategories}
                    filterColumnId={CATEGORY_CONFIG.filterKey}
                    filterPlaceholder="Cari kategori..."
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Pajak</CardTitle>
                      <CardDescription>
                        Kelola semua jenis pajak.
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => handleOpenTaxModal()}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={memoizedTaxColumns}
                    data={taxData}
                    isLoading={isLoadingTaxes}
                    filterColumnId={TAX_CONFIG.filterKey}
                    filterPlaceholder="Cari pajak..."
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ManagementDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? "Edit" : "Tambah"} ${config.title}`}
      >
        <config.FormComponent
          initialData={editingItem}
          onSubmit={createOrUpdateItem}
          isLoading={isMutating}
        />
      </ManagementDialog>
      <ManagementDialog
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={`${editingCategory ? "Edit" : "Tambah"} Kategori`}
      >
        <CATEGORY_CONFIG.FormComponent
          initialData={editingCategory}
          onSubmit={createOrUpdateCategory}
          isLoading={isMutatingCategory}
        />
      </ManagementDialog>
      <ManagementDialog
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        title={`${editingTax ? "Edit" : "Tambah"} Pajak`}
      >
        <TAX_CONFIG.FormComponent
          initialData={editingTax}
          onSubmit={createOrUpdateTax}
          isLoading={isMutatingTax}
        />
      </ManagementDialog>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus data '
              {itemToDelete?.[config.filterKey as keyof typeof itemToDelete]}'
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem(itemToDelete!)}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus kategori '{categoryToDelete?.name}' secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategory(categoryToDelete!)}
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!taxToDelete}
        onOpenChange={() => setTaxToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus pajak '{taxToDelete?.tax_name}' secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTax(taxToDelete!)}
              disabled={isDeletingTax}
            >
              {isDeletingTax ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
