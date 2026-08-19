"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { WorkingScheduleResponseDTO, AppointmentSlotResponseDTO } from "@/lib/types";
import { CalendarIcon } from "@/components/site/icons";

export function PatientBookAppointmentClient({
  patientId,
  initialSchedules,
}: {
  patientId: number;
  initialSchedules: WorkingScheduleResponseDTO[];
}) {
  const router = useRouter();
  const [schedules] = useState<WorkingScheduleResponseDTO[]>(initialSchedules);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    initialSchedules.length > 0 ? initialSchedules[0].scheduleId : null
  );
  const [slots, setSlots] = useState<AppointmentSlotResponseDTO[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load available slots when selected schedule changes
  useEffect(() => {
    if (!selectedScheduleId) {
      setSlots([]);
      return;
    }

    let isMounted = true;
    setIsLoadingSlots(true);
    setSelectedSlotId(null);
    setErrorMessage(null);

    fetch(`/api/appointment-slots/schedule/${selectedScheduleId}/available`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        setSlots(data?.data || []);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("ไม่สามารถโหลดช่วงเวลาว่างได้");
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedScheduleId]);

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
        setErrorMessage(body?.message || "ไม่สามารถจองคิวนัดหมายได้ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setSuccessMessage("จองคิวนัดหมายสำเร็จ กำลังนำท่านไปยังหน้ารายการนัดหมาย…");
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

  const selectedSchedule = schedules.find((s) => s.scheduleId === selectedScheduleId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-clinic-primary-deep flex items-center gap-2">
            จองคิวนัดหมายออนไลน์
          </h1>
          <p className="text-xs text-clinic-ink-soft mt-0.5">
            เลือกวันตรวจ แพทย์แผนไทย และช่วงเวลาที่สะดวกเข้ารับการรักษา
          </p>
        </div>

        <Link
          href="/patient/appointments"
          className="text-xs font-semibold text-clinic-primary hover:underline"
        >
          ← กลับไปยังนัดหมายของฉัน
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-control bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-medium animate-in fade-in">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Schedule / Date */}
        <div className="md:col-span-1 bg-white border border-clinic-line rounded-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <span className="w-6 h-6 rounded-full bg-clinic-primary text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="font-display font-bold text-sm text-clinic-primary-deep">
              เลือกวันตรวจ / ตารางเวร
            </h2>
          </div>

          {schedules.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {schedules.map((schedule) => {
                const isSelected = schedule.scheduleId === selectedScheduleId;
                const scheduleDate = new Date(schedule.date);
                const formatTime = (t: string) => {
                  if (!t) return "";
                  if (t.includes("T")) {
                    return new Date(t).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
                  }
                  return t;
                };

                return (
                  <button
                    key={schedule.scheduleId}
                    type="button"
                    onClick={() => setSelectedScheduleId(schedule.scheduleId)}
                    className={`w-full text-left p-3 rounded-control border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-clinic-primary/10 border-clinic-primary text-clinic-primary-deep shadow-xs font-semibold"
                        : "bg-clinic-bg border-clinic-line text-clinic-ink hover:border-clinic-primary/50"
                    }`}
                  >
                    <p className="font-bold text-sm">
                      {scheduleDate.toLocaleDateString("th-TH", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-clinic-ink-soft mt-0.5">
                      แพทย์: <span className="font-medium text-clinic-ink">{schedule.doctorFullname}</span>
                    </p>
                    <p className="text-clinic-ink-soft text-[11px]">
                      เวลาทำการ: {formatTime(schedule.shiftStart)} - {formatTime(schedule.shiftEnd)} น.
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-clinic-ink-soft text-center py-6">
              ยังไม่มีตารางเวรแพทย์ที่เปิดให้จองในขณะนี้
            </p>
          )}
        </div>

        {/* Step 2: Select Time Slot */}
        <div className="md:col-span-2 bg-white border border-clinic-line rounded-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-clinic-line pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-clinic-accent-deep text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-display font-bold text-sm text-clinic-primary-deep">
                  เลือกช่วงเวลานัดหมาย
                </h2>
              </div>

              {selectedSchedule && (
                <span className="text-xs text-clinic-primary-deep font-semibold">
                  แพทย์: {selectedSchedule.doctorFullname}
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <div className="py-12 text-center text-clinic-ink-soft text-xs animate-pulse">
                กำลังโหลดช่วงเวลาว่าง…
              </div>
            ) : slots.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-clinic-ink-soft">
                  เลือกช่วงเวลาว่างที่ต้องการ (มี {slots.length} ช่วงเวลาว่าง):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {slots.map((slot) => {
                    const isSelected = slot.slotId === selectedSlotId;
                    const startTime = new Date(slot.startTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const endTime = new Date(slot.endTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <button
                        key={slot.slotId}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.slotId)}
                        className={`p-3 rounded-control border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-clinic-primary text-white border-clinic-primary shadow-sm font-bold scale-[1.02]"
                            : "bg-clinic-bg border-clinic-line text-clinic-ink hover:border-clinic-primary hover:bg-white"
                        }`}
                      >
                        <p className="font-mono text-sm">
                          {startTime} - {endTime}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? "text-white/80" : "text-emerald-700"
                          }`}
                        >
                          ว่างสำหรับจอง
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : selectedScheduleId ? (
              <div className="py-12 text-center text-clinic-ink-soft space-y-1 text-xs">
                <p className="font-semibold text-clinic-ink">ไม่มีช่วงเวลาว่างในตารางเวรนี้</p>
                <p>อาจถูกจองเต็มแล้ว หรือยังไม่ได้เปิดช่วงเวลาตรวจ กรุณาเลือกวันตรวจอื่น</p>
              </div>
            ) : (
              <div className="py-12 text-center text-clinic-ink-soft text-xs">
                กรุณาเลือกวันตรวจในขั้นตอนที่ 1 ก่อน
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-clinic-line flex items-center justify-between">
            <Link
              href="/patient/dashboard"
              className="px-4 py-2 rounded-control text-xs font-semibold text-clinic-ink bg-clinic-bg border border-clinic-line hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </Link>

            <button
              type="button"
              onClick={handleBook}
              disabled={!selectedSlotId || isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-control text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CalendarIcon width={18} height={18} />
              <span>{isPending ? "กำลังบันทึกการจอง…" : "ยืนยันการจองคิว"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
