"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type {
  WorkingScheduleResponseDTO,
  AppointmentSlotResponseDTO,
  DoctorResponseDTO,
} from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, SlotStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  PhoneCall,
  CalendarDays,
} from "lucide-react";
import {
  formatThaiDateWithWeekday,
  THAI_DAY_SHORT,
  THAI_MONTH_FULL,
} from "@/lib/utils";

interface PublicDoctorScheduleProps {
  initialSchedules: WorkingScheduleResponseDTO[];
  initialDoctors: DoctorResponseDTO[];
}

function formatTimeString(isoOrTime: string): string {
  if (!isoOrTime) return "";
  if (isoOrTime.includes("T")) {
    const d = new Date(isoOrTime);
    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  const parts = isoOrTime.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return isoOrTime;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function PublicDoctorSchedule({
  initialSchedules,
  initialDoctors,
}: PublicDoctorScheduleProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "ALL">("ALL");

  // Today at midnight
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Filter schedules by selected doctor AND only future/today dates
  const futureSchedules = useMemo(() => {
    return initialSchedules
      .filter((s) => {
        const scheduleDate = new Date(s.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate.getTime() >= today.getTime();
      })
      .filter((s) => (selectedDoctorId === "ALL" ? true : s.doctorId === selectedDoctorId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [initialSchedules, selectedDoctorId, today]);

  // Map schedules by date string YYYY-MM-DD
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, WorkingScheduleResponseDTO[]>();
    futureSchedules.forEach((s) => {
      const key = toDateKey(new Date(s.date));
      const existing = map.get(key) || [];
      existing.push(s);
      map.set(key, existing);
    });
    return map;
  }, [futureSchedules]);

  // Calendar View Month state (year, month: 0-11)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (futureSchedules.length > 0) {
      return new Date(futureSchedules[0].date);
    }
    return new Date();
  });

  // Selected schedule state
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(() => {
    return futureSchedules.length > 0 ? futureSchedules[0].scheduleId : null;
  });

  // Ensure selectedScheduleId stays valid when futureSchedules change
  useEffect(() => {
    if (futureSchedules.length > 0) {
      if (!selectedScheduleId || !futureSchedules.some((s) => s.scheduleId === selectedScheduleId)) {
        setSelectedScheduleId(futureSchedules[0].scheduleId);
      }
    } else {
      setSelectedScheduleId(null);
    }
  }, [futureSchedules, selectedScheduleId]);

  // Active selected schedule object
  const activeSchedule = useMemo(() => {
    return futureSchedules.find((s) => s.scheduleId === selectedScheduleId) || null;
  }, [futureSchedules, selectedScheduleId]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      hasSchedule: boolean;
      schedules: WorkingScheduleResponseDTO[];
    }> = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      d.setHours(0, 0, 0, 0);
      const key = toDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        isPast: d.getTime() < today.getTime(),
        hasSchedule: schedulesByDate.has(key),
        schedules: schedulesByDate.get(key) || [],
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      d.setHours(0, 0, 0, 0);
      const key = toDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNumber: i,
        isCurrentMonth: true,
        isPast: d.getTime() < today.getTime(),
        hasSchedule: schedulesByDate.has(key),
        schedules: schedulesByDate.get(key) || [],
      });
    }

    // Next month padding days to complete grid (42 cells = 6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      d.setHours(0, 0, 0, 0);
      const key = toDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNumber: i,
        isCurrentMonth: false,
        isPast: d.getTime() < today.getTime(),
        hasSchedule: schedulesByDate.has(key),
        schedules: schedulesByDate.get(key) || [],
      });
    }

    return days;
  }, [viewDate, schedulesByDate, today]);

  // Appointment Slots state for active schedule
  const [slots, setSlots] = useState<AppointmentSlotResponseDTO[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedScheduleId) {
      setSlots([]);
      return;
    }

    let isMounted = true;
    setIsLoadingSlots(true);

    fetch(`/api/appointment-slots/schedule/${selectedScheduleId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const rawSlots: AppointmentSlotResponseDTO[] = data?.data || data || [];
        rawSlots.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        setSlots(rawSlots);
      })
      .catch(() => {
        if (isMounted) setSlots([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedScheduleId]);

  const availableSlotsCount = useMemo(() => {
    return slots.filter((s) => s.status === "AVAILABLE").length;
  }, [slots]);

  return (
    <div className="space-y-6 font-body">
      {/* Doctor Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-control border border-clinic-line shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-clinic-ink-soft">
          <Filter className="w-4 h-4 text-clinic-primary" />
          <span>แพทย์ผู้ปฏิบัติงาน:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDoctorId("ALL")}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              selectedDoctorId === "ALL"
                ? "bg-clinic-primary text-white shadow-xs"
                : "bg-clinic-bg text-clinic-ink hover:bg-clinic-primary-soft"
            }`}
          >
            แพทย์ทุกท่าน ({initialDoctors.length})
          </button>
          {initialDoctors.map((doc) => (
            <button
              key={doc.doctorId}
              type="button"
              onClick={() => setSelectedDoctorId(doc.doctorId)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
                selectedDoctorId === doc.doctorId
                  ? "bg-clinic-primary text-white shadow-xs"
                  : "bg-clinic-bg text-clinic-ink hover:bg-clinic-primary-soft"
              }`}
            >
              {doc.fullname}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Monthly Calendar */}
        <div className="lg:col-span-6 space-y-3">
          <Card className="border-clinic-line shadow-xs overflow-hidden">
            {/* Calendar Month Header */}
            <CardHeader className="bg-clinic-primary-deep text-white p-4 flex flex-row items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                aria-label="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="font-display font-bold text-base block">
                  {THAI_MONTH_FULL[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
                </span>
                <span className="text-[11px] text-white/80">
                  ปฏิทินเวลาทำงานของแพทย์
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                aria-label="เดือนถัดไป"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-clinic-ink-soft py-1 border-b border-clinic-line">
                {THAI_DAY_SHORT.map((day, idx) => (
                  <span
                    key={day}
                    className={idx === 0 ? "text-clinic-terracotta" : idx === 6 ? "text-clinic-primary" : ""}
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((item, index) => {
                  const isSelected =
                    activeSchedule &&
                    toDateKey(new Date(activeSchedule.date)) === item.dateKey;
                  const isSelectable = item.hasSchedule && !item.isPast;

                  return (
                    <button
                      key={`${item.dateKey}-${index}`}
                      type="button"
                      disabled={!isSelectable}
                      onClick={() => {
                        if (item.schedules.length > 0) {
                          setSelectedScheduleId(item.schedules[0].scheduleId);
                        }
                      }}
                      className={`h-11 sm:h-12 rounded-control flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                        isSelected
                          ? "bg-clinic-primary text-white font-bold shadow-md scale-105 ring-2 ring-clinic-primary/30 z-10"
                          : isSelectable
                          ? "bg-clinic-primary-soft/70 text-clinic-primary-deep hover:bg-clinic-primary hover:text-white border border-clinic-primary/30 cursor-pointer shadow-2xs"
                          : item.isCurrentMonth && !item.isPast
                          ? "text-clinic-ink-soft/70 hover:bg-clinic-bg cursor-default"
                          : "text-clinic-ink-muted/30 cursor-default"
                      }`}
                    >
                      <span>{item.dayNumber}</span>
                      {isSelectable && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                            isSelected ? "bg-amber-300" : "bg-clinic-primary"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="pt-3 border-t border-clinic-line flex items-center justify-between text-[11px] text-clinic-ink-soft px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-clinic-primary" />
                  <span>มีแพทย์ปฏิบัติงาน (คลิกดูรอบตรวจ)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  <span>ไม่มีตารางเวร / วันในอดีต</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Schedule Shift & Slots Details */}
        <div className="lg:col-span-6">
          <Card className="border-clinic-line h-full flex flex-col justify-between shadow-xs">
            <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-clinic-primary-deep flex items-center gap-2">
                    <Clock className="w-4 h-4 text-clinic-primary" />
                    <span>รายละเอียดเวลาทำงาน & รอบตรวจ</span>
                  </CardTitle>
                  {activeSchedule ? (
                    <p className="text-xs text-clinic-ink-soft mt-0.5">
                      {formatThaiDateWithWeekday(activeSchedule.date)}
                    </p>
                  ) : (
                    <p className="text-xs text-clinic-ink-soft mt-0.5">
                      กรุณาเลือกวันที่แพทย์ปฏิบัติงานจากปฏิทิน
                    </p>
                  )}
                </div>

                {activeSchedule && (
                  <Badge variant="terracotta" className="text-xs shrink-0 self-start sm:self-auto">
                    ว่าง {availableSlotsCount} / {slots.length} รอบ
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              {!activeSchedule ? (
                <div className="py-16 text-center text-clinic-ink-soft text-xs space-y-2">
                  <CalendarDays className="w-8 h-8 text-clinic-ink-muted mx-auto" />
                  <p className="font-semibold text-clinic-ink">
                    ยังไม่ได้เลือกวันทำงานของแพทย์
                  </p>
                  <p className="text-[11px] text-clinic-ink-soft">
                    คลิกเลือกวันที่ที่มีจุดสีเขียวบนปฏิทินเพื่อดูเวลาทำงานและรอบตรวจ
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Doctor & Working Hours Banner */}
                  <div className="p-3.5 rounded-control bg-clinic-primary-soft/50 border border-clinic-primary/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-clinic-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-xs sm:text-sm font-bold text-clinic-primary-deep">
                          {activeSchedule.doctorFullname}
                        </strong>
                        <span className="text-[11px] text-clinic-ink-soft flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-clinic-primary" />
                          <span>
                            เวลาปฏิบัติงาน: {formatTimeString(activeSchedule.shiftStart)} -{" "}
                            {formatTimeString(activeSchedule.shiftEnd)} น.
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Slots Grid */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-clinic-ink-soft block">
                      รอบเวลาการตรวจ (Appointment Slots):
                    </span>

                    {isLoadingSlots ? (
                      <div className="py-8 text-center text-clinic-ink-soft text-xs">
                        กำลังโหลดรอบเวลาตรวจ...
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="py-8 text-center text-clinic-ink-soft text-xs space-y-1">
                        <p>ยังไม่มีการเปิดรอบเวลาตรวจสำหรับวันนี้</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {slots.map((slot) => {
                          const startTimeStr = formatTimeString(slot.startTime);
                          const endTimeStr = formatTimeString(slot.endTime);
                          const isAvailable = slot.status === "AVAILABLE";

                          return (
                            <div
                              key={slot.slotId}
                              className={`p-2.5 rounded-control border text-xs flex items-center justify-between gap-2 transition-all ${
                                isAvailable
                                  ? "bg-white border-clinic-line hover:border-clinic-primary/50 shadow-2xs"
                                  : "bg-clinic-bg/60 border-clinic-line/70 opacity-70"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <span className="font-mono font-bold text-clinic-ink text-xs block">
                                  {startTimeStr} - {endTimeStr} น.
                                </span>
                                <SlotStatusBadge status={slot.status} />
                              </div>

                              {isAvailable ? (
                                <Button
                                  asChild
                                  variant="terracotta"
                                  size="sm"
                                  className="h-6 px-2 text-[11px] font-semibold gap-1 shrink-0"
                                >
                                  <Link href={`/patient/login?next=/patient/book`}>
                                    <span>จองรอบนี้</span>
                                  </Link>
                                </Button>
                              ) : (
                                <span className="text-[10px] font-medium text-clinic-ink-muted">
                                  {slot.status === "BOOKED" ? "มีผู้จองแล้ว" : "งดตรวจ"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Notice with Telephone */}
              <div className="pt-3 border-t border-clinic-line text-[11px] text-clinic-ink-soft flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  * ผู้รับบริการครั้งแรก กรุณาโทรปรึกษาแพทย์ที่:{" "}
                  <a href="tel:0819358026" className="font-bold text-clinic-terracotta underline font-mono">
                    081-935-8026
                  </a>
                </span>
                <Link
                  href="/patient/login?next=/patient/book"
                  className="font-semibold text-clinic-terracotta hover:underline shrink-0"
                >
                  เข้าสู่ระบบจองคิว (คนไข้เดิม) →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
