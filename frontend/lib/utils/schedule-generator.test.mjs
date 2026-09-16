import test from "node:test";
import assert from "node:assert/strict";
import {
  getMondayOfWeek,
  getWeekDaysMonToSat,
  calculateSlotsForDay,
} from "./schedule-generator.ts";

test("getMondayOfWeek should return Monday for any day of the week", () => {
  assert.equal(getMondayOfWeek("2026-09-21"), "2026-09-21");
  assert.equal(getMondayOfWeek("2026-09-23"), "2026-09-21");
  assert.equal(getMondayOfWeek("2026-09-26"), "2026-09-21");
  assert.equal(getMondayOfWeek("2026-09-27"), "2026-09-21");
});

test("getWeekDaysMonToSat should return exactly 6 days (Mon-Sat)", () => {
  const days = getWeekDaysMonToSat("2026-09-21");
  assert.equal(days.length, 6);
  assert.equal(days[0].dateStr, "2026-09-21");
  assert.equal(days[0].dayName, "จันทร์");
  assert.equal(days[5].dateStr, "2026-09-26");
  assert.equal(days[5].dayName, "เสาร์");
});

test("calculateSlotsForDay should generate 9 1-hour slots when lunch break 12-13 is enabled", () => {
  const slots = calculateSlotsForDay({
    dateStr: "2026-09-21",
    shiftStartTime: "09:00",
    shiftEndTime: "19:00",
    slotMinutes: 60,
    hasLunchBreak: true,
    lunchStart: "12:00",
    lunchEnd: "13:00",
  });

  assert.equal(slots.length, 9);
  assert.equal(slots[0].startFormatted, "09:00");
  assert.equal(slots[0].endFormatted, "10:00");
  assert.equal(slots[2].startFormatted, "11:00");
  assert.equal(slots[2].endFormatted, "12:00");
  assert.equal(slots[3].startFormatted, "13:00");
  assert.equal(slots[3].endFormatted, "14:00");
  assert.equal(slots[8].startFormatted, "18:00");
  assert.equal(slots[8].endFormatted, "19:00");
});

test("calculateSlotsForDay without lunch break generates 10 1-hour slots", () => {
  const slots = calculateSlotsForDay({
    dateStr: "2026-09-21",
    shiftStartTime: "09:00",
    shiftEndTime: "19:00",
    slotMinutes: 60,
    hasLunchBreak: false,
    lunchStart: "12:00",
    lunchEnd: "13:00",
  });

  assert.equal(slots.length, 10);
});
