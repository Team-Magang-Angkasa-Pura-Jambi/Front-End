import { Clock, History, Layers, Trash2, Zap } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/lib/utils";
import { FormulaItem } from "../../constants";

interface CanvasItemProps {
  item: FormulaItem;
  index: number;
  onRemove: (idx: number) => void;
  onToggleTime: (idx: number) => void;
}

export const CanvasItem = ({ item, index, onRemove, onToggleTime }: CanvasItemProps) => {
  // Logic untuk menentukan styling container berdasarkan tipe item
  const containerClasses = cn(
    "relative flex items-center gap-3 rounded-lg border px-3 py-2 shadow-sm transition-all cursor-pointer select-none",
    "hover:-translate-y-0.5 hover:shadow-md group",
    "bg-background", // Default background

    // 1. STYLE OPERATOR
    item.type === "operator" &&
      "bg-muted border-muted-foreground/20 justify-center min-w-[40px] font-mono text-lg font-bold text-muted-foreground",

    // 2. STYLE VARIABLE
    item.type === "variable" &&
      "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400 pr-8",

    // 3. STYLE READING (METER)
    item.type === "reading" && [
      // Base Reading Style
      item.meterName?.includes("PLN") || item.meterName?.includes("Induk")
        ? "bg-primary/5 border-primary/20 text-primary" // Main Meter (Theme Primary Color)
        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400", // Sub Meter (Green)

      // Dashed border jika ada time shift
      item.timeShift !== 0 &&
        "border-dashed border-purple-500/50 bg-purple-500/5 text-purple-700 dark:text-purple-300",
    ]
  );

  return (
    <div
      className={containerClasses}
      onClick={() => onToggleTime(index)}
      title={item.type === "reading" ? "Klik untuk ubah waktu (H-1 / H+1)" : undefined}
    >
      {/* --- ICON INDIKATOR --- */}
      {item.type === "reading" && <Zap className="h-4 w-4 shrink-0 opacity-70" />}
      {item.type === "variable" && <Layers className="h-4 w-4 shrink-0 opacity-70" />}

      {/* --- KONTEN UTAMA --- */}
      <div className="flex flex-col leading-none">
        {/* Label Meteran (Kecil di atas) */}
        {item.type === "reading" && (
          <span className="mb-1 max-w-[120px] truncate text-[9px] font-bold tracking-wider uppercase opacity-60">
            {item.meterName}
          </span>
        )}

        {/* Label Item */}
        <span
          className={cn(
            "font-semibold whitespace-nowrap",
            item.type === "operator" ? "text-lg" : "text-sm"
          )}
        >
          {item.label}
        </span>
      </div>

      {/* --- BADGE WAKTU (TIME SHIFT) --- */}
      {item.type === "reading" && item.timeShift !== 0 && (
        <Badge
          variant="secondary"
          className={cn(
            "ml-1 h-5 gap-1 px-1.5 text-[10px] font-bold",
            item.timeShift === -1
              ? "bg-purple-500/15 text-purple-700 hover:bg-purple-500/25"
              : "bg-indigo-500/15 text-indigo-700 hover:bg-indigo-500/25"
          )}
        >
          {item.timeShift === -1 ? <History className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {item.timeShift === -1 ? "H-1" : "H+1"}
        </Badge>
      )}

      {/* --- TOMBOL HAPUS (Floating) --- */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-5 w-5 scale-0 rounded-full opacity-0 shadow-sm transition-all group-hover:scale-100 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};
