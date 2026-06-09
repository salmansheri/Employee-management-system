import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string; // YYYY-MM-DD
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className = "",
  minDate,
}: DatePickerProps) {
  // Convert string representation back to Date locally
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Format back to local YYYY-MM-DD
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      onChange(`${yyyy}-${mm}-${dd}`);
    } else {
      onChange("");
    }
  };

  const disabledDays = (date: Date) => {
    if (!minDate) return false;
    const min = new Date(minDate + "T00:00:00");
    // Strip time for clean comparison
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compareMin = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    return compareDate < compareMin;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-between text-left font-normal border border-surface0/60 bg-mantle text-xs text-text hover:bg-surface0 hover:text-text h-9",
            !value && "text-surface2 hover:text-surface2",
            className
          )}
        >
          <span>{selectedDate ? format(selectedDate, "PPP") : placeholder}</span>
          <CalendarIcon className="h-4 w-4 text-surface2 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-mantle border border-surface0 rounded-xl shadow-2xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={disabledDays}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
