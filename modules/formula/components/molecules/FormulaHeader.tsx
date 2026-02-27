import { Button } from "@/common/components/ui/button";
import { Calculator, PlayCircle, Save } from "lucide-react";

export const FormulaHeader = () => {
  return (
    <header className="bg-card z-20 flex h-16 shrink-0 items-center justify-between border-b px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg shadow-lg">
          <Calculator size={20} />
        </div>
        <div>
          <h1 className="text-lg leading-tight font-bold tracking-tight">Formula Studio</h1>
          <p className="text-muted-foreground text-xs font-medium">Sentinel Energy Management</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <PlayCircle className="mr-2 h-4 w-4" /> Simulasi
        </Button>
        <Button size="sm">
          <Save className="mr-2 h-4 w-4" /> Simpan
        </Button>
      </div>
    </header>
  );
};
