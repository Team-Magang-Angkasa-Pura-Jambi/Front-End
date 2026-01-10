import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Base Animation
        "animate-pulse",

        // Shape & Color (Industrial Slate)
        "rounded-md bg-slate-200/60 dark:bg-slate-800/60",

        // Optional: Border halus agar terlihat seperti "slot kosong" pada mesin
        // "border border-slate-100 dark:border-slate-800/50",

        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
