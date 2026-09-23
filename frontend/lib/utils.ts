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

/**
 * Formats a doctor's full name with proper traditional medicine prefix (e.g. "พท.ว. พิมพ์วิมาน").
 * Avoids duplicate prefixes if the name already contains "พท.", "นพ.", or "พญ.".
 */
export function formatDoctorDisplayName(fullname?: string | null, fallbackUsername?: string | null): string {
  if (!fullname && !fallbackUsername) return "";
  const name = (fullname || fallbackUsername || "").trim();
  if (!name) return "";
  if (name.startsWith("พท.") || name.startsWith("นพ.") || name.startsWith("พญ.")) {
    return name;
  }
  return `พท.ว. ${name}`;
}

/**
 * Converts a numeric baht amount to Thai baht text (e.g. 1500 -> "หนึ่งพันห้าร้อยบาทถ้วน")
 */
export function thaiBahtText(amount: number): string {
  if (isNaN(amount) || amount === 0) return "ศูนย์บาทถ้วน";
  const numbers = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const units = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  function convertGroup(intStr: string): string {
    let s = "";
    const len = intStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(intStr[i], 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos % 6 === 1 && digit === 1) {
          s += "สิบ";
        } else if (pos % 6 === 1 && digit === 2) {
          s += "ยี่สิบ";
        } else if (pos % 6 === 0 && digit === 1 && len > 1 && i === len - 1) {
          s += "เอ็ด";
        } else {
          s += numbers[digit] + units[pos % 6];
        }
      }
    }
    return s;
  }

  const rounded = Math.round(amount * 100) / 100;
  const parts = rounded.toFixed(2).split(".");
  const intPart = parseInt(parts[0], 10);
  const satangPart = parseInt(parts[1], 10);

  let result = "";
  if (intPart === 0) {
    result = "ศูนย์บาท";
  } else {
    // Break into groups of 6 digits (for ล้าน)
    const intStr = intPart.toString();
    const len = intStr.length;
    if (len > 6) {
      const high = intStr.slice(0, len - 6);
      const low = intStr.slice(len - 6);
      result = convertGroup(high) + "ล้าน" + convertGroup(low) + "บาท";
    } else {
      result = convertGroup(intStr) + "บาท";
    }
  }

  if (satangPart === 0) {
    result += "ถ้วน";
  } else {
    result += convertGroup(satangPart.toString()) + "สตางค์";
  }
  return result;
}

export interface AddressDataLike {
  houseNo?: string | null;
  moo?: string | null;
  soi?: string | null;
  road?: string | null;
  subDistrict?: string | null;
  district?: string | null;
  province?: string | null;
  zipCode?: string | null;
  address?: string | null;
}

/**
 * จัดรูปแบบที่อยู่ภาษาไทยตามมาตรฐานราชการ:
 * - กรุงเทพมหานคร: แขวง... เขต... กรุงเทพมหานคร (ไม่มีคำว่า "จังหวัด")
 * - ต่างจังหวัด: ตำบล... อำเภอ... จังหวัด...
 * - ป้องกันคำนำหน้าซ้อน (เช่น "บ้านเลขที่ บ้านเลขที่", "แขวง แขวง", "จังหวัด จังหวัด")
 */
export function formatThaiAddress(p?: AddressDataLike | null): string {
  if (!p) return "-";

  const clean = (val?: string | null) => (val ? val.trim() : "");

  const houseNo = clean(p.houseNo);
  const moo = clean(p.moo);
  const soi = clean(p.soi);
  const road = clean(p.road);
  const subDistrict = clean(p.subDistrict);
  const district = clean(p.district);
  const province = clean(p.province);
  const zipCode = clean(p.zipCode);

  const hasStructured = Boolean(houseNo || subDistrict || district || province);
  if (!hasStructured && p.address && p.address.trim()) {
    return p.address.trim();
  }

  const isBkk =
    province.includes("กรุงเทพ") ||
    province.toLowerCase().includes("bangkok") ||
    province === "กทม" ||
    province === "กทม.";

  const parts: string[] = [];

  if (houseNo) {
    if (houseNo.startsWith("บ้านเลขที่") || houseNo.startsWith("เลขที่")) {
      parts.push(houseNo);
    } else {
      parts.push(`บ้านเลขที่ ${houseNo}`);
    }
  }

  if (moo) {
    if (moo.startsWith("หมู่")) {
      parts.push(moo);
    } else {
      parts.push(`หมู่ ${moo}`);
    }
  }

  if (soi) {
    if (soi.startsWith("ซอย")) {
      parts.push(soi);
    } else {
      parts.push(`ซอย ${soi}`);
    }
  }

  if (road) {
    if (road.startsWith("ถนน")) {
      parts.push(road);
    } else {
      parts.push(`ถนน ${road}`);
    }
  }

  if (subDistrict) {
    if (isBkk) {
      if (subDistrict.startsWith("แขวง")) {
        parts.push(subDistrict);
      } else {
        const raw = subDistrict.replace(/^ตำบล\s*/, "").replace(/^แขวง\s*/, "");
        parts.push(`แขวง${raw}`);
      }
    } else {
      if (subDistrict.startsWith("ตำบล")) {
        parts.push(subDistrict);
      } else {
        const raw = subDistrict.replace(/^แขวง\s*/, "").replace(/^ตำบล\s*/, "");
        parts.push(`ตำบล${raw}`);
      }
    }
  }

  if (district) {
    if (isBkk) {
      if (district.startsWith("เขต")) {
        parts.push(district);
      } else {
        const raw = district.replace(/^อำเภอ\s*/, "").replace(/^เขต\s*/, "");
        parts.push(`เขต${raw}`);
      }
    } else {
      if (district.startsWith("อำเภอ")) {
        parts.push(district);
      } else {
        const raw = district.replace(/^เขต\s*/, "").replace(/^อำเภอ\s*/, "");
        parts.push(`อำเภอ${raw}`);
      }
    }
  }

  if (province) {
    if (isBkk) {
      parts.push("กรุงเทพมหานคร");
    } else {
      if (province.startsWith("จังหวัด")) {
        parts.push(province);
      } else {
        parts.push(`จังหวัด${province}`);
      }
    }
  }

  if (zipCode) {
    parts.push(zipCode);
  }

  const result = parts.join(" ").trim();
  return result || p.address?.trim() || "-";
}

/**
 * แปลงสถานภาพสมรสเป็นภาษาไทยมาตรฐาน
 */
export function formatMaritalStatusThai(status?: string | null): string {
  if (!status) return "-";
  switch (status.toUpperCase()) {
    case "SINGLE":
      return "โสด";
    case "MARRIED":
      return "สมรส";
    case "WIDOWED":
      return "หม้าย";
    case "DIVORCED":
      return "หย่าร้าง";
    case "MONK":
      return "สมณะ / นักบวช";
    default:
      return status;
  }
}


