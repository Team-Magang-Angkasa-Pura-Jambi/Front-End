"use client";

import React, { useEffect, useState } from "react";
import { LayoutList, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/common/components/ui/dialog";
import { MenuService, MenuModel } from "../services/menu.service";
import { toast } from "sonner";

export const MenuManagementPage = () => {
  const [menus, setMenus] = useState<MenuModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuModel | Partial<MenuModel> | null>(null);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const data = await MenuService.getAll();
      setMenus(data);
    } catch (error: unknown) {
      toast.error("Gagal memuat daftar menu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEdit = (menu: MenuModel) => {
    setCurrentMenu(JSON.parse(JSON.stringify(menu)));
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentMenu({
      name: "",
      route: "",
      icon_name: "",
      allowed_roles: [],
      status: "ACTIVE",
      parent_id: null,
      sort_order: 0,
    });
    setIsCreating(true);
  };

  const handleDelete = async (menu_id: number) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await MenuService.delete(menu_id);
      toast.success("Menu berhasil dihapus");
      fetchMenus();
    } catch (error) {
      toast.error("Gagal menghapus menu");
    }
  };

  const handleSave = async () => {
    if (!currentMenu) return;
    try {
      if (isEditing && (currentMenu as MenuModel).menu_id) {
        await MenuService.update((currentMenu as MenuModel).menu_id, currentMenu);
        toast.success("Menu berhasil diperbarui");
      } else {
        await MenuService.create(currentMenu);
        toast.success("Menu berhasil dibuat");
      }
      setIsEditing(false);
      setIsCreating(false);
      fetchMenus();
    } catch (error: unknown) {
      toast.error("Gagal menyimpan menu");
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">AKTIF</span>;
      case 'MAINTENANCE': return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">MAINTENANCE</span>;
      case 'INACTIVE': return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">NONAKTIF</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 lg:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <LayoutList className="h-8 w-8 text-primary" />
          Manajemen Menu
        </h1>
        <p className="text-muted-foreground">
          Konfigurasi dan kelola menu navigasi sistem, termasuk status maintenance.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Menu</CardTitle>
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Tambah Menu
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-3 border-b">Nama Menu</th>
                    <th className="p-3 border-b">Rute / Path</th>
                    <th className="p-3 border-b">Icon</th>
                    <th className="p-3 border-b">Urutan</th>
                    <th className="p-3 border-b">Status</th>
                    <th className="p-3 border-b text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.menu_id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">
                        {menu.parent_id ? <span className="ml-4 text-muted-foreground">└─ {menu.name}</span> : menu.name}
                      </td>
                      <td className="p-3 font-mono text-xs">{menu.route || '-'}</td>
                      <td className="p-3">{menu.icon_name || '-'}</td>
                      <td className="p-3">{menu.sort_order}</td>
                      <td className="p-3">{renderStatus(menu.status)}</td>
                      <td className="p-3 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(menu)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(menu.menu_id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {menus.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">Belum ada menu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditing || isCreating} onOpenChange={(open) => {
        setIsEditing(open && isEditing);
        setIsCreating(open && isCreating);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Tambah Menu Baru" : "Edit Menu"}</DialogTitle>
          </DialogHeader>

          {currentMenu && (
            <><div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Nama Menu</label>
                <Input
                  value={currentMenu.name || ""}
                  onChange={e => setCurrentMenu({ ...currentMenu, name: e.target.value })}
                  placeholder="Misal: Dashboard" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Rute / Path</label>
                <Input
                  value={currentMenu.route || ""}
                  onChange={e => setCurrentMenu({ ...currentMenu, route: e.target.value })}
                  placeholder="Misal: /dashboard (Kosongkan jika hanya parent)" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Nama Icon (Opsional)</label>
                  <Input
                    value={currentMenu.icon_name || ""}
                    onChange={e => setCurrentMenu({ ...currentMenu, icon_name: e.target.value })}
                    placeholder="Misal: Home" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Urutan (Sort Order)</label>
                  <Input
                    type="number"
                    value={currentMenu.sort_order || 0}
                    onChange={e => setCurrentMenu({ ...currentMenu, sort_order: Number(e.target.value) })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Parent Menu ID (Opsional)</label>
                  <Input
                    type="number"
                    value={currentMenu.parent_id || ""}
                    onChange={e => setCurrentMenu({ ...currentMenu, parent_id: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Kosongkan jika menu utama" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Status</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={currentMenu.status}
                    onChange={e => setCurrentMenu({ ...currentMenu, status: e.target.value as any })}
                  >
                    <option value="ACTIVE">AKTIF</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">NONAKTIF</option>
                  </select>
                </div>
              </div>
            </div><div className="grid gap-2">
                <label className="text-sm font-semibold">Hak Akses (Roles)</label>
                <div className="flex gap-4 items-center">
                  {["SUPER_ADMIN", "ADMIN", "TECHNICIAN"].map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={currentMenu.allowed_roles?.includes(role) || false}
                        onChange={(e) => {
                          const roles = currentMenu.allowed_roles || [];
                          if (e.target.checked) {
                            setCurrentMenu({ ...currentMenu, allowed_roles: [...roles, role] });
                          } else {
                            setCurrentMenu({ ...currentMenu, allowed_roles: roles.filter(r => r !== role) });
                          }
                        }} />
                      {role}
                    </label>
                  ))}
                </div>
              </div></>
          )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }}>Batal</Button>
          <Button onClick={handleSave}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div >
  );
};
