"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/common/components/ui/dialog";
import { PageGuidesService, PageGuideModel } from "../services/pageGuides.service";
import { toast } from "sonner";


export const GuideManagementPage = () => {
  const [guides, setGuides] = useState<PageGuideModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<PageGuideModel | Partial<PageGuideModel> | null>(null);

  const fetchGuides = async () => {
    try {
      setIsLoading(true);
      const data = await PageGuidesService.getAll();
      setGuides(data);
    } catch (error: unknown) {
      toast.error("Gagal memuat daftar panduan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleEdit = (guide: PageGuideModel) => {
    setCurrentGuide(JSON.parse(JSON.stringify(guide))); // Deep copy
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentGuide({
      route: "",
      title: "",
      overview: "",
      workflow: [],
      buttons: [],
      tips: [],
      is_active: true
    });
    setIsCreating(true);
  };

  const handleDelete = async (guide_id: number) => {
    if (!confirm("Yakin ingin menghapus panduan ini?")) return;
    try {
      await PageGuidesService.delete(guide_id);
      toast.success("Panduan berhasil dihapus");
      fetchGuides();
    } catch (error) {
      toast.error("Gagal menghapus panduan");
    }
  };

  const handleSave = async () => {
    if (!currentGuide) return;
    try {
      if (isEditing && (currentGuide as PageGuideModel).guide_id) {
        await PageGuidesService.update((currentGuide as PageGuideModel).guide_id, currentGuide);
        toast.success("Panduan berhasil diperbarui");
      } else {
        await PageGuidesService.create(currentGuide);
        toast.success("Panduan berhasil dibuat");
      }
      setIsEditing(false);
      setIsCreating(false);
      fetchGuides();
    } catch (error: unknown) {
      toast.error("Gagal menyimpan panduan");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 lg:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Manajemen Panduan Sistem
        </h1>
        <p className="text-muted-foreground">
          Konfigurasi dan kelola panduan kontekstual (Workflow & Aksi Cepat) untuk setiap halaman.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Panduan Halaman</CardTitle>
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Tambah Panduan
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
                    <th className="p-3 border-b">Rute / Path</th>
                    <th className="p-3 border-b">Judul Halaman</th>
                    <th className="p-3 border-b">Status</th>
                    <th className="p-3 border-b text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {guides.map((guide) => (
                    <tr key={guide.guide_id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{guide.route}</td>
                      <td className="p-3 font-medium">{guide.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${guide.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {guide.is_active ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(guide as PageGuideModel)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(guide.guide_id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDIT MODAL */}
      <Dialog open={isEditing || isCreating} onOpenChange={(open) => {
        setIsEditing(open && isEditing);
        setIsCreating(open && isCreating);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Tambah Panduan Baru" : `Edit Panduan: ${currentGuide?.route}`}</DialogTitle>
          </DialogHeader>

          {currentGuide && (
            <div className="grid gap-4 py-4">
              {isCreating && (
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Rute / Path</label>
                  <Input
                    value={currentGuide.route || ""}
                    onChange={e => setCurrentGuide({ ...currentGuide, route: e.target.value })}
                    placeholder="Contoh: /dashboard/meters"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Judul Halaman</label>
                <Input
                  value={currentGuide.title}
                  onChange={e => setCurrentGuide({ ...currentGuide, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Ringkasan (Overview)</label>
                <Textarea
                  className="h-24"
                  value={currentGuide.overview}
                  onChange={e => setCurrentGuide({ ...currentGuide, overview: e.target.value })}
                />
              </div>

              <div className="grid gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Langkah-langkah (Workflow)</label>
                  <Button size="sm" variant="outline" onClick={() => {
                    const newWorkflow = [...(currentGuide.workflow || []), { stepNumber: (currentGuide.workflow || []).length + 1, title: "", instruction: "" }];
                    setCurrentGuide({ ...currentGuide, workflow: newWorkflow });
                  }}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah Langkah
                  </Button>
                </div>
                {(currentGuide.workflow || []).map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start border p-3 rounded-lg bg-muted/20">
                    <div className="flex-1 grid gap-2">
                      <Input placeholder="Judul Langkah" value={step.title} onChange={e => {
                        const wf = [...(currentGuide.workflow || [])]; wf[idx].title = e.target.value; setCurrentGuide({ ...currentGuide, workflow: wf });
                      }} />
                      <Textarea className="h-16" placeholder="Instruksi" value={step.instruction} onChange={e => {
                        const wf = [...(currentGuide.workflow || [])]; wf[idx].instruction = e.target.value; setCurrentGuide({ ...currentGuide, workflow: wf });
                      }} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const wf = [...(currentGuide.workflow || [])]; wf.splice(idx, 1); setCurrentGuide({ ...currentGuide, workflow: wf });
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }}>Batal</Button>
            <Button onClick={handleSave}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
