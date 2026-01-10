import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot"; // [!code ++] Tambahkan Slottable
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-800",
        link: "text-primary underline-offset-4 hover:underline",

        // --- VARIAN BARU ---
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 shadow-sm dark:bg-slate-900/40 dark:border-slate-700 dark:hover:bg-slate-800/60",
        tech: "border border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:border-blue-500/50 dark:text-blue-400 dark:border-blue-400/30",
        shine:
          "bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] text-white hover:bg-right transition-[background-position] duration-500 shadow-md",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-md px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      disabled={isLoading || disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* 1. Spinner (Sibling 1) */}
      {isLoading && <Loader2 className="animate-spin" />}

      {/* 2. Left Icon (Sibling 2) */}
      {!isLoading && leftIcon && <span className="mr-0.5">{leftIcon}</span>}

      {/* 3. Children dibungkus Slottable agar Slot tau ini target utamanya */}
      <Slottable>{children}</Slottable>

      {/* 4. Right Icon (Sibling 3) */}
      {!isLoading && rightIcon && <span className="ml-0.5">{rightIcon}</span>}
    </Comp>
  );
}

export { Button, buttonVariants };
