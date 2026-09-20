/**
 * Utilities for form handling, masking, validation, and auto-scroll
 */

/**
 * Remove all non-numeric characters
 */
export function stripNonDigits(val: string): string {
  return val.replace(/\D/g, "");
}

/**
 * Format 13-digit Thai National ID: X-XXXX-XXXXX-XX-X
 */
export function formatNationalId(val: string): string {
  const digits = stripNonDigits(val).slice(0, 13);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10)
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Format 9 or 10-digit Phone Number: 0XX-XXX-XXXX or 02-XXX-XXXX
 */
export function formatPhoneNumber(val: string): string {
  const digits = stripNonDigits(val).slice(0, 10);
  if (digits.length <= 3) return digits;
  
  // Landline 02
  if (digits.startsWith("02")) {
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  
  // Mobile / normal 10 digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Parse date string from direct keyboard input to standard ISO 'YYYY-MM-DD'.
 * Accepts formats:
 * - 'DD/MM/BBBB' (Thai Buddhist Era, e.g. '25/10/2535' -> '1992-10-25')
 * - 'DD/MM/YYYY' (Gregorian Era, e.g. '25/10/1992' -> '1992-10-25')
 * - 'YYYY-MM-DD' (ISO format)
 */
export function parseThaiOrIsoDate(input: string): string | null {
  if (!input || !input.trim()) return null;
  const str = input.trim();

  // Pattern: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    if (isValidDateParts(y, m, d)) return str;
    return null;
  }

  // Pattern: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const slashMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10);
    const m = parseInt(slashMatch[2], 10);
    let y = parseInt(slashMatch[3], 10);

    // If year is Buddhist Era (> 2400), convert to Christian Era
    if (y > 2400) {
      y -= 543;
    }

    if (isValidDateParts(y, m, d)) {
      const mm = String(m).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    }
  }

  return null;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Format ISO 'YYYY-MM-DD' into dual era display: 'DD/MM/BBBB (YYYY)'
 */
export function formatDualEraDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const [yearStr, monthStr, dayStr] = isoDate.split("-");
  if (!yearStr || !monthStr || !dayStr) return isoDate;
  const ceYear = parseInt(yearStr, 10);
  const beYear = ceYear + 543;
  return `${dayStr}/${monthStr}/${beYear} (${ceYear})`;
}

/**
 * Smoothly scroll to the first element in the DOM that has an error state
 */
export function scrollToFirstError(rootContainer?: HTMLElement | null): void {
  if (typeof window === "undefined") return;

  const container = rootContainer || document;
  const firstErrorElement = container.querySelector<HTMLElement>(
    '[aria-invalid="true"], [data-has-error="true"], .border-clinic-danger, .has-form-error'
  );

  if (firstErrorElement) {
    firstErrorElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Try focusing the input or inner input
    if (typeof firstErrorElement.focus === "function") {
      firstErrorElement.focus();
    } else {
      const innerInput = firstErrorElement.querySelector<HTMLElement>(
        "input, select, textarea, button"
      );
      if (innerInput && typeof innerInput.focus === "function") {
        innerInput.focus();
      }
    }
  }
}
