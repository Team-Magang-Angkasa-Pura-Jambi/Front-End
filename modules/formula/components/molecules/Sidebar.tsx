import { Button } from "@/common/components/ui/button";

// --- KOMPONEN METER ACCORDION ---

// --- KOMPONEN OPERATOR BUTTON ---

import { Plus, Variable } from "lucide-react";
import React from "react";

import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Separator } from "@/common/components/ui/separator";

import {
  AVAILABLE_METERS,
  FormulaDefinition,
} from "@/modules/formula/constants";
import { MeterAccordion } from "./MeterAccordion";
import { OperatorButton } from "./OperatorButton";
// Pastikan path import ini sesuai dengan lokasi komponen yang baru direfactor

interface SidebarProps {
  formulas: FormulaDefinition[];
  activeFormulaId: string;
  onAddItem: (item: any) => void;
  onCreateVariable: () => void;
}

export const FormulaSidebar = ({
  formulas,
  activeFormulaId,
  onAddItem,
  onCreateVariable,
}: SidebarProps) => {
  // Handler drag start yang umum
  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ action: "ADD_ITEM", payload: item })
    );
  };

  return (
    <aside className="bg-background/50 flex w-80 flex-col border-r">
      <ScrollArea className="h-full">
        <div className="space-y-8 p-5">
          {/* 1. OPERATOR SECTION */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Operator
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {["+", "-", "×", "÷", "(", ")"].map((op) => (
                <OperatorButton
                  key={op}
                  label={op}
                  onDragStart={handleDragStart}
                  onAddItem={onAddItem}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* 2. VARIABEL LOKAL SECTION */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Variabel Lokal
            </h3>
            <div className="space-y-2">
              {formulas
                .filter((f) => !f.isMain && f.id !== activeFormulaId)
                .map((f) => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, {
                        id: f.id,
                        type: "variable",
                        label: f.name,
                        value: f.id,
                      })
                    }
                    onClick={() =>
                      onAddItem({
                        type: "variable",
                        label: f.name,
                        value: f.id,
                      })
                    }
                    className="flex cursor-grab items-center gap-2 rounded-md border border-orange-200/50 bg-orange-500/10 p-2 text-sm font-medium text-orange-700 transition-colors hover:border-orange-300 hover:bg-orange-500/20 active:cursor-grabbing dark:text-orange-400"
                  >
                    <Variable className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}

              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full justify-start border border-dashed text-xs"
                onClick={onCreateVariable}
              >
                <Plus className="mr-2 h-3 w-3" /> Buat Variabel Baru
              </Button>
            </div>
          </div>

          <Separator />

          {/* 3. SUMBER DATA (METER) SECTION */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Sumber Data
            </h3>
            <div className="space-y-2">
              {AVAILABLE_METERS.map((meter) => (
                <MeterAccordion
                  key={meter.id}
                  meter={meter}
                  onDragStart={handleDragStart}
                  onAddItem={onAddItem}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};
