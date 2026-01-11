"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-input shadow-sm transition-all duration-200",
        "outline-none disabled:cursor-not-allowed disabled:opacity-50",

        "text-primary",

        "hover:border-primary/50 hover:bg-accent/5",

        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",

        "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",

        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",

        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <Circle
          className="h-2.5 w-2.5 fill-current text-current drop-shadow-[0_0_2px_currentColor]"
          strokeWidth={0}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
