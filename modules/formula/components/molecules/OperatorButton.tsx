import { Button } from "@/common/components/ui/button";

export const OperatorButton = ({
  label,
  onDragStart,
  onAddItem,
}: {
  label: string;
  onDragStart: any;
  onAddItem: any;
}) => (
  <Button
    variant="outline"
    className="text-muted-foreground hover:text-foreground hover:border-primary/50 h-9 w-9 cursor-grab p-0 font-mono text-lg font-bold active:cursor-grabbing"
    draggable
    onDragStart={(e) => onDragStart(e, { type: "operator", label, value: label })}
    onClick={() => onAddItem({ type: "operator", label, value: label })}
  >
    {label}
  </Button>
);
