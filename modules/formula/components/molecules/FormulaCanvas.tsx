import { Badge } from "@/common/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FormulaDefinition } from "@/modules/formula/constants";
import { Beaker, Layers, Layers as LayersIcon } from "lucide-react";
import React, { useState } from "react";
import { CanvasItem } from "./CanvasItem";

interface CanvasProps {
  formulas: FormulaDefinition[];
  activeFormula: FormulaDefinition;
  activeFormulaId: string;
  setActiveFormulaId: (id: string) => void;
  onAddItem: (item: any) => void;
  onRemoveItem: (index: number) => void;
  onToggleTime: (index: number) => void;
}

export const FormulaCanvas = ({
  formulas,
  activeFormula,
  activeFormulaId,
  setActiveFormulaId,
  onAddItem,
  onRemoveItem,
  onToggleTime,
}: CanvasProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    const data = JSON.parse(dataStr);
    if (data.action === "ADD_ITEM") onAddItem(data.payload);
  };

  return (
    <main className="bg-muted/10 flex h-full flex-1 flex-col overflow-hidden">
      {/* Tabs Navigation */}
      <div className="bg-background shrink-0 border-b px-6 py-2">
        <Tabs value={activeFormulaId} onValueChange={setActiveFormulaId}>
          <TabsList className="no-scrollbar h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
            {formulas.map((f) => (
              <TabsTrigger
                key={f.id}
                value={f.id}
                className="data-[state=active]:bg-muted data-[state=active]:border-border rounded-md border border-transparent px-3 py-1.5 text-xs data-[state=active]:shadow-none"
              >
                {f.isMain ? (
                  <Layers className="mr-2 h-3 w-3" />
                ) : (
                  <Beaker className="mr-2 h-3 w-3" />
                )}
                {f.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Canvas Area */}
      <div
        className="relative flex-1 overflow-hidden p-8"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Grid Pattern */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <Card
          className={cn(
            "relative z-10 flex h-full flex-col transition-all duration-200",
            isDragOver ? "border-primary/50 bg-primary/5 border-dashed shadow-none" : "shadow-sm"
          )}
        >
          <CardHeader className="shrink-0 border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{activeFormula.name}</CardTitle>
                <CardDescription>
                  {activeFormula.isMain ? "Formula Utama (Output Akhir)" : "Sub-formula (Variabel)"}
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {activeFormula.items.length} ITEM
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            {activeFormula.items.length === 0 ? (
              <div className="text-muted-foreground/50 flex h-full flex-col items-center justify-center">
                <LayersIcon className="mb-4 h-16 w-16 opacity-20" />
                <p className="text-lg font-medium">Canvas Kosong</p>
                <p className="text-sm">Tarik variabel atau operator ke sini</p>
              </div>
            ) : (
              <div className="flex flex-wrap content-start items-start gap-2">
                {activeFormula.items.map((item, idx) => (
                  <CanvasItem
                    key={item.id}
                    item={item}
                    index={idx}
                    onRemove={onRemoveItem}
                    onToggleTime={onToggleTime}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
