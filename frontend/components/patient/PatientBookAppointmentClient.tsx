"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  WorkingScheduleResponseDTO,
  AppointmentSlotResponseDTO,
  DoctorResponseDTO,
} from "@/lib/types";

interface PatientBookAppointmentClientProps {
  patientId: number;
  initialSchedules: WorkingScheduleResponseDTO[];
  initialDoctors: DoctorResponseDTO[];
}

const THAI_MONTHS_FULL = [
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

const THAI_DAYS_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const THAI_DAYS_FULL = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

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
  // Might be "09:00:00" or "09:00"
  const parts = isoOrTime.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return isoOrTime;
}

function toLocalDateString(dateInput: string | Date): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PatientBookAppointmentClient({
  patientId,
  initialSchedules,
  initialDoctors,
}: PatientBookAppointmentClientProps) {
  const router = useRouter();

  // State
  const [schedules] = useState<WorkingScheduleResponseDTO[]>(initialSchedules);
  const [doctors] = useState<DoctorResponseDTO[]>(initialDoctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "ALL">("ALL");

  // Determine initial date from available schedules or current date
  const initialDate = useMemo(() => {
    if (initialSchedules.length > 0) {
      return new Date(initialSchedules[0].date);
    }
    return new Date();
  }, [initialSchedules]);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (initialSchedules.length > 0) {
      return toLocalDateString(initialSchedules[0].date);
    }
    return toLocalDateString(new Date());
  });

  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(() => {
    if (initialSchedules.length > 0) {
      return initialSchedules[0].scheduleId;
    }
    return null;
  });

  const [slots, setSlots] = useState<AppointmentSlotResponseDTO[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter schedules by selected doctor
  const filteredSchedules = useMemo(() => {
    if (selectedDoctorId === "ALL") {
      return schedules;
    }
    return schedules.filter((s) => s.doctorId === selectedDoctorId);
  }, [schedules, selectedDoctorId]);

  // Map of date string -> schedules on that day
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, WorkingScheduleResponseDTO[]>();
    for (const schedule of filteredSchedules) {
      const dateKey = toLocalDateString(schedule.date);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(schedule);
    }
    return map;
  }, [filteredSchedules]);

  // When doctor changes, if selected date has no schedule for that doctor, auto-pick nearest
  useEffect(() => {
    const currentSchedulesOnDate = schedulesByDate.get(selectedDateStr) || [];
    if (currentSchedulesOnDate.length > 0) {
      // Pick first schedule on this date
      setSelectedScheduleId(currentSchedulesOnDate[0].scheduleId);
    } else if (filteredSchedules.length > 0) {
      // Pick first available schedule in the future
      const firstAvailable = filteredSchedules[0];
      const newDateStr = toLocalDateString(firstAvailable.date);
      setSelectedDateStr(newDateStr);
      setSelectedScheduleId(firstAvailable.scheduleId);
      setCurrentMonthDate(new Date(new Date(firstAvailable.date).getFullYear(), new Date(firstAvailable.date).getMonth(), 1));
    } else {
      setSelectedScheduleId(null);
      setSlots([]);
      setSelectedSlotId(null);
    }
  }, [selectedDoctorId, filteredSchedules, schedulesByDate, selectedDateStr]);

  // When selectedScheduleId changes, fetch all slots for this schedule
  useEffect(() => {
    if (!selectedScheduleId) {
      setSlots([]);
      setSelectedSlotId(null);
      return;
    }

    let isMounted = true;
    setIsLoadingSlots(true);
    setSelectedSlotId(null);
    setErrorMessage(null);

    fetch(`/api/appointment-slots/schedule/${selectedScheduleId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const rawSlots: AppointmentSlotResponseDTO[] = data?.data || data || [];
        // Sort chronologically
        rawSlots.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        setSlots(rawSlots);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("ไม่สามารถโหลดช่วงเวลาการตรวจได้");
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedScheduleId]);

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const yearBE = year + 543;
  const monthName = THAI_MONTHS_FULL[month];

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = toLocalDateString(new Date());

  // Handle Day Click
  const handleSelectDay = (dayNumber: number) => {
    const clickedDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      dayNumber
    ).padStart(2, "0")}`;
    setSelectedDateStr(clickedDateStr);

    const daySchedules = schedulesByDate.get(clickedDateStr) || [];
    if (daySchedules.length > 0) {
      setSelectedScheduleId(daySchedules[0].scheduleId);
    } else {
      setSelectedScheduleId(null);
      setSlots([]);
      setSelectedSlotId(null);
    }
  };

  // Active selected schedule details
  const selectedSchedule = useMemo(() => {
    return schedules.find((s) => s.scheduleId === selectedScheduleId) || null;
  }, [schedules, selectedScheduleId]);

  // Multiple schedules on selected date (if any)
  const schedulesOnSelectedDate = useMemo(() => {
    return schedulesByDate.get(selectedDateStr) || [];
  }, [schedulesByDate, selectedDateStr]);

  // Format full Thai date for the right top banner
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateStr) return "";
    const [y, m, d] = selectedDateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const dayName = THAI_DAYS_FULL[dayOfWeek];
    const mName = THAI_MONTHS_FULL[m - 1];
    const yBE = y + 543;
    return `วัน${dayName}ที่ ${d} ${mName} ${yBE}`;
  }, [selectedDateStr]);

  // Booking submit handler
  async function handleBook() {
    if (!selectedSlotId) {
      setErrorMessage("กรุณาเลือกช่วงเวลาที่ต้องการนัดหมาย");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          slotId: selectedSlotId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrorMessage(
          body?.message || "ไม่สามารถจองคิวนัดหมายได้ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      setSuccessMessage("จองคิวนัดหมายสำเร็จ! กำลังนำท่านไปยังหน้ารายการนัดหมาย…");
      startTransition(() => {
        setTimeout(() => {
          router.push("/patient/appointments");
          router.refresh();
        }, 1200);
      });
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            จองคิวตรวจรักษา
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เลือกแพทย์ วันที่ และเวลาที่คุณสะดวกเพื่อทำการนัดหมาย
          </p>
        </div>

        <Link
          href="/patient/appointments"
          className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          ← กลับไปยังนัดหมายของฉัน
        </Link>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-medium animate-in fade-in flex items-center gap-2">
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Doctor Dropdown & Calendar Card (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Doctor Dropdown Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              👨‍⚕️ เลือกแพทย์ผู้ตรวจ
            </label>
            <div className="relative">
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDoctorId(val === "ALL" ? "ALL" : Number(val));
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="ALL">✨ แพทย์ทุกคน (ทั้งหมด)</option>
                {doctors.map((doc) => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.fullname} {doc.physicianLicenseNo ? `(ว.${doc.physicianLicenseNo})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Calendar Card Title */}
            <div className="flex items-center gap-2 text-slate-900">
              <span className="text-emerald-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <h2 className="text-base font-bold text-slate-900 font-display">
                เลือกวันที่
              </h2>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="font-bold text-sm text-slate-900">
                {monthName} {yearBE}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="เดือนถัดไป"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Calendar Table Grid */}
            <div className="space-y-2">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 text-center">
                {THAI_DAYS_SHORT.map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`text-xs font-semibold py-1 ${
                      idx === 0
                        ? "text-red-500"
                        : idx === 6
                        ? "text-purple-600"
                        : "text-slate-500"
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center">
                {/* Empty cells before day 1 */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 w-9 mx-auto" />
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const dateKey = `${year}-${String(month + 1).padStart(
                    2,
                    "0"
                  )}-${String(dayNumber).padStart(2, "0")}`;

                  const isSelected = dateKey === selectedDateStr;
                  const isToday = dateKey === todayStr;
                  const daySchedules = schedulesByDate.get(dateKey) || [];
                  const hasSchedule = daySchedules.length > 0;

                  return (
                    <div key={dateKey} className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleSelectDay(dayNumber)}
                        disabled={!hasSchedule}
                        className={`h-9 w-9 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all relative ${
                          isSelected
                            ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400/40"
                            : hasSchedule
                            ? "text-slate-800 font-semibold hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer bg-slate-50 border border-emerald-200/60"
                            : "text-slate-300 cursor-not-allowed"
                        }`}
                      >
                        <span>{dayNumber}</span>
                        {/* Dot indicator for schedule/today */}
                        {hasSchedule && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                        )}
                        {isToday && !isSelected && !hasSchedule && (
                          <span className="w-1 h-1 rounded-full bg-slate-400 mt-0.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-start gap-5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>วันนี้ / เลือก</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-50" />
                <span>ว่าง</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>เต็ม</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shift Banner & Slots Timetable (col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Shift Banner (Mint/Green Card) */}
          <div className="bg-[#EBFBF3] border border-[#B7EBCE] rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-slate-900 font-display">
                {formattedSelectedDate || "กรุณาเลือกวันที่ตรวจ"}
              </h2>
              {selectedSchedule ? (
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>
                    แพทย์ผู้ตรวจ:{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedSchedule.doctorFullname}
                    </span>
                  </p>
                  <p className="text-slate-500">
                    เวลาทำการตรวจ: {formatTimeString(selectedSchedule.shiftStart)} –{" "}
                    {formatTimeString(selectedSchedule.shiftEnd)} น.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  ไม่มีตารางเวรตรวจในวันที่เลือก กรุณาเลือกวันที่ที่มีจุดสีเขียวบนปฏิทิน
                </p>
              )}
            </div>
          </div>

          {/* Multiple schedules switcher on the same day (if multiple doctors work on selected date) */}
          {schedulesOnSelectedDate.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 shrink-0">
                เลือกแพทย์ในวันนี้:
              </span>
              {schedulesOnSelectedDate.map((sch) => (
                <button
                  key={sch.scheduleId}
                  type="button"
                  onClick={() => setSelectedScheduleId(sch.scheduleId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    sch.scheduleId === selectedScheduleId
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {sch.doctorFullname} ({formatTimeString(sch.shiftStart)} -{" "}
                  {formatTimeString(sch.shiftEnd)})
                </button>
              ))}
            </div>
          )}

          {/* Section: Select Desired Time */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="text-emerald-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  เลือกเวลาที่ต้องการ
                </h2>
              </div>

              {selectedSchedule && (
                <span className="text-xs text-slate-500">
                  ว่างสำหรับจอง:{" "}
                  <strong className="text-emerald-600">
                    {slots.filter((s) => s.status === "AVAILABLE").length}
                  </strong>{" "}
                  / {slots.length} คิว
                </span>
              )}
            </div>

            {/* Slots Grid */}
            {isLoadingSlots ? (
              <div className="py-16 text-center text-slate-400 text-sm animate-pulse space-y-2">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>กำลังโหลดช่วงเวลานัดหมาย…</p>
              </div>
            ) : slots.length > 0 ? (
              <div className="space-y-4">
                {/* Continuous Slots Grid (next to each other) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot) => {
                    const isAvailable = slot.status === "AVAILABLE";
                    const isSelected = slot.slotId === selectedSlotId;
                    const startTime = formatTimeString(slot.startTime);
                    const endTime = formatTimeString(slot.endTime);

                    if (isAvailable) {
                      return (
                        <button
                          key={slot.slotId}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.slotId)}
                          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]"
                              : "bg-white border-slate-200 border-l-4 border-l-emerald-500 text-slate-800 hover:border-emerald-400 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-base font-bold tracking-tight ${
                                isSelected ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {startTime}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              ว่าง
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              isSelected ? "text-emerald-100" : "text-slate-500"
                            }`}
                          >
                            ถึง {endTime} น.
                          </p>
                        </button>
                      );
                    }

                    // Booked or Blocked Slot
                    return (
                      <div
                        key={slot.slotId}
                        className="text-left p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/80 text-slate-400 opacity-60 cursor-not-allowed flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold line-through text-slate-400">
                            {startTime}
                          </span>
                          <span className="text-[11px] font-medium bg-slate-200/70 text-slate-500 px-2 py-0.5 rounded-md">
                            เต็ม
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-slate-400">
                          ถึง {endTime} น.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : selectedScheduleId ? (
              <div className="py-12 text-center text-slate-500 space-y-1 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="font-semibold text-slate-700">
                  ยังไม่มีการเปิดช่วงเวลาตรวจสำหรับตารางเวรนี้
                </p>
                <p className="text-xs text-slate-400">
                  กรุณาเลือกวันตรวจอื่นจากปฏิทินทางด้านซ้าย
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-1 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="font-semibold text-slate-700">
                  ยังไม่ได้เลือกวันตรวจรักษา
                </p>
                <p className="text-xs text-slate-400">
                  กรุณาคลิกเลือกวันที่ที่มีตารางตรวจ (จุดสีเขียว) บนปฏิทินทางด้านซ้าย
                </p>
              </div>
            )}

            {/* Action Bottom Bar */}
            <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/patient/appointments"
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </Link>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {selectedSlotId && (
                  <div className="hidden sm:block text-right text-xs text-slate-500">
                    <p className="font-bold text-slate-800">
                      ช่วงเวลาที่เลือก:{" "}
                      {(() => {
                        const slot = slots.find((s) => s.slotId === selectedSlotId);
                        if (!slot) return "";
                        return `${formatTimeString(slot.startTime)} - ${formatTimeString(
                          slot.endTime
                        )} น.`;
                      })()}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBook}
                  disabled={!selectedSlotId || isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{isPending ? "กำลังบันทึกการจอง…" : "ยืนยันการจองคิว"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
