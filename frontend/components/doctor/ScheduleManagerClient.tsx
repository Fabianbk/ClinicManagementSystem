"use client";

import { useState } from "react";
import type { WorkingScheduleResponseDTO, AppointmentSlotResponseDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Coffee,
} from "lucide-react";

interface ScheduleManagerClientProps {
  doctorId: number;
  doctorUsername?: string;
  initialSchedules: WorkingScheduleResponseDTO[];
}

function formatDateThai(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTimeOnly(timeStr: string): string {
  if (!timeStr) return "-";
  const d = new Date(timeStr);
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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

  // Reload schedules
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

  // Open slot modal & fetch slots
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
        `สร้างตารางเวรวันที่ ${formatDateThai(scheduleDate)} สำเร็จ! พร้อมสล็อตเวลารับนัด ${createdSlotCount} สล็อต`
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
      alert("สล็อตนี้มีผู้ป่วยจองคิวไว้แล้ว ไม่สามารถปิดหรือเปิดได้");
      return;
    }

    const nextStatus = slot.status === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";
    try {
      setUpdatingSlotId(slot.slotId);
      const res = await fetch(`/api/appointment-slots/${slot.slotId}/status?status=${nextStatus}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("ไม่สามารถเปลี่ยนสถานะสล็อตได้");

      setSlots((prev) =>
        prev.map((s) => (s.slotId === slot.slotId ? { ...s, status: nextStatus as any } : s))
      );
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการปรับสถานะสล็อต");
    } finally {
      setUpdatingSlotId(null);
    }
  };

  // Filtered schedules
  const todayStr = new Date().toISOString().split("T")[0];
  const filteredSchedules = schedules.filter((s) => {
    const sDate = s.date ? s.date.split("T")[0] : "";
    if (filterType === "TODAY") return sDate === todayStr;
    if (filterType === "UPCOMING") return sDate >= todayStr;
    return true;
  });

  return (
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      <PageHeader
        icon={<Clock className="w-5 h-5 text-clinic-primary" />}
        title="จัดการตารางเวรแพทย์ (Duty Schedule)"
        subtitle="กำหนดวันออกตรวจ เวลาทำงาน และสร้างช่วงเวลานัดหมาย (Slots) สำหรับคนไข้จองออนไลน์"
        actions={
          <Button
            type="button"
            variant="terracotta"
            size="sm"
            onClick={() => {
              setErrorMsg(null);
              setIsCreateOpen(true);
            }}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ กำหนดวันออกตรวจใหม่</span>
          </Button>
        }
      />

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-xs underline cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-control bg-clinic-success-bg border border-clinic-success text-clinic-success text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs underline cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-clinic-line pb-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={filterType === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("ALL")}
            className="h-8 text-xs"
          >
            ทั้งหมด ({schedules.length})
          </Button>
          <Button
            type="button"
            variant={filterType === "UPCOMING" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("UPCOMING")}
            className="h-8 text-xs"
          >
            เร็วๆ นี้ / กำลังมาถึง
          </Button>
          <Button
            type="button"
            variant={filterType === "TODAY" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("TODAY")}
            className="h-8 text-xs"
          >
            วันนี้
          </Button>
        </div>
      </div>

      {/* Schedules List Grid */}
      {filteredSchedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchedules.map((schedule) => {
            const isToday = schedule.date?.startsWith(todayStr);
            const isPast = schedule.date ? schedule.date.split("T")[0] < todayStr : false;

            return (
              <Card
                key={schedule.scheduleId}
                className={`relative transition-all hover:shadow-md ${
                  isToday
                    ? "border-clinic-terracotta ring-1 ring-clinic-terracotta/20 bg-clinic-terracotta-soft/20"
                    : isPast
                    ? "opacity-80 bg-clinic-bg/40"
                    : "hover:border-clinic-primary/40"
                }`}
              >
                <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-clinic-primary-deep">
                        {formatDateThai(schedule.date)}
                      </span>
                      {isToday && (
                        <Badge variant="terracotta" className="text-[10px] font-bold">
                          วันนี้
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-clinic-ink-soft">
                      รหัสเวร: #{schedule.scheduleId}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSchedule(schedule.scheduleId)}
                    title="ลบตารางเวร"
                    className="h-8 w-8 text-clinic-ink-soft hover:text-clinic-danger hover:bg-clinic-danger-bg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between bg-clinic-bg p-3 rounded-control border border-clinic-line text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-clinic-primary" />
                      <span className="font-semibold text-clinic-ink">เวลาออกตรวจ:</span>
                    </div>
                    <span className="font-mono font-bold text-clinic-primary-deep">
                      {formatTimeOnly(schedule.shiftStart)} - {formatTimeOnly(schedule.shiftEnd)} น.
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openSlotsModal(schedule)}
                      className="w-full text-xs gap-1.5 justify-center shadow-2xs font-semibold hover:border-clinic-primary"
                    >
                      <CalendarCheck className="w-4 h-4 text-clinic-primary" />
                      <span>จัดการสล็อตเวลา (Slots)</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-clinic-primary" />}
          title="ไม่พบรายการตารางเวรในช่วงที่เลือก"
          description="ท่านสามารถเพิ่มวันออกตรวจและสร้างสล็อตเวลาอัตโนมัติได้ทันที"
          action={
            <Button
              type="button"
              variant="terracotta"
              size="sm"
              onClick={() => {
                setErrorMsg(null);
                setIsCreateOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>+ กำหนดวันออกตรวจใหม่</span>
            </Button>
          }
        />
      )}

      {/* 1. Modal: Create Working Schedule */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>กำหนดวันออกตรวจและสร้างสล็อต</DialogTitle>
            <DialogDescription>
              ระบบจะคำนวณและสร้างสล็อตเวลารับนัดให้อัตโนมัติ (ข้ามช่วงพักเที่ยง)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSchedule} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="scheduleDate" required>
                วันที่ออกตรวจ (Date)
              </Label>
              <Input
                id="scheduleDate"
                type="date"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="shiftStartTime" required>
                  เวลาเริ่มตรวจ
                </Label>
                <Input
                  id="shiftStartTime"
                  type="time"
                  required
                  value={shiftStartTime}
                  onChange={(e) => setShiftStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shiftEndTime" required>
                  เวลาสิ้นสุด
                </Label>
                <Input
                  id="shiftEndTime"
                  type="time"
                  required
                  value={shiftEndTime}
                  onChange={(e) => setShiftEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slotMinutes" required>
                ระยะเวลาต่อ 1 สล็อตนัดหมาย
              </Label>
              <Select
                id="slotMinutes"
                value={slotMinutes}
                onChange={(e) => setSlotMinutes(Number(e.target.value))}
              >
                <option value={15}>15 นาที (ตรวจเร็ว/จ่ายยา)</option>
                <option value={20}>20 นาที</option>
                <option value={30}>30 นาที (มาตรฐานการตรวจแผนไทย)</option>
                <option value={45}>45 นาที (ตรวจ + หัตถการสั้น)</option>
                <option value={60}>60 นาที (นวดรักษา/ประคบสมุนไพร)</option>
              </Select>
            </div>

            {/* Lunch Break Settings */}
            <div className="p-3 bg-clinic-bg rounded-control border border-clinic-line space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-clinic-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasLunchBreak}
                  onChange={(e) => setHasLunchBreak(e.target.checked)}
                  className="rounded text-clinic-primary focus:ring-clinic-primary"
                />
                <Coffee className="w-3.5 h-3.5 text-clinic-terracotta" />
                <span>เว้นช่วงพักเที่ยง (ไม่สร้างสล็อต)</span>
              </label>

              {hasLunchBreak && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-clinic-ink-soft">เริ่มพัก</Label>
                    <Input
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-clinic-ink-soft">สิ้นสุดพัก</Label>
                    <Input
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="terracotta"
                disabled={submitting}
              >
                {submitting ? "กำลังสร้างสล็อต..." : "✓ ยืนยันสร้างตารางเวร"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Modal: Manage Appointment Slots */}
      <Dialog open={!!selectedSchedule} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              สล็อตเวลานัดหมาย: {selectedSchedule ? formatDateThai(selectedSchedule.date) : ""}
            </DialogTitle>
            <DialogDescription>
              เวลาเวร: {selectedSchedule ? `${formatTimeOnly(selectedSchedule.shiftStart)} - ${formatTimeOnly(selectedSchedule.shiftEnd)} น.` : ""} · คลิกที่สล็อตเพื่อ เปิด/ปิด การรับนัดหมาย
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-3">
            {loadingSlots ? (
              <div className="p-8 text-center text-xs text-clinic-ink-soft">
                กำลังโหลดรายการสล็อต...
              </div>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {slots.map((slot) => {
                  const isAvailable = slot.status === "AVAILABLE";
                  const isBooked = slot.status === "BOOKED";
                  const isBlocked = slot.status === "BLOCKED";
                  const isUpdating = updatingSlotId === slot.slotId;

                  return (
                    <div
                      key={slot.slotId}
                      className={`p-2.5 rounded-control border text-xs flex flex-col justify-between gap-2 transition-all ${
                        isAvailable
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                          : isBooked
                          ? "bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs"
                          : "bg-stone-100 border-stone-300 text-stone-500 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm">
                          {formatTimeOnly(slot.startTime)} - {formatTimeOnly(slot.endTime)}
                        </span>
                        {isAvailable && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        {isBooked && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        {isBlocked && <span className="w-2 h-2 rounded-full bg-stone-400" />}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[11px]">
                        <span>
                          {isAvailable ? "ว่าง (พร้อมจอง)" : isBooked ? "มีนัดหมายแล้ว" : "ปิดรับจอง"}
                        </span>

                        {!isBooked && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleToggleSlotStatus(slot)}
                            className="h-6 px-1.5 text-[10px] text-clinic-ink hover:bg-black/5"
                          >
                            {isAvailable ? (
                              <span className="text-amber-800 flex items-center gap-0.5">
                                <Lock className="w-3 h-3" /> ปิด
                              </span>
                            ) : (
                              <span className="text-emerald-700 flex items-center gap-0.5">
                                <Unlock className="w-3 h-3" /> เปิด
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-clinic-ink-soft">
                ยังไม่มีสล็อตเวลาในตารางเวรนี้
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedSchedule(null)}
            >
              ปิดหน้าต่าง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
