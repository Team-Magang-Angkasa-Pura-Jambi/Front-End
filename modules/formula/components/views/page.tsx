"use client";

import { FormulaDefinition, FormulaItem, INITIAL_FORMULAS } from "@/modules/formula/constants";
import { useState } from "react";
import { FormulaCanvas } from "../molecules/FormulaCanvas";
import { FormulaHeader } from "../molecules/FormulaHeader";
import { FormulaSidebar } from "../molecules/Sidebar";

export default function FormulaBuilderPage() {
  // --- STATE ---
  const [formulas, setFormulas] = useState<FormulaDefinition[]>(INITIAL_FORMULAS);
  const [activeFormulaId, setActiveFormulaId] = useState<string>("main");

  const activeFormula = formulas.find((f) => f.id === activeFormulaId) || formulas[0];

  // --- LOGIC HANDLERS ---
  const updateItems = (newItems: FormulaItem[]) => {
    setFormulas((prev) =>
      prev.map((f) => (f.id === activeFormulaId ? { ...f, items: newItems } : f))
    );
  };

  const handleAddItem = (item: any) => {
    const newItem = { ...item, id: `item_${Date.now()}_${Math.random()}`, timeShift: 0 };
    updateItems([...activeFormula.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const list = [...activeFormula.items];
    list.splice(index, 1);
    updateItems(list);
  };

  const handleToggleTime = (index: number) => {
    const item = activeFormula.items[index];
    if (item.type !== "reading") return;

    let next = (item.timeShift || 0) - 1;
    if (next < -1) next = 1;
    if (item.timeShift === 1) next = 0;

    const list = [...activeFormula.items];
    list[index] = { ...item, timeShift: next };
    updateItems(list);
  };

  const createNewVariable = () => {
    const newId = `var_${Date.now()}`;
    const newFormula: FormulaDefinition = {
      id: newId,
      name: "Variabel Baru",
      items: [],
      isMain: false,
    };
    const main = formulas.find((f) => f.isMain)!;
    const others = formulas.filter((f) => !f.isMain);
    setFormulas([...others, newFormula, main]);
    setActiveFormulaId(newId);
  };

  return (
    // Menggunakan h-[calc(100vh-var(--header-height))] jika ada navbar global
    // Atau h-full jika ini halaman mandiri
    <div className="bg-background flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <FormulaHeader />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <FormulaSidebar
          formulas={formulas}
          activeFormulaId={activeFormulaId}
          onAddItem={handleAddItem}
          onCreateVariable={createNewVariable}
        />

        {/* Canvas */}
        <FormulaCanvas
          formulas={formulas}
          activeFormula={activeFormula}
          activeFormulaId={activeFormulaId}
          setActiveFormulaId={setActiveFormulaId}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onToggleTime={handleToggleTime}
        />
      </div>
    </div>
  );
}
