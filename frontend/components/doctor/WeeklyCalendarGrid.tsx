"use client";

import { useState, useMemo, useEffect } from "react";
import type {
  AppointmentResponseDTO,
  AppointmentStatus,
  WorkingScheduleResponseDTO,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  CalendarDays,
} from "lucide-react";

interface WeeklyCalendarGridProps {
  doctorId: number;
  appointments: AppointmentResponseDTO[];
  onSelectAppointment: (appointment: AppointmentResponseDTO) => void;
  onCreateAppointmentForSlot: (dateStr: string, hourStr: string, slotId?: number) => void;
  onRefresh?: () => void;
}

// 08:00 to 19:00 (12 one-hour slots)
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const THAI_DAY_NAMES = [
  "จันทร์ (Mon)",
  "อังคาร (Tue)",
  "พุธ (Wed)",
  "พฤหัสบดี (Thu)",
  "ศุกร์ (Fri)",
  "เสาร์ (Sat)",
  "อาทิตย์ (Sun)",
];

const THAI_MONTHS = [
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

// Returns the Monday (start of week) for a given date
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function matchesDate(dateInput: string | Date | undefined, targetDate: string): boolean {
  if (!dateInput || !targetDate) return false;
  if (typeof dateInput === "string") {
    if (dateInput === targetDate || dateInput.startsWith(targetDate)) {
      return true;
    }
    if (dateInput.split("T")[0] === targetDate) {
      return true;
    }
  }

  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      const ly = d.getFullYear();
      const lm = String(d.getMonth() + 1).padStart(2, "0");
      const ld = String(d.getDate()).padStart(2, "0");
      if (`${ly}-${lm}-${ld}` === targetDate) {
        return true;
      }
      const uy = d.getUTCFullYear();
      const um = String(d.getUTCMonth() + 1).padStart(2, "0");
      const ud = String(d.getUTCDate()).padStart(2, "0");
      if (`${uy}-${um}-${ud}` === targetDate) {
        return true;
      }
    }
  } catch {}

  return false;
}

function isHourInShift(hour: number, shiftStart?: string, shiftEnd?: string): boolean {
  if (!shiftStart || !shiftEnd) return false;
  try {
    const startH = parseInt(shiftStart.split(":")[0], 10);
    const endParts = shiftEnd.split(":");
    let endH = parseInt(endParts[0], 10);
    const endM = parseInt(endParts[1] || "0", 10);
    if (endM > 0) {
      endH += 1;
    }
    return hour >= startH && hour < endH;
  } catch {
    return false;
  }
}

export function WeeklyCalendarGrid({
  doctorId,
  appointments,
  onSelectAppointment,
  onCreateAppointmentForSlot,
}: WeeklyCalendarGridProps) {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [schedules, setSchedules] = useState<WorkingScheduleResponseDTO[]>([]);

  // Load doctor's working schedules to identify scheduled vs non-scheduled slots
  useEffect(() => {
    if (!doctorId) return;
    let isMounted = true;

    const fetchDoctorSchedules = async () => {
      try {
        const res = await fetch(`/api/working-schedules/doctor/${doctorId}`);
        if (res.ok) {
          const data: WorkingScheduleResponseDTO[] = await res.json();
          if (isMounted) setSchedules(data || []);
        }
      } catch (err) {
        console.error("Error loading doctor schedules for calendar:", err);
      }
    };

    fetchDoctorSchedules();

    return () => {
      isMounted = false;
    };
  }, [doctorId, appointments]);

  // 7 days of the week starting from Monday
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentMonday]);

  const todayStr = useMemo(() => formatDateISO(new Date()), []);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(next.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleToday = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  // Header range title
  const weekTitle = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];

    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = THAI_MONTHS[start.getMonth()];
    const endMonth = THAI_MONTHS[end.getMonth()];
    const thaiYear = end.getFullYear() + 543;

    if (start.getMonth() === end.getMonth()) {
      return `${startDay} - ${endDay} ${startMonth} ${thaiYear}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${thaiYear}`;
  }, [weekDays]);

  // Map appointments to date + hour for fast indexing
  const appointmentsByDateAndHour = useMemo(() => {
    const map = new Map<string, AppointmentResponseDTO[]>();

    appointments.forEach((app) => {
      if (app.doctorId && app.doctorId !== doctorId) return;
      if (!app.slotStartTime) return;

      const startDate = new Date(app.slotStartTime);
      const dateKey = formatDateISO(startDate);
      const hourKey = startDate.getHours();
      const key = `${dateKey}_${hourKey}`;

      const existing = map.get(key) || [];
      existing.push(app);
      map.set(key, existing);
    });

    return map;
  }, [appointments, doctorId]);

  // Appointment count in this week
  const weekAppointmentCount = useMemo(() => {
    const weekDateKeys = new Set(weekDays.map((d) => formatDateISO(d)));
    return appointments.filter((app) => {
      if (!app.slotStartTime) return false;
      const dKey = formatDateISO(new Date(app.slotStartTime));
      return weekDateKeys.has(dKey);
    }).length;
  }, [appointments, weekDays]);

  // Card color styles based on status
  const getCardStyle = (status: AppointmentStatus | string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        // Blue (User Story 14)
        return "bg-sky-50 hover:bg-sky-100/90 text-sky-950 border-sky-300 ring-sky-500/20";
      case "PENDING":
        // Orange (User Story 14)
        return "bg-amber-50 hover:bg-amber-100/90 text-amber-950 border-amber-300 ring-amber-500/20";
      case "COMPLETED":
        // Green (User Story 14)
        return "bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 border-emerald-300 ring-emerald-500/20";
      case "CANCELLED":
        // Red with strikethrough (User Story 14 & user preference)
        return "bg-rose-50 hover:bg-rose-100/90 text-rose-900 border-rose-300 line-through opacity-85 ring-rose-500/20";
      case "NO_SHOW":
        // Red (User Story 14)
        return "bg-rose-50 hover:bg-rose-100/90 text-rose-950 border-rose-300 ring-rose-500/20";
      default:
        return "bg-blue-50 text-blue-900 border-blue-200";
    }
  };

  const getStatusLabelThai = (status: AppointmentStatus | string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return "ยืนยันแล้ว";
      case "PENDING":
        return "รอยืนยัน";
      case "COMPLETED":
        return "ตรวจเสร็จสิ้น";
      case "CANCELLED":
        return "ยกเลิก";
      case "NO_SHOW":
        return "ไม่มาตามนัด";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-card border border-clinic-line shadow-xs overflow-hidden flex flex-col font-body">
      {/* Calendar Toolbar & Navigator */}
      <div className="p-4 border-b border-clinic-line flex flex-col md:flex-row md:items-center justify-between gap-4 bg-clinic-bg/40">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-white rounded-control border border-clinic-line shadow-2xs p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrevWeek}
              className="h-8 w-8 p-0 text-clinic-ink hover:text-clinic-primary"
              title="สัปดาห์ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-8 px-3 text-xs font-semibold text-clinic-primary hover:bg-clinic-primary/10"
            >
              วันนี้
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextWeek}
              className="h-8 w-8 p-0 text-clinic-ink hover:text-clinic-primary"
              title="สัปดาห์ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-clinic-primary" />
            <span>{weekTitle}</span>
          </h3>

          <span className="text-xs bg-clinic-primary/10 text-clinic-primary-deep font-semibold px-2.5 py-0.5 rounded-full border border-clinic-primary/20">
            {weekAppointmentCount} นัดหมายในสัปดาห์นี้
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-clinic-ink-soft flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
            <span>ยืนยันแล้ว (SCHEDULED)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>รอดำเนินการ (PENDING)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            <span>เสร็จสิ้น (COMPLETED)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            <span>ไม่มา/ยกเลิก</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 border border-slate-300 inline-block" />
            <span>อดีต / ไม่มีตารางงาน</span>
          </span>
        </div>
      </div>

      {/* Grid Container (Scrollable Horizontally on Small Screens) */}
      <div className="overflow-x-auto min-w-full">
        <div className="min-w-[840px]">
          {/* Day Headers (Mon - Sun) */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-clinic-line bg-slate-50/70 sticky top-0 z-10 text-xs">
            {/* Top-left corner (Time label) */}
            <div className="p-2.5 text-center text-clinic-ink-soft font-semibold border-r border-clinic-line text-[11px] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-clinic-ink-muted" />
            </div>

            {/* 7 Days Headers */}
            {weekDays.map((day, idx) => {
              const dateIso = formatDateISO(day);
              const isToday = dateIso === todayStr;
              const isPastDay = dateIso < todayStr;
              const daySchedules = schedules.filter((s) => matchesDate(s.date, dateIso));
              const hasSchedule = daySchedules.length > 0;

              return (
                <div
                  key={idx}
                  className={`p-2 text-center border-r border-clinic-line last:border-r-0 transition-colors ${
                    isToday
                      ? "bg-clinic-primary/5 font-bold"
                      : isPastDay
                      ? "bg-slate-100/50 text-slate-400"
                      : !hasSchedule
                      ? "bg-slate-100/40"
                      : "bg-slate-50/70"
                  }`}
                >
                  <div
                    className={`text-[11px] font-medium ${
                      isPastDay ? "text-slate-400" : "text-clinic-ink-soft"
                    }`}
                  >
                    {THAI_DAY_NAMES[idx]}
                  </div>
                  <div className="mt-0.5 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-display ${
                        isToday
                          ? "bg-clinic-primary text-white shadow-2xs"
                          : isPastDay
                          ? "text-slate-400"
                          : "text-clinic-ink"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px]">
                    {isPastDay ? (
                      <span className="text-slate-400">อดีต</span>
                    ) : hasSchedule ? (
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200/60">
                        มีตารางงาน
                      </span>
                    ) : (
                      <span className="text-slate-400">ไม่มีตารางงาน</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Rows (08:00 - 19:00) */}
          <div className="divide-y divide-clinic-line">
            {HOURS.map((hour) => {
              const hourLabel = `${String(hour).padStart(2, "0")}:00`;

              return (
                <div
                  key={hour}
                  className="grid grid-cols-[64px_repeat(7,1fr)] min-h-[76px] group/row"
                >
                  {/* Left Hour Label */}
                  <div className="p-2 border-r border-clinic-line text-right pr-2.5 text-[11px] font-mono text-clinic-ink-soft bg-slate-50/30 select-none">
                    {hourLabel}
                  </div>

                  {/* 7 Day Cells */}
                  {weekDays.map((day, dayIdx) => {
                    const dateIso = formatDateISO(day);
                    const isToday = dateIso === todayStr;
                    const isPastDate = dateIso < todayStr;
                    const isPastHour = isToday && hour < currentHour;
                    const isPast = isPastDate || isPastHour;

                    const daySchedules = schedules.filter((s) => matchesDate(s.date, dateIso));
                    const hasScheduleOnDay = daySchedules.length > 0;
                    const isHourScheduled = daySchedules.some((s) =>
                      isHourInShift(hour, s.shiftStart, s.shiftEnd)
                    );
                    const isBookable = !isPast && isHourScheduled;

                    const cellKey = `${dateIso}_${hour}`;
                    const cellAppointments = appointmentsByDateAndHour.get(cellKey) || [];

                    // Check if current real-time line belongs in this cell
                    const isCurrentHourCell = isToday && currentHour === hour;
                    const timeLineTopPercent = isCurrentHourCell
                      ? Math.min(100, Math.max(0, (currentMinute / 60) * 100))
                      : null;

                    let cellBgClass = "bg-white";
                    let cellHoverClass = "hover:bg-clinic-primary-soft/10 cursor-pointer group/cell";

                    if (isPast) {
                      cellBgClass = "bg-slate-100/70 select-none";
                      cellHoverClass = "cursor-default";
                    } else if (!hasScheduleOnDay) {
                      cellBgClass = "bg-slate-100/60 select-none";
                      cellHoverClass = "cursor-default";
                    } else if (!isHourScheduled) {
                      cellBgClass = "bg-slate-50/70 select-none";
                      cellHoverClass = "cursor-default";
                    } else if (isToday) {
                      cellBgClass = "bg-clinic-primary-soft/5";
                    }

                    return (
                      <div
                        key={dayIdx}
                        onClick={() => {
                          if (!isBookable) return;
                          onCreateAppointmentForSlot(dateIso, hourLabel);
                        }}
                        className={`border-r border-clinic-line last:border-r-0 p-1 relative transition-colors ${cellBgClass} ${cellHoverClass}`}
                      >
                        {/* Current Time Indicator Line (Google Calendar style) */}
                        {timeLineTopPercent !== null && (
                          <div
                            className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                            style={{ top: `${timeLineTopPercent}%` }}
                          >
                            <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1 shadow-xs" />
                            <div className="h-[2px] w-full bg-rose-500 shadow-2xs" />
                          </div>
                        )}

                        {/* Appointments in this cell */}
                        <div className="space-y-1 relative z-2">
                          {cellAppointments.map((app) => {
                            const startTimeStr = app.slotStartTime
                              ? new Date(app.slotStartTime).toLocaleTimeString("th-TH", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : hourLabel;
                            const endTimeStr = app.slotEndTime
                              ? new Date(app.slotEndTime).toLocaleTimeString("th-TH", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : "";

                            return (
                              <div
                                key={app.appointmentId}
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent triggering cell click
                                  onSelectAppointment(app);
                                }}
                                className={`p-1.5 rounded-control border text-[11px] leading-tight transition-all shadow-2xs hover:shadow-sm cursor-pointer ${getCardStyle(
                                  app.status
                                )}`}
                              >
                                <div className="flex items-center justify-between font-mono text-[10px] opacity-80 font-semibold mb-0.5">
                                  <span>
                                    {startTimeStr} {endTimeStr ? `- ${endTimeStr}` : ""}
                                  </span>
                                  <span className="text-[9px] px-1 py-0.2 rounded-xs bg-white/60 font-sans">
                                    {getStatusLabelThai(app.status)}
                                  </span>
                                </div>
                                <div className="font-bold truncate flex items-center gap-1">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span className="truncate">
                                    {app.patientFullname || `ผู้ป่วย #${app.patientId}`}
                                  </span>
                                </div>
                                {app.patientId && (
                                  <div className="text-[9px] font-mono opacity-70 truncate mt-0.5">
                                    HN: P-{String(app.patientId).padStart(5, "0")}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Subtle + indicator on empty cell hover (Only for bookable slots) */}
                        {isBookable && cellAppointments.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-control bg-clinic-primary/10 text-clinic-primary-deep text-[11px] font-semibold shadow-2xs border border-clinic-primary/20">
                              <Plus className="w-3 h-3" /> นัดหมาย
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
