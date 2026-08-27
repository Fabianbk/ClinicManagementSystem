import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const THAI_DAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
export const THAI_DAY_FULL = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];
export const THAI_MONTH_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];
export const THAI_MONTH_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function formatThaiDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  const day = d.getDate();
  const month = THAI_MONTH_FULL[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

export function formatThaiDateWithWeekday(dateInput: string | Date | undefined): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  const weekday = THAI_DAY_FULL[d.getDay()];
  const day = d.getDate();
  const month = THAI_MONTH_FULL[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${weekday}ที่ ${day} ${month} ${year}`;
}

export function formatThaiShortDate(dateInput: string | Date | undefined): {
  dayName: string;
  dayNum: number;
  monthName: string;
} {
  if (!dateInput) return { dayName: "-", dayNum: 0, monthName: "-" };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { dayName: "-", dayNum: 0, monthName: "-" };
  return {
    dayName: THAI_DAY_SHORT[d.getDay()] || "",
    dayNum: d.getDate(),
    monthName: THAI_MONTH_SHORT[d.getMonth()] || "",
  };
}
