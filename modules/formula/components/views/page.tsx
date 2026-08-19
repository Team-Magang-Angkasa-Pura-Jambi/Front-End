"use client";

import { FormulaDefinition, FormulaItem, INITIAL_FORMULAS } from "@/modules/formula/constants";
import { useMemo, useState } from "react";
import { FormulaCanvas } from "../molecules/FormulaCanvas";
import { FormulaHeader } from "../molecules/FormulaHeader";
import { FormulaSidebar } from "../molecules/Sidebar";

// --- HELPERS ---
const generateId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function FormulaBuilderPage() {
  // --- STATE ---
  const [formulas, setFormulas] = useState<FormulaDefinition[]>(INITIAL_FORMULAS);
  const [activeFormulaId, setActiveFormulaId] = useState<string>("main");

  // Memastikan activeFormula selalu valid
  const activeFormula = useMemo(() => {
    return formulas.find((f) => f.id === activeFormulaId) || formulas[0];
  }, [formulas, activeFormulaId]);

  // --- LOGIC HANDLERS (UI FOCUS) ---

  /**
   * Update item di canvas untuk formula yang aktif
   */
  const updateItems = (newItems: FormulaItem[]) => {
    setFormulas((prev) =>
      prev.map((f) => (f.id === activeFormulaId ? { ...f, items: newItems } : f))
    );
  };

  /**
   * Menambahkan item (Reading, Spec, atau Operator) ke canvas
   */
  const handleAddItem = (sourceItem: any) => {
    const newItem: FormulaItem = {
      ...sourceItem,
      id: generateId("item"),
      // Default timeShift 0 (Sekarang) untuk reading
      timeShift: sourceItem.type === "reading" ? 0 : undefined,
    };
    updateItems([...activeFormula.items, newItem]);
  };

  /**
   * Menghapus item berdasarkan index
   */
  const handleRemoveItem = (index: number) => {
    const list = [...activeFormula.items];
    list.splice(index, 1);
    updateItems(list);
  };

  /**
   * Toggle Waktu (Sekarang -> Kemarin -> N-1)
   * Ini krusial untuk kasus WBP/LWBP Bandara
   */
  const handleToggleTime = (index: number) => {
    const item = activeFormula.items[index];
    if (item.type !== "reading") return;

    let next = (item.timeShift || 0) - 1;
    if (next < -1) next = 0; // Loop: 0 (Sekarang) -> -1 (Kemarin) -> Kembali ke 0

    const list = [...activeFormula.items];
    list[index] = { ...item, timeShift: next };
    updateItems(list);
  };

  /**
   * Membuat Sub-Variabel baru (Misal: Rumus khusus untuk area perkantoran)
   */
  const createNewVariable = () => {
    const newId = generateId("var");
    const newFormula: FormulaDefinition = {
      id: newId,
      name: "Sub-Kalkulasi Baru",
      items: [],
      isMain: false,
    };

    // Taruh variabel baru di sebelum Main Formula (Main selalu terakhir/paling bawah)
    setFormulas((prev) => {
      const main = prev.find((f) => f.isMain);
      const others = prev.filter((f) => !f.isMain);
      return [...others, newFormula, main!];
    });

    setActiveFormulaId(newId);
  };

  /**
   * Menghapus Sub-Variabel (Kecuali Main)
   */
  const handleRemoveVariable = (id: string) => {
    if (id === "main") return; // Proteksi Main Formula
    setFormulas((prev) => prev.filter((f) => f.id !== id));
    setActiveFormulaId("main");
  };

  return (
    <div className="bg-background flex h-screen w-full flex-col overflow-hidden">
      <FormulaHeader
        templateName="Template PLN Standar"
        onSave={() => console.log("Payload to API:", formulas)}
      />

      <div className="flex flex-1 overflow-hidden border-t">
        <FormulaSidebar
          formulas={formulas}
          activeFormulaId={activeFormulaId}
          onAddItem={handleAddItem}
          onCreateVariable={createNewVariable}
          onRemoveVariable={handleRemoveVariable}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <FormulaCanvas
            formulas={formulas}
            activeFormula={activeFormula}
            activeFormulaId={activeFormulaId}
            setActiveFormulaId={setActiveFormulaId}
            onRemoveItem={handleRemoveItem}
            onToggleTime={handleToggleTime}
            // Update urutan item (DND ready)
            onReorderItems={updateItems}
          />
        </main>

        <div className="hidden w-64 border-l bg-white p-4 xl:block">
          <h3 className="mb-4 text-sm font-bold">Preview Formula</h3>
          <div className="rounded bg-slate-100 p-3 font-mono text-xs break-all">
            {activeFormula.items.map((i) => i.label).join(" ")}
          </div>
          <p className="text-muted-foreground mt-4 text-[10px]">
            Pastikan urutan operator sesuai dengan logika matematika dasar.
          </p>
        </div>
      </div>
    </div>
  );
}
