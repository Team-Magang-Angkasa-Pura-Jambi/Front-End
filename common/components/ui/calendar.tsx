"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  ButtonProps,
  DayButton,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/common/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <div className="relative group/calendar">
      {/* DEKORASI BACKGROUND (Grid Pattern) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.05] pointer-events-none rounded-lg" />

      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "p-4 bg-card/95 backdrop-blur-sm border border-border shadow-xl rounded-lg relative overflow-hidden",
          "border-t-[3px] border-t-primary",
          className
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit", defaultClassNames.root),
          months: cn(
            "flex gap-4 flex-col md:flex-row relative z-10",
            defaultClassNames.months
          ),
          month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
          nav: cn(
            "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between px-1",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent border-muted-foreground/30 hover:bg-primary/20 hover:text-primary hover:border-primary p-0 opacity-70 hover:opacity-100 transition-all",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent border-muted-foreground/30 hover:bg-primary/20 hover:text-primary hover:border-primary p-0 opacity-70 hover:opacity-100 transition-all",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex items-center justify-center h-9 w-full font-bold text-foreground tracking-wide uppercase",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "w-full flex items-center text-sm font-medium justify-center h-9 gap-1.5",
            defaultClassNames.dropdowns
          ),
          weekday: cn(
            "text-muted-foreground rounded-md w-9 font-bold text-[0.65rem] uppercase tracking-widest select-none pt-1",
            defaultClassNames.weekday
          ),
          day: cn(
            "group/day w-9 h-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
            defaultClassNames.day
          ),
          today: cn(
            "bg-accent/50 text-accent-foreground rounded-md",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground/50 opacity-50",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-30",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Chevron: ({ className, orientation, ...props }) => {
            const Icon =
              orientation === "left"
                ? ChevronLeftIcon
                : orientation === "right"
                ? ChevronRightIcon
                : ChevronDownIcon;
            return <Icon className={cn("size-4", className)} {...props} />;
          },
          DayButton: CalendarDayButton,
          ...components,
        }}
        {...props}
      />
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelected = modifiers.selected;
  const isRangeStart = modifiers.range_start;
  const isRangeEnd = modifiers.range_end;
  const isRangeMiddle = modifiers.range_middle;
  const isToday = modifiers.today;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 p-0 font-normal transition-all duration-200",

        (isSelected || isRangeStart || isRangeEnd) &&
          !isRangeMiddle &&
          "bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(var(--primary),0.5)] hover:bg-primary hover:text-primary-foreground rounded-md z-10 scale-105",

        isRangeMiddle &&
          "bg-primary/10 text-primary rounded-none hover:bg-primary/20",

        isToday &&
          !isSelected &&
          "border border-primary/50 text-primary bg-primary/5 font-semibold",

        !isSelected &&
          !isRangeMiddle &&
          "hover:bg-muted hover:border hover:border-primary/30 hover:text-foreground",

        isRangeStart && "rounded-l-md rounded-r-none",
        isRangeEnd && "rounded-r-md rounded-l-none",

        defaultClassNames.day,
        className
      )}
      {...(props as ButtonProps)}
    />
  );
}

export { Calendar, CalendarDayButton };
