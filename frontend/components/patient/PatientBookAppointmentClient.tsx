"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  WorkingScheduleResponseDTO,
  AppointmentSlotResponseDTO,
  DoctorResponseDTO,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CalendarPlus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
} from "lucide-react";

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

  const [schedules] = useState<WorkingScheduleResponseDTO[]>(initialSchedules);
  const [doctors] = useState<DoctorResponseDTO[]>(initialDoctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "ALL">("ALL");

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

  const filteredSchedules = useMemo(() => {
    if (selectedDoctorId === "ALL") return schedules;
    return schedules.filter((s) => s.doctorId === selectedDoctorId);
  }, [schedules, selectedDoctorId]);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, WorkingScheduleResponseDTO[]>();
    for (const s of filteredSchedules) {
      const dStr = toLocalDateString(s.date);
      if (!map.has(dStr)) {
        map.set(dStr, []);
      }
      map.get(dStr)!.push(s);
    }
    return map;
  }, [filteredSchedules]);

  useEffect(() => {
    const daySchedules = schedulesByDate.get(selectedDateStr) || [];
    if (daySchedules.length > 0) {
      if (!selectedScheduleId || !daySchedules.some((s) => s.scheduleId === selectedScheduleId)) {
        setSelectedScheduleId(daySchedules[0].scheduleId);
      }
    } else {
      setSelectedScheduleId(null);
      setSlots([]);
      setSelectedSlotId(null);
    }
  }, [selectedDoctorId, filteredSchedules, schedulesByDate, selectedDateStr, selectedScheduleId]);

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

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const yearBE = year + 543;
  const monthName = THAI_MONTHS_FULL[month];

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toLocalDateString(new Date());

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

  const selectedSchedule = useMemo(() => {
    return schedules.find((s) => s.scheduleId === selectedScheduleId) || null;
  }, [schedules, selectedScheduleId]);

  const schedulesOnSelectedDate = useMemo(() => {
    return schedulesByDate.get(selectedDateStr) || [];
  }, [schedulesByDate, selectedDateStr]);

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
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      <PageHeader
        icon={<CalendarPlus className="w-5 h-5 text-clinic-primary" />}
        title="จองคิวตรวจรักษาออนไลน์ (Book Appointment)"
        subtitle="เลือกแพทย์แผนไทย วันที่สะดวก และเลือกช่วงเวลาตรวจที่ต้องการ"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/patient/appointments">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>กลับไปยังนัดหมายของฉัน</span>
            </Link>
          </Button>
        }
      />

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-control bg-clinic-success-bg border border-clinic-success text-clinic-success text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Doctor Selection & Calendar (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Doctor Dropdown Card */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Label className="text-xs font-bold text-clinic-primary-deep flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-clinic-primary" />
                <span>แพทย์แผนไทยผู้ตรวจรักษา</span>
              </Label>
              <Select
                value={selectedDoctorId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDoctorId(val === "ALL" ? "ALL" : Number(val));
                }}
                className="text-xs"
              >
                <option value="ALL">✨ แพทย์แผนไทยทุกคน (ทั้งหมด)</option>
                {doctors.map((doc) => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    พท. {doc.fullname} {doc.physicianLicenseNo ? `(ว.${doc.physicianLicenseNo})` : ""}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Calendar Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-clinic-primary" />
                <span>เลือกวันที่</span>
              </CardTitle>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="h-7 w-7"
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-bold text-xs font-display text-clinic-primary-deep px-1">
                  {monthName} {yearBE}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-7 w-7"
                  title="เดือนถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Calendar Grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 text-center">
                  {THAI_DAYS_SHORT.map((dayName, idx) => (
                    <div
                      key={dayName}
                      className={`text-[11px] font-semibold py-1 ${
                        idx === 0
                          ? "text-rose-600"
                          : idx === 6
                          ? "text-purple-600"
                          : "text-clinic-ink-soft"
                      }`}
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Empty slots for start of month */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-9" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                      dayNum
                    ).padStart(2, "0")}`;

                    const hasSchedule = schedulesByDate.has(dateStr);
                    const isSelected = dateStr === selectedDateStr;
                    const isToday = dateStr === todayStr;
                    const isPast = dateStr < todayStr;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        type="button"
                        onClick={() => handleSelectDay(dayNum)}
                        disabled={isPast}
                        className={`h-9 rounded-control font-mono text-xs flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-clinic-primary text-white font-bold shadow-xs scale-105"
                            : isPast
                            ? "text-clinic-ink-muted opacity-40 cursor-not-allowed"
                            : hasSchedule
                            ? "text-clinic-ink hover:bg-clinic-terracotta-soft font-semibold"
                            : "text-clinic-ink-soft hover:bg-clinic-bg"
                        }`}
                      >
                        <span>{dayNum}</span>
                        {hasSchedule && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-clinic-terracotta absolute bottom-1" />
                        )}
                        {isToday && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-clinic-primary absolute top-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-clinic-line flex items-center justify-start gap-4 text-[11px] text-clinic-ink-soft">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-clinic-primary" />
                  <span>วันที่เลือก</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-clinic-terracotta" />
                  <span>มีตารางตรวจ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Shift Banner & Slots Timetable (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Shift Banner */}
          <div className="bg-clinic-primary-soft/80 border border-clinic-primary/20 rounded-card p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-control bg-clinic-primary text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-clinic-primary-deep font-display">
                {formattedSelectedDate || "กรุณาเลือกวันที่ตรวจ"}
              </h2>
              {selectedSchedule ? (
                <div className="text-xs text-clinic-ink-soft space-y-0.5">
                  <p>
                    แพทย์ผู้ตรวจ:{" "}
                    <strong className="text-clinic-ink">
                      พท. {selectedSchedule.doctorFullname}
                    </strong>
                  </p>
                  <p className="text-[11px]">
                    เวลาทำการตรวจ: {formatTimeString(selectedSchedule.shiftStart)} –{" "}
                    {formatTimeString(selectedSchedule.shiftEnd)} น.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-clinic-ink-soft">
                  ไม่มีตารางตรวจในวันที่เลือก กรุณาเลือกวันที่มีจุดสีส้มอิฐบนปฏิทิน
                </p>
              )}
            </div>
          </div>

          {/* Multiple schedules switcher on same day */}
          {schedulesOnSelectedDate.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-clinic-ink-soft shrink-0">
                เลือกแพทย์ในวันนี้:
              </span>
              {schedulesOnSelectedDate.map((sch) => (
                <Button
                  key={sch.scheduleId}
                  type="button"
                  variant={sch.scheduleId === selectedScheduleId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedScheduleId(sch.scheduleId)}
                  className="h-7 text-xs shrink-0"
                >
                  พท. {sch.doctorFullname}
                </Button>
              ))}
            </div>
          )}

          {/* Time Slot Selection Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-clinic-primary" />
                <span>เลือกช่วงเวลาที่ต้องการนัดหมาย</span>
              </CardTitle>

              {selectedSchedule && (
                <Badge variant="terracotta" className="text-xs">
                  ว่าง {slots.filter((s) => s.status === "AVAILABLE").length} / {slots.length} คิว
                </Badge>
              )}
            </CardHeader>

            <CardContent className="pt-4 space-y-5">
              {/* Slots Grid */}
              {isLoadingSlots ? (
                <div className="py-12 text-center text-clinic-ink-soft text-xs space-y-2">
                  <div className="w-6 h-6 border-2 border-clinic-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>กำลังโหลดช่วงเวลานัดหมาย…</p>
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                          className={`p-3 rounded-control border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-clinic-terracotta border-clinic-terracotta text-white shadow-md scale-[1.02]"
                              : "bg-white border-clinic-line hover:border-clinic-terracotta hover:bg-clinic-terracotta-soft/20 text-clinic-ink shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sm">
                              {startTime}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              ว่าง
                            </span>
                          </div>
                          <p className={`text-[11px] mt-1 ${isSelected ? "text-white/85" : "text-clinic-ink-soft"}`}>
                            ถึง {endTime} น.
                          </p>
                        </button>
                      );
                    }

                    return (
                      <div
                        key={slot.slotId}
                        className="p-3 rounded-control border border-clinic-line/60 bg-clinic-bg/40 text-clinic-ink-muted opacity-50 cursor-not-allowed flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm line-through">
                            {startTime}
                          </span>
                          <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">
                            เต็ม
                          </span>
                        </div>
                        <p className="text-[11px] mt-1">ถึง {endTime} น.</p>
                      </div>
                    );
                  })}
                </div>
              ) : selectedScheduleId ? (
                <div className="py-10 text-center text-clinic-ink-soft text-xs space-y-1 bg-clinic-bg/40 rounded-control border border-dashed border-clinic-line">
                  <p className="font-semibold text-clinic-ink">
                    ยังไม่มีการเปิดช่วงเวลาตรวจสำหรับตารางเวรนี้
                  </p>
                  <p className="text-[11px]">กรุณาเลือกวันตรวจอื่นจากปฏิทิน</p>
                </div>
              ) : (
                <div className="py-10 text-center text-clinic-ink-soft text-xs space-y-1 bg-clinic-bg/40 rounded-control border border-dashed border-clinic-line">
                  <p className="font-semibold text-clinic-ink">
                    ยังไม่ได้เลือกวันตรวจรักษา
                  </p>
                  <p className="text-[11px]">กรุณาคลิกเลือกวันที่ที่มีตารางตรวจบนปฏิทิน</p>
                </div>
              )}

              {/* Bottom Action */}
              <div className="pt-4 border-t border-clinic-line flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/patient/appointments">ยกเลิก</Link>
                </Button>

                <Button
                  type="button"
                  variant="terracotta"
                  size="lg"
                  onClick={handleBook}
                  disabled={!selectedSlotId || isPending}
                  className="w-full sm:w-auto font-semibold gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isPending ? "กำลังบันทึกการจอง…" : "ยืนยันการจองคิวตรวจ"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
