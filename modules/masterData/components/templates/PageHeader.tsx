import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  className,
  iconClassName,
}: PageHeaderProps) => {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      {/* Container Icon dengan gaya Glassmorphism Ringan */}
      <div
        className={cn(
          "bg-primary/10 text-primary border-primary/20 hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm sm:flex",
          iconClassName
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description && (
          <p className="text-muted-foreground max-w-lg text-xs leading-relaxed sm:text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
