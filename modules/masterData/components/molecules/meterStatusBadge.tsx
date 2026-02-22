import { Badge } from "@/common/components/ui/badge";

export const MeterStatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase();

  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-slate-100 text-slate-700 border-slate-200",
    BROKEN: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const className =
    styles[s as keyof typeof styles] ||
    "bg-secondary text-secondary-foreground";

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 font-medium ${className}`}
    >
      {status}
    </Badge>
  );
};
