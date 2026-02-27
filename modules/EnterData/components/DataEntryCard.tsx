import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";

interface DataEntryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean; // Prop baru untuk handle loading state
  colorClass?: string; // Prop opsional untuk warna aksen (cth: "text-yellow-500")
}

export const DataEntryCard = ({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  colorClass = "text-primary", // Default color
}: DataEntryCardProps) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02, translateY: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("h-full", disabled && "cursor-not-allowed opacity-80")}
    >
      <Card
        onClick={!disabled ? onClick : undefined}
        className={cn(
          "relative flex h-full flex-col justify-between overflow-hidden border transition-all duration-300",
          // Styling Normal
          !disabled &&
            "hover:border-primary/50 hover:shadow-primary/5 bg-card cursor-pointer hover:shadow-xl",
          // Styling Disabled
          disabled && "bg-muted/30 border-dashed"
        )}
      >
        {/* Background Gradient Halus saat Hover */}
        {!disabled && (
          <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}

        <CardHeader className="relative z-10 flex-row items-start gap-4 space-y-0 pb-2">
          {/* Icon Container dengan Efek Glassy */}
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors",
              !disabled
                ? "bg-background/80 border-border shadow-sm backdrop-blur-sm"
                : "bg-muted border-transparent"
            )}
          >
            {disabled ? (
              <Lock className="text-muted-foreground/50 h-5 w-5" />
            ) : (
              <div
                className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  colorClass
                )}
              >
                {icon}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight font-bold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs font-medium">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter className="relative z-10 pt-4">
          <Button
            variant={disabled ? "secondary" : "default"} // Ubah varian agar tombol utama lebih menonjol
            className={cn(
              "group/btn ml-auto w-full justify-between sm:w-auto",
              !disabled &&
                "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            )}
            disabled={disabled}
          >
            <span className="text-xs font-bold tracking-wider uppercase">
              {disabled ? "Memuat Data..." : "Input Data"}
            </span>
            {!disabled && (
              <div className="bg-background/20 flex h-5 w-5 items-center justify-center rounded-full transition-transform group-hover/btn:translate-x-1">
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Komponen Loading Skeleton (Bonus)
export const DataEntryCardSkeleton = () => (
  <div className="bg-muted/20 h-[180px] rounded-xl border border-dashed p-6">
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
    <div className="mt-8 flex justify-end">
      <Skeleton className="h-9 w-32 rounded-md" />
    </div>
  </div>
);
