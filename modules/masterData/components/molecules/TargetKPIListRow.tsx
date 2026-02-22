import { Button } from "@/common/components/ui/button";
import { EfficiencyTarget } from "@/common/types/efficiencyTarget";
import { ArrowRight, BarChart3, Edit3, Trash2 } from "lucide-react";

interface TargetKPIListRowProps {
  item: EfficiencyTarget;

  onEdit: (item: EfficiencyTarget) => void;
  onDelete: (item: EfficiencyTarget) => void;
}

export const TargetKPIListRow = ({ item, onEdit, onDelete }: TargetKPIListRowProps) => {
  const percentage = Number(item.target_percentage) * 100;

  const unit = item.meter?.energy_type?.unit_of_measurement || "Unit";

  const baseline = Number(item.baseline_value).toLocaleString("id-ID");

  return (
    <div className="group flex flex-col items-center justify-between gap-4 rounded-xl border p-5 transition-all hover:border-emerald-500 hover:shadow-md sm:flex-row">
      {/* Kiri: Identitas KPI */}
      <div className="flex w-full items-center gap-4 sm:w-1/3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="overflow-hidden">
          <h4 className="truncate text-sm font-bold">{item.kpi_name}</h4>
          <p className="font-mono text-[10px] tracking-wider uppercase">
            {item.meter?.meter_code || "N/A"}
          </p>
        </div>
      </div>

      {/* Tengah: Perbandingan Angka */}
      <div className="flex w-full flex-1 items-center justify-start gap-8 sm:justify-center">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold tracking-tighter uppercase">Baseline</span>
          <span className="text-sm font-semibold">
            {baseline} <small className="text-[10px] font-normal">{unit}</small>
          </span>
        </div>

        <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />

        <div className="flex flex-col">
          <span className="text-[9px] font-bold tracking-tighter text-emerald-600 uppercase">
            Target Hemat
          </span>
          <span className="text-lg leading-none font-black text-emerald-600">
            -{percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Kanan: Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-3 text-xs hover:bg-emerald-50 hover:text-emerald-600"
          onClick={() => onEdit(item)}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </Button>
        <div className="mx-1 h-4 w-[1px] bg-slate-200" />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-400 hover:bg-red-50 hover:text-red-600"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
