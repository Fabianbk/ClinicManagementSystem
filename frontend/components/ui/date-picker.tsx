"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn, THAI_MONTH_FULL, THAI_DAY_SHORT } from "@/lib/utils";
import { parseThaiOrIsoDate } from "@/lib/form-utils";

export interface DatePickerProps {
  id?: string;
  name?: string;
  value?: string; // ISO format 'YYYY-MM-DD'
  onChange?: (isoDate: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  minDate?: string; // ISO 'YYYY-MM-DD'
  maxDate?: string; // ISO 'YYYY-MM-DD'
  className?: string;
}

export function DatePicker({
  id,
  name,
  value = "",
  onChange,
  onBlur,
  placeholder = "เลือกวันที่",
  error = false,
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse current value or fallback to today for calendar view
  const parsedDate = React.useMemo(() => {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return null;
  }, [value]);

  // Calendar View month & year (Christian Era)
  const [viewYear, setViewYear] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getMonth() : new Date().getMonth();
  });

  // Text input state for direct keyboard entry
  const [inputText, setInputText] = React.useState<string>(() => {
    if (!parsedDate) return "";
    const d = String(parsedDate.getDate()).padStart(2, "0");
    const m = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const beYear = parsedDate.getFullYear() + 543;
    return `${d}/${m}/${beYear}`;
  });

  // Sync text input when external value changes
  React.useEffect(() => {
    if (!value) {
      setInputText("");
      return;
    }
    const parts = value.split("-").map(Number);
    if (parts.length === 3) {
      const d = String(parts[2]).padStart(2, "0");
      const m = String(parts[1]).padStart(2, "0");
      const beYear = parts[0] + 543;
      setInputText(`${d}/${m}/${beYear}`);
      setViewYear(parts[0]);
      setViewMonth(parts[1] - 1);
    }
  }, [value]);

  // Generate Year options: 100 years back to 10 years ahead
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear + 10;
    const endYear = currentYear - 100;
    const years: number[] = [];
    for (let y = startYear; y >= endYear; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Compute days in current view month
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon...
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      monthOffset: number; // -1: prev, 0: current, 1: next
      iso: string;
      disabled: boolean;
    }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      const iso = formatToIso(prevDate);
      days.push({
        day: d,
        monthOffset: -1,
        iso,
        disabled: isDateDisabled(iso, minDate, maxDate),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(viewYear, viewMonth, d);
      const iso = formatToIso(curDate);
      days.push({
        day: d,
        monthOffset: 0,
        iso,
        disabled: isDateDisabled(iso, minDate, maxDate),
      });
    }

    // Next month padding to always complete exactly 42 grid cells (6 full rows)
    // This guarantees the calendar height never jumps between 5 and 6 rows, keeping buttons stable!
    const targetTotalDays = 42;
    const remaining = targetTotalDays - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      const iso = formatToIso(nextDate);
      days.push({
        day: d,
        monthOffset: 1,
        iso,
        disabled: isDateDisabled(iso, minDate, maxDate),
      });
    }

    return days;
  }, [viewYear, viewMonth, minDate, maxDate]);

  function handleSelectDate(iso: string) {
    if (disabled) return;
    onChange?.(iso);
    setOpen(false);
  }

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // Handle direct typing in the input
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setInputText(raw);

    const parsedIso = parseThaiOrIsoDate(raw);
    if (parsedIso) {
      onChange?.(parsedIso);
      const [y, m] = parsedIso.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    } else if (!raw.trim()) {
      onChange?.("");
    }
  }

  function handleInputBlur() {
    // If input is text that couldn't be parsed, let onBlur notify
    onBlur?.();
  }

  const todayIso = React.useMemo(() => formatToIso(new Date()), []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-control border bg-white px-3.5 py-2 pr-16 text-sm text-clinic-ink placeholder:text-clinic-ink-muted/70 transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-primary focus-visible:border-clinic-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clinic-bg/60",
            error
              ? "border-clinic-danger focus-visible:ring-clinic-danger text-clinic-danger ring-clinic-danger"
              : "border-clinic-line hover:border-clinic-line-dark"
          )}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              setInputText("");
              onChange?.("");
            }}
            className="absolute right-9 p-1 text-clinic-ink-muted hover:text-clinic-ink cursor-pointer transition-colors"
            title="ล้างค่าวันที่"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Popover Trigger Calendar Icon */}
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "absolute right-2 p-1.5 rounded-control text-clinic-ink-soft hover:text-clinic-primary hover:bg-clinic-primary/5 transition-colors cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title="เปิดปฏิทินเลือกวันที่"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={6}
              className="z-50 w-80 rounded-card border border-clinic-line bg-white p-3.5 shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            >
              {/* Header: Month & Year Jump Selectors */}
              <div className="flex items-center justify-between gap-1 pb-3 border-b border-clinic-line">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-control text-clinic-ink-soft hover:bg-clinic-bg hover:text-clinic-ink cursor-pointer transition-colors shrink-0"
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 flex-1 justify-center min-w-0">
                  {/* Month Dropdown with fixed width so buttons never shift */}
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    className="w-[116px] px-2 py-1 bg-clinic-bg/50 border border-clinic-line rounded-control text-xs font-semibold text-clinic-ink cursor-pointer focus:outline-none focus:ring-1 focus:ring-clinic-primary shrink-0"
                  >
                    {THAI_MONTH_FULL.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* Year Dropdown with fixed width */}
                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="w-[110px] px-2 py-1 bg-clinic-bg/50 border border-clinic-line rounded-control text-xs font-bold text-clinic-primary-deep cursor-pointer focus:outline-none focus:ring-1 focus:ring-clinic-primary shrink-0"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y + 543} ({y})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-control text-clinic-ink-soft hover:bg-clinic-bg hover:text-clinic-ink cursor-pointer transition-colors shrink-0"
                  title="เดือนถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Labels */}
              <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-semibold text-clinic-ink-muted">
                {THAI_DAY_SHORT.map((d, i) => (
                  <div
                    key={d}
                    className={cn(i === 0 && "text-clinic-danger", i === 6 && "text-blue-500")}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, idx) => {
                  const isSelected = item.iso === value;
                  const isToday = item.iso === todayIso;
                  const isOtherMonth = item.monthOffset !== 0;

                  return (
                    <button
                      key={`${item.iso}-${idx}`}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => handleSelectDate(item.iso)}
                      className={cn(
                        "h-8 w-full rounded-control text-xs font-medium flex items-center justify-center transition-all cursor-pointer",
                        isOtherMonth && "text-clinic-ink-muted/40",
                        !isOtherMonth && !isSelected && "text-clinic-ink hover:bg-clinic-primary/10",
                        isToday && !isSelected && "border border-clinic-primary font-bold text-clinic-primary",
                        isSelected && "bg-clinic-primary text-white font-bold shadow-xs",
                        item.disabled && "opacity-25 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              {/* Footer: Clear Value */}
              <div className="mt-3 pt-2.5 border-t border-clinic-line flex items-center justify-end text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setInputText("");
                    onChange?.("");
                    setOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-control text-clinic-danger hover:bg-clinic-danger-bg transition-colors cursor-pointer font-medium"
                >
                  ล้างค่า
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}

function formatToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isDateDisabled(iso: string, minDate?: string, maxDate?: string): boolean {
  if (minDate && iso < minDate) return true;
  if (maxDate && iso > maxDate) return true;
  return false;
}
