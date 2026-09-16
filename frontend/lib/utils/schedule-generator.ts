export interface WeekDayOption {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // จันทร์, อังคาร, etc.
  dayIndex: number; // 0 to 5 (0 = Mon, 5 = Sat)
  formattedThai: string; // e.g. "จันทร์ 21 ก.ย."
}

export interface SlotCalculationParams {
  dateStr: string;
  shiftStartTime: string; // HH:mm
  shiftEndTime: string; // HH:mm
  slotMinutes?: number;
  hasLunchBreak?: boolean;
  lunchStart?: string; // HH:mm
  lunchEnd?: string; // HH:mm
}

export interface CalculatedSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
  startFormatted: string; // HH:mm
  endFormatted: string; // HH:mm
}

const THAI_DAY_NAMES = [
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

export function parseLocalDate(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getTime());
  }
  const parts = dateInput.split("-").map(Number);
  if (parts.length >= 3) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }
  return new Date(dateInput);
}

export function formatLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calculates the Monday (YYYY-MM-DD) for any given date in that week.
 * Assumes Monday is the first day of the working week.
 */
export function getMondayOfWeek(dateInput: Date | string): string {
  const d = parseLocalDate(dateInput);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ... 6 is Saturday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatLocalDateStr(d);
}

/**
 * Returns 6 days (Mon-Sat) starting from the given Monday.
 */
export function getWeekDaysMonToSat(mondayStr: string): WeekDayOption[] {
  const monday = parseLocalDate(mondayStr);
  const result: WeekDayOption[] = [];

  for (let i = 0; i < 6; i++) {
    const cur = new Date(monday.getTime());
    cur.setDate(monday.getDate() + i);
    const dateStr = formatLocalDateStr(cur);
    const dayName = THAI_DAY_NAMES[i];
    const formattedThai = cur.toLocaleDateString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    result.push({
      dateStr,
      dayName,
      dayIndex: i,
      formattedThai,
    });
  }

  return result;
}

/**
 * Generates slot time boundaries for a day, skipping lunch break if configured.
 */
export function calculateSlotsForDay({
  dateStr,
  shiftStartTime,
  shiftEndTime,
  slotMinutes = 60,
  hasLunchBreak = true,
  lunchStart = "12:00",
  lunchEnd = "13:00",
}: SlotCalculationParams): CalculatedSlot[] {
  const shiftStartObj = new Date(`${dateStr}T${shiftStartTime}:00`);
  const shiftEndObj = new Date(`${dateStr}T${shiftEndTime}:00`);
  const lunchStartObj = hasLunchBreak ? new Date(`${dateStr}T${lunchStart}:00`) : null;
  const lunchEndObj = hasLunchBreak ? new Date(`${dateStr}T${lunchEnd}:00`) : null;

  const slots: CalculatedSlot[] = [];
  let curr = new Date(shiftStartObj.getTime());

  while (curr < shiftEndObj) {
    const next = new Date(curr.getTime() + slotMinutes * 60 * 1000);
    if (next > shiftEndObj) break;

    let isLunch = false;
    if (lunchStartObj && lunchEndObj) {
      if (curr < lunchEndObj && next > lunchStartObj) {
        isLunch = true;
      }
    }

    if (!isLunch) {
      const startFormatted = curr.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const endFormatted = next.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      slots.push({
        startTime: curr.toISOString(),
        endTime: next.toISOString(),
        startFormatted,
        endFormatted,
      });
    }

    curr = next;
  }

  return slots;
}
