import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentPropsWithoutRef<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-mantle text-text rounded-xl border border-surface0/60", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1.5 relative items-center mb-4",
        caption_label: "text-xs font-bold tracking-wider uppercase text-text",
        nav: "flex items-center gap-1 absolute right-0 top-0",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-60 hover:opacity-100 text-subtext0 hover:text-text cursor-pointer hover:bg-surface0/40"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-60 hover:opacity-100 text-subtext0 hover:text-text cursor-pointer hover:bg-surface0/40"
        ),
        weeks: "w-full space-y-1.5",
        week: "flex w-full mt-1.5 gap-1.5 justify-center",
        weekday: "text-surface2 rounded-md w-8 font-bold text-[10px] text-center uppercase tracking-wider",
        day: "h-8 w-8 p-0 flex items-center justify-center",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-semibold text-[11px] text-subtext1 hover:bg-surface0 hover:text-text rounded-lg cursor-pointer flex items-center justify-center transition-all"
        ),
        selected: "bg-mauve! text-crust! font-bold rounded-lg shadow-md",
        today: "border border-mauve/30 text-mauve rounded-lg bg-surface0/35",
        outside: "text-surface2 opacity-30",
        disabled: "text-surface2 opacity-20 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chevronClassName)} {...props} />;
          }
          return <ChevronRight className={cn("h-4 w-4", chevronClassName)} {...props} />;
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
