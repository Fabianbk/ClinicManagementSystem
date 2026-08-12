"use client";

import { useState } from "react";
import type { WorkingScheduleResponseDTO, AppointmentSlotResponseDTO } from "@/lib/types";

interface ScheduleManagerClientProps {
  doctorId: number;
  doctorUsername?: string;
  initialSchedules: WorkingScheduleResponseDTO[];
}

export function ScheduleManagerClient({
  doctorId,
  doctorUsername,
  initialSchedules,
}: ScheduleManagerClientProps) {
  const [schedules, setSchedules] = useState<WorkingScheduleResponseDTO[]>(initialSchedules);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter state
  const [filterType, setFilterType] = useState<"ALL" | "UPCOMING" | "TODAY">("ALL");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("16:00");
  const [slotMinutes, setSlotMinutes] = useState<number>(30);
  const [hasLunchBreak, setHasLunchBreak] = useState(true);
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");

  // Manage Slots Modal State
  const [selectedSchedule, setSelectedSchedule] = useState<WorkingScheduleResponseDTO | null>(null);
  const [slots, setSlots] = useState<AppointmentSlotResponseDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [updatingSlotId, setUpdatingSlotId] = useState<number | null>(null);

  // Reload schedules via Next.js API route
  const refreshSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/working-schedules/doctor/${doctorId}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลตารางเวรได้");
      const data: WorkingScheduleResponseDTO[] = await res.json();
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSchedules(data);
    } catch (err: any) {
      setErrorMsg(err.message || "ไม่สามารถโหลดข้อมูลตารางเวรได้");
    } finally {
      setLoading(false);
    }
  };

  // Open slot modal & fetch slots via Next.js API route
  const openSlotsModal = async (schedule: WorkingScheduleResponseDTO) => {
    setSelectedSchedule(schedule);
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointment-slots/schedule/${schedule.scheduleId}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดสล็อตเวลาได้");
      const data: AppointmentSlotResponseDTO[] = await res.json();
      data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setSlots(data);
    } catch (err: any) {
      setErrorMsg(err.message || "ไม่สามารถโหลดสล็อตเวลาได้");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle Create Schedule & Auto Slot Generation
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!scheduleDate || !shiftStartTime || !shiftEndTime) {
      setErrorMsg("กรุณากรอกวันที่ และเวลาเริ่ม-สิ้นสุดให้ครบถ้วน");
      return;
    }

    if (slotMinutes <= 0) {
      setErrorMsg("ระยะเวลาสล็อตต้องมากกว่า 0 นาที");
      return;
    }

    try {
      setSubmitting(true);

      const startDateTimeStr = `${scheduleDate}T${shiftStartTime}:00`;
      const endDateTimeStr = `${scheduleDate}T${shiftEndTime}:00`;
      const shiftStartObj = new Date(startDateTimeStr);
      const shiftEndObj = new Date(endDateTimeStr);

      if (shiftEndObj <= shiftStartObj) {
        setErrorMsg("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
        setSubmitting(false);
        return;
      }

      // 1. Create WorkingSchedule
      const resSchedule = await fetch("/api/working-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date: scheduleDate,
          shiftStart: shiftStartObj.toISOString(),
          shiftEnd: shiftEndObj.toISOString(),
        }),
      });

      if (!resSchedule.ok) {
        const errJson = await resSchedule.json().catch(() => ({}));
        throw new Error(errJson.message || "เกิดข้อผิดพลาดในการสร้างตารางเวร");
      }

      const createdSchedule: WorkingScheduleResponseDTO = await resSchedule.json();

      // 2. Auto Generate Slots
      let createdSlotCount = 0;
      let curr = new Date(shiftStartObj);
      const lunchStartObj = hasLunchBreak ? new Date(`${scheduleDate}T${lunchStart}:00`) : null;
      const lunchEndObj = hasLunchBreak ? new Date(`${scheduleDate}T${lunchEnd}:00`) : null;

      while (curr < shiftEndObj) {
        const nextTime = new Date(curr.getTime() + slotMinutes * 60 * 1000);
        if (nextTime > shiftEndObj) break;

        // Check lunch overlap
        let isLunch = false;
        if (lunchStartObj && lunchEndObj) {
          if (curr < lunchEndObj && nextTime > lunchStartObj) {
            isLunch = true;
          }
        }

        if (!isLunch) {
          await fetch("/api/appointment-slots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scheduleId: createdSchedule.scheduleId,
              startTime: curr.toISOString(),
              endTime: nextTime.toISOString(),
              status: "AVAILABLE",
            }),
          });
          createdSlotCount++;
        }

        curr = nextTime;
      }

      setSuccessMsg(
        `สร้างตารางเวรวันที่ ${formatDateThai(scheduleDate)} สำเร็จ! พร้อมสร้างสล็อตเวลารับนัด ${createdSlotCount} สล็อต`
      );
      setIsCreateOpen(false);
      refreshSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการสร้างตารางเวร");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบตารางเวรนี้? สล็อตเวลาที่ไม่มีการนัดหมายจะถูกลบไปด้วย")) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/working-schedules/${scheduleId}`, { method: "DELETE" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถลบตารางเวรได้ (อาจมีนัดหมายค้างอยู่)");
      }
      setSuccessMsg("ลบตารางเวรเรียบร้อยแล้ว");
      refreshSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || "ไม่สามารถลบตารางเวรได้");
    } finally {
      setLoading(false);
    }
  };

  // Toggle slot status (AVAILABLE <-> BLOCKED)
  const handleToggleSlotStatus = async (slot: AppointmentSlotResponseDTO) => {
    if (slot.status === "BOOKED") {
      alert("ไม่สามารถเปลี่ยนสถานะสล็อตที่มีการนัดหมายแล้วได้");
      return;
    }
    const newStatus = slot.status === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";
    try {
      setUpdatingSlotId(slot.slotId);
      const res = await fetch(`/api/appointment-slots/${slot.slotId}/status?status=${newStatus}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("ไม่สามารถเปลี่ยนสถานะสล็อตได้");
      if (selectedSchedule) {
        openSlotsModal(selectedSchedule);
      }
    } catch (err: any) {
      alert(err.message || "ไม่สามารถอัปเดตสถานะสล็อตเวลาได้");
    } finally {
      setUpdatingSlotId(null);
    }
  };

  // Filter schedules
  const todayStr = new Date().toISOString().split("T")[0];
  const filteredSchedules = schedules.filter((sch) => {
    const schDateStr = sch.date ? sch.date.split("T")[0] : "";
    if (filterType === "TODAY") {
      return schDateStr === todayStr;
    }
    if (filterType === "UPCOMING") {
      return schDateStr >= todayStr;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-body text-clinic-ink">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clinic-primary-deep flex items-center gap-2">
            <span>ตารางออกตรวจของฉัน</span>
          </h1>
          <p className="text-sm text-clinic-ink-soft mt-1">
            จัดการตารางเวลาทำงาน วันออกตรวจ และสล็อตเวลารับนัดหมายผู้ป่วย
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setSuccessMsg(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md active:scale-95 cursor-pointer"
        >
          + เพิ่มตารางเวรออกตรวจ
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-2">ปิด</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-control bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline ml-2">ปิด</button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            ตารางเวรทั้งหมด
          </span>
          <div className="text-3xl font-bold text-clinic-primary-deep mt-1">{schedules.length}</div>
        </div>
        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            ตารางเวรวันนี้
          </span>
          <div className="text-3xl font-bold text-emerald-700 mt-1">
            {schedules.filter((s) => (s.date ? s.date.split("T")[0] : "") === todayStr).length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            ตารางล่วงหน้า
          </span>
          <div className="text-3xl font-bold text-clinic-accent-deep mt-1">
            {schedules.filter((s) => (s.date ? s.date.split("T")[0] : "") >= todayStr).length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-clinic-line pb-2">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
            filterType === "ALL"
              ? "bg-clinic-primary text-white"
              : "text-clinic-ink-soft hover:bg-clinic-line/40"
          }`}
        >
          ทั้งหมด ({schedules.length})
        </button>
        <button
          onClick={() => setFilterType("UPCOMING")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
            filterType === "UPCOMING"
              ? "bg-clinic-primary text-white"
              : "text-clinic-ink-soft hover:bg-clinic-line/40"
          }`}
        >
          ล่วงหน้า & วันนี้ (
          {schedules.filter((s) => (s.date ? s.date.split("T")[0] : "") >= todayStr).length})
        </button>
        <button
          onClick={() => setFilterType("TODAY")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
            filterType === "TODAY"
              ? "bg-clinic-primary text-white"
              : "text-clinic-ink-soft hover:bg-clinic-line/40"
          }`}
        >
          วันนี้ (
          {schedules.filter((s) => (s.date ? s.date.split("T")[0] : "") === todayStr).length})
        </button>
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="p-12 text-center text-clinic-ink-soft">กำลังโหลดตารางเวร...</div>
      ) : filteredSchedules.length === 0 ? (
        <div className="border border-dashed border-clinic-line rounded-card p-12 text-center text-clinic-ink-soft bg-white/50 space-y-3">
          <p className="text-base font-medium">ยังไม่มีตารางเวรออกตรวจในช่วงนี้</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="text-sm font-semibold text-clinic-primary hover:underline cursor-pointer"
          >
            + คลิกที่นี่เพื่อเพิ่มตารางเวรออกตรวจใหม่
          </button>
        </div>
      ) : (
        <div className="bg-white border border-clinic-line rounded-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-clinic-bg border-b border-clinic-line">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    วันที่ออกตรวจ
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    เวลาปฏิบัติงาน (Shift)
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    สถานะ
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft text-right">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line">
                {filteredSchedules.map((sch) => {
                  const schDateStr = sch.date ? sch.date.split("T")[0] : "";
                  const isToday = schDateStr === todayStr;
                  const isPast = schDateStr < todayStr;

                  return (
                    <tr key={sch.scheduleId} className="hover:bg-clinic-bg/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-clinic-ink">
                        {formatDateThai(sch.date)}
                      </td>
                      <td className="px-5 py-4 text-clinic-ink">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-clinic-bg font-mono text-xs text-clinic-ink font-medium border border-clinic-line">
                          🕒 {formatTimeOnly(sch.shiftStart)} - {formatTimeOnly(sch.shiftEnd)} น.
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isToday ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            วันนี้
                          </span>
                        ) : isPast ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            ผ่านไปแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            ล่วงหน้า
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openSlotsModal(sch)}
                          className="px-3 py-1.5 rounded-control text-xs font-semibold text-clinic-primary bg-clinic-bg hover:bg-clinic-primary hover:text-white transition-colors border border-clinic-line cursor-pointer"
                        >
                          📅 ดูสล็อตเวลา
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch.scheduleId)}
                          className="px-3 py-1.5 rounded-control text-xs font-semibold text-clinic-danger bg-clinic-danger-bg hover:bg-clinic-danger hover:text-white transition-colors border border-clinic-danger/30 cursor-pointer"
                        >
                          🗑️ ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Schedule & Auto Generate Slots */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-card shadow-xl border border-clinic-line p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-clinic-line pb-3">
              <h3 className="font-display text-lg font-bold text-clinic-primary-deep">
                เพิ่มตารางเวรออกตรวจใหม่
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-clinic-ink-soft hover:text-clinic-ink text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                  วันที่ออกตรวจ *
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-clinic-line rounded-control focus:outline-hidden focus:ring-2 focus:ring-clinic-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                    เวลาเริ่มเข้าเวร *
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-clinic-line rounded-control focus:outline-hidden focus:ring-2 focus:ring-clinic-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                    เวลาสิ้นสุดเวร *
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-clinic-line rounded-control focus:outline-hidden focus:ring-2 focus:ring-clinic-primary"
                  />
                </div>
              </div>

              <div className="bg-clinic-bg/60 border border-clinic-line rounded-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-clinic-primary-deep text-xs">
                    ⚡ สล็อตเวลารับนัด (Auto Slots)
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-clinic-ink-soft mb-1">
                    ความยาวแต่ละสล็อต (นาที) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    step={5}
                    required
                    value={slotMinutes}
                    onChange={(e) => setSlotMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-clinic-line rounded-control bg-white focus:ring-2 focus:ring-clinic-primary"
                  />
                </div>

                <div className="pt-2 border-t border-clinic-line/60">
                  <label className="flex items-center gap-2 text-xs font-semibold text-clinic-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasLunchBreak}
                      onChange={(e) => setHasLunchBreak(e.target.checked)}
                      className="rounded text-clinic-primary focus:ring-clinic-primary"
                    />
                    <span>เว้นช่วงพักเที่ยง (Auto-close at Lunch)</span>
                  </label>

                  {hasLunchBreak && (
                    <div className="grid grid-cols-2 gap-3 mt-2 pl-6">
                      <div>
                        <span className="text-[11px] text-clinic-ink-soft">เริ่มพัก</span>
                        <input
                          type="time"
                          value={lunchStart}
                          onChange={(e) => setLunchStart(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-clinic-line rounded bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-clinic-ink-soft">สิ้นสุดพัก</span>
                        <input
                          type="time"
                          value={lunchEnd}
                          onChange={(e) => setLunchEnd(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-clinic-line rounded bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-clinic-line">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-clinic-ink-soft hover:bg-clinic-line/30 rounded-control cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primary-deep rounded-control shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "กำลังสร้างตาราง..." : "บันทึกและสร้างสล็อตเวลา"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Manage Slots for a Schedule */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-card shadow-xl border border-clinic-line p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-clinic-line pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-clinic-primary-deep">
                  สล็อตเวลารับนัดหมาย
                </h3>
                <p className="text-xs text-clinic-ink-soft mt-0.5">
                  วันที่ {formatDateThai(selectedSchedule.date)} (
                  {formatTimeOnly(selectedSchedule.shiftStart)} -{" "}
                  {formatTimeOnly(selectedSchedule.shiftEnd)} น.)
                </p>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-clinic-ink-soft hover:text-clinic-ink text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingSlots ? (
                <div className="py-12 text-center text-clinic-ink-soft text-sm">
                  กำลังโหลดสล็อตเวลา...
                </div>
              ) : slots.length === 0 ? (
                <div className="py-12 text-center text-clinic-ink-soft text-sm border border-dashed border-clinic-line rounded-card">
                  ยังไม่มีสล็อตเวลาสำหรับตารางเวรนี้
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slots.map((slot) => {
                    const isAvailable = slot.status === "AVAILABLE";
                    const isBooked = slot.status === "BOOKED";
                    const isBlocked = slot.status === "BLOCKED";

                    return (
                      <div
                        key={slot.slotId}
                        className={`p-3 rounded-control border flex items-center justify-between text-xs transition-all ${
                          isAvailable
                            ? "bg-emerald-50/50 border-emerald-200"
                            : isBooked
                            ? "bg-amber-50/60 border-amber-200"
                            : "bg-gray-100 border-gray-200 opacity-75"
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold text-clinic-ink">
                            🕒 {formatTimeOnly(slot.startTime)} - {formatTimeOnly(slot.endTime)} น.
                          </div>
                          <div className="mt-1">
                            {isAvailable && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                ว่าง (เปิดรับจอง)
                              </span>
                            )}
                            {isBooked && (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                จองแล้ว
                              </span>
                            )}
                            {isBlocked && (
                              <span className="text-[10px] font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
                                ปิดรับจอง (Blocked)
                              </span>
                            )}
                          </div>
                        </div>

                        {!isBooked && (
                          <button
                            disabled={updatingSlotId === slot.slotId}
                            onClick={() => handleToggleSlotStatus(slot)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                              isAvailable
                                ? "bg-white text-clinic-danger border-clinic-danger/40 hover:bg-clinic-danger-bg"
                                : "bg-clinic-primary text-white border-clinic-primary hover:bg-clinic-primary-deep"
                            }`}
                          >
                            {updatingSlotId === slot.slotId
                              ? "..."
                              : isAvailable
                              ? "ปิดรับจอง"
                              : "เปิดรับจอง"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-clinic-line pt-3">
              <button
                onClick={() => setSelectedSchedule(null)}
                className="px-4 py-1.5 bg-clinic-bg text-clinic-ink font-semibold text-xs rounded-control hover:bg-clinic-line/50 cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatDateThai(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const cleanDate = dateStr.split("T")[0];
    const d = new Date(cleanDate + "T00:00:00");
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  } catch (e) {
    return dateStr;
  }
}

function formatTimeOnly(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
}
