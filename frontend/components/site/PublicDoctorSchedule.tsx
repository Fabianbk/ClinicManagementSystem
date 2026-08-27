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
  Calendar,
  Clock,
  User,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Filter,
} from "lucide-react";
import { formatThaiDateWithWeekday, formatThaiShortDate } from "@/lib/utils";

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

export function PublicDoctorSchedule({
  initialSchedules,
  initialDoctors,
}: PublicDoctorScheduleProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "ALL">("ALL");

  // Filter schedules by selected doctor AND only future/today dates
  const filteredSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let list = initialSchedules.filter((s) => {
      const scheduleDate = new Date(s.date);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate.getTime() >= today.getTime();
    });

    if (selectedDoctorId !== "ALL") {
      list = list.filter((s) => s.doctorId === selectedDoctorId);
    }
    // Sort chronologically
    return [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [initialSchedules, selectedDoctorId]);

  // Selected schedule state
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(() => {
    return filteredSchedules.length > 0 ? filteredSchedules[0].scheduleId : null;
  });

  // Keep selected schedule valid when filter changes
  useEffect(() => {
    if (filteredSchedules.length > 0) {
      if (!selectedScheduleId || !filteredSchedules.some((s) => s.scheduleId === selectedScheduleId)) {
        setSelectedScheduleId(filteredSchedules[0].scheduleId);
      }
    } else {
      setSelectedScheduleId(null);
    }
  }, [filteredSchedules, selectedScheduleId]);

  // Selected schedule object
  const activeSchedule = useMemo(() => {
    return filteredSchedules.find((s) => s.scheduleId === selectedScheduleId) || null;
  }, [filteredSchedules, selectedScheduleId]);

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
    <div className="space-y-6">
      {/* Filter by Doctor Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-control border border-clinic-line shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-clinic-ink-soft">
          <Filter className="w-4 h-4 text-clinic-primary" />
          <span>เลือกแพทย์ผู้ตรวจ:</span>
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

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-card border border-clinic-line p-6 space-y-2">
          <Calendar className="w-8 h-8 text-clinic-ink-muted mx-auto" />
          <p className="text-sm font-semibold text-clinic-ink">
            ยังไม่มีตารางเวลาออกตรวจสำหรับแพทย์ที่เลือก
          </p>
          <p className="text-xs text-clinic-ink-soft">
            กรุณาเลือกแพทย์ท่านอื่น หรือติดต่อสอบถามเจ้าหน้าที่คลินิกโดยตรง
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Schedule Dates List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-clinic-primary" />
              <span>วันที่แพทย์ลงตรวจ ({filteredSchedules.length} วัน)</span>
            </h3>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredSchedules.map((schedule) => {
                const isSelected = schedule.scheduleId === selectedScheduleId;
                const dateInfo = formatThaiShortDate(schedule.date);

                return (
                  <div
                    key={schedule.scheduleId}
                    onClick={() => setSelectedScheduleId(schedule.scheduleId)}
                    className={`p-3.5 rounded-card border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-clinic-primary text-white border-clinic-primary shadow-sm"
                        : "bg-white hover:border-clinic-primary/40 border-clinic-line text-clinic-ink"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Date Badge */}
                      <div
                        className={`w-12 h-12 rounded-control flex flex-col items-center justify-center shrink-0 font-display ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-clinic-primary-soft text-clinic-primary-deep"
                        }`}
                      >
                        <span className="text-[10px] leading-none uppercase font-bold">
                          {dateInfo.dayName}
                        </span>
                        <span className="text-base font-bold leading-tight">
                          {dateInfo.dayNum}
                        </span>
                        <span className="text-[9px] leading-none text-opacity-80">
                          {dateInfo.monthName}
                        </span>
                      </div>

                      {/* Doctor & Shift details */}
                      <div className="space-y-0.5">
                        <strong className="block text-xs sm:text-sm font-semibold truncate">
                          {schedule.doctorFullname}
                        </strong>
                        <p
                          className={`text-[11px] flex items-center gap-1 font-mono ${
                            isSelected ? "text-white/80" : "text-clinic-ink-soft"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatTimeString(schedule.shiftStart)} -{" "}
                            {formatTimeString(schedule.shiftEnd)} น.
                          </span>
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? "text-white translate-x-1" : "text-clinic-ink-muted"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Appointment Slots & Status */}
          <div className="lg:col-span-7">
            <Card className="border-clinic-line h-full flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-clinic-primary-deep flex items-center gap-2">
                      <Clock className="w-4 h-4 text-clinic-primary" />
                      <span>รอบเวลาตรวจ (Appointment Slots)</span>
                    </CardTitle>
                    {activeSchedule && (
                      <p className="text-xs text-clinic-ink-soft mt-0.5">
                        {formatThaiDateWithWeekday(activeSchedule.date)} · แพทย์:{" "}
                        <strong className="text-clinic-ink">
                          {activeSchedule.doctorFullname}
                        </strong>
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
                {isLoadingSlots ? (
                  <div className="py-12 text-center text-clinic-ink-soft text-xs">
                    กำลังโหลดช่วงเวลาการตรวจ...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-12 text-center text-clinic-ink-soft text-xs space-y-1">
                    <p>ยังไม่มีการเปิดรอบเวลาสำหรับตารางเวรนี้</p>
                    <p className="text-[11px] text-clinic-ink-muted">
                      กรุณาเลือกวันอื่นหรือติดต่อคลินิก
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map((slot) => {
                      const startTimeStr = formatTimeString(slot.startTime);
                      const endTimeStr = formatTimeString(slot.endTime);
                      const isAvailable = slot.status === "AVAILABLE";

                      return (
                        <div
                          key={slot.slotId}
                          className={`p-3 rounded-control border text-xs flex items-center justify-between gap-2 transition-all ${
                            isAvailable
                              ? "bg-white border-clinic-line hover:border-clinic-primary/50 shadow-2xs"
                              : "bg-clinic-bg/60 border-clinic-line/70 opacity-70"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-clinic-ink text-sm block">
                              {startTimeStr} - {endTimeStr} น.
                            </span>
                            <SlotStatusBadge status={slot.status} />
                          </div>

                          {isAvailable ? (
                            <Button
                              asChild
                              variant="terracotta"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] font-semibold gap-1 shrink-0"
                            >
                              <Link href={`/patient/login?next=/patient/book`}>
                                <span>จองรอบนี้</span>
                              </Link>
                            </Button>
                          ) : (
                            <span className="text-[11px] font-medium text-clinic-ink-muted">
                              {slot.status === "BOOKED" ? "มีผู้จองแล้ว" : "งดให้บริการ"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Information hint at bottom */}
                <div className="pt-3 border-t border-clinic-line text-[11px] text-clinic-ink-soft flex items-center justify-between flex-wrap gap-2">
                  <span>
                    * ผู้รับบริการสามารถเข้าสู่ระบบเพื่อทำการจองรอบเวลาตรวจล่วงหน้าได้
                  </span>
                  <Link
                    href="/patient/login"
                    className="font-semibold text-clinic-terracotta hover:underline"
                  >
                    เข้าสู่ระบบเพื่อจองคิว →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
