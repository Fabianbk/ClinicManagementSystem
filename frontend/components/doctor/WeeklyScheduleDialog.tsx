"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import {
  CalendarDays,
  Clock,
  Coffee,
  Sparkles,
  AlertCircle,
  Check,
  CalendarCheck,
} from "lucide-react";
import {
  getMondayOfWeek,
  getWeekDaysMonToSat,
  calculateSlotsForDay,
  formatLocalDateStr,
} from "@/lib/utils/schedule-generator";
import type {
  WeeklyBatchRequestBody,
  WeeklyBatchResponse,
} from "@/app/api/working-schedules/weekly-batch/route";

interface WeeklyScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: number;
  onSuccess: (response: WeeklyBatchResponse) => void;
}

export function WeeklyScheduleDialog({
  open,
  onOpenChange,
  doctorId,
  onSuccess,
}: WeeklyScheduleDialogProps) {
  // 1. Initial Monday date (default to this week's Monday)
  const initialMonday = useMemo(() => {
    return getMondayOfWeek(new Date());
  }, []);

  const [selectedMonday, setSelectedMonday] = useState(initialMonday);

  // 2. Compute 6 days (Mon-Sat) for this Monday
  const weekDays = useMemo(() => {
    return getWeekDaysMonToSat(selectedMonday);
  }, [selectedMonday]);

  // 3. Selected date strings (all 6 days checked by default)
  const [selectedDates, setSelectedDates] = useState<string[]>(() =>
    getWeekDaysMonToSat(initialMonday).map((d) => d.dateStr)
  );

  // 4. Shift & Slot settings
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("19:00");
  const slotMinutes = 60; // 1 hour fixed standard
  const [hasLunchBreak, setHasLunchBreak] = useState(true);
  const lunchStart = "12:00";
  const lunchEnd = "13:00";

  // 5. Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle changing week picker: auto-snap to Monday
  const handleDateChange = (inputVal: string) => {
    if (!inputVal) return;
    const monday = getMondayOfWeek(inputVal);
    setSelectedMonday(monday);
    // Refresh selected days to include all 6 days of the new week
    const newDays = getWeekDaysMonToSat(monday);
    setSelectedDates(newDays.map((d) => d.dateStr));
    setErrorMsg(null);
  };

  // Quick buttons: This week & Next week
  const setThisWeek = () => {
    handleDateChange(formatLocalDateStr(new Date()));
  };

  const setNextWeek = () => {
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    handleDateChange(formatLocalDateStr(nextWeekDate));
  };

  // Toggle individual day checkbox
  const toggleDay = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const selectAllDays = () => {
    setSelectedDates(weekDays.map((d) => d.dateStr));
  };

  const deselectAllDays = () => {
    setSelectedDates([]);
  };

  // Live preview calculation for slots in 1 representative day
  const sampleDaySlots = useMemo(() => {
    if (!selectedMonday) return [];
    return calculateSlotsForDay({
      dateStr: selectedMonday,
      shiftStartTime,
      shiftEndTime,
      slotMinutes,
      hasLunchBreak,
      lunchStart,
      lunchEnd,
    });
  }, [selectedMonday, shiftStartTime, shiftEndTime, hasLunchBreak]);

  const totalEstimatedSlots = sampleDaySlots.length * selectedDates.length;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedDates.length === 0) {
      setErrorMsg("กรุณาเลือกวันทำการอย่างน้อย 1 วัน");
      return;
    }

    if (!shiftStartTime || !shiftEndTime) {
      setErrorMsg("กรุณาระบุเวลาเริ่มต้นและเวลาสิ้นสุด");
      return;
    }

    if (shiftEndTime <= shiftStartTime) {
      setErrorMsg("เวลาสิ้นสุดการตรวจต้องมากกว่าเวลาเริ่มต้น");
      return;
    }

    try {
      setSubmitting(true);

      const payload: WeeklyBatchRequestBody = {
        doctorId,
        dates: selectedDates,
        shiftStartTime,
        shiftEndTime,
        slotMinutes,
        hasLunchBreak,
        lunchStart,
        lunchEnd,
      };

      const res = await fetch("/api/working-schedules/weekly-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: WeeklyBatchResponse = await res.json();

      if (!res.ok) {
        throw new Error((data as any).message || "เกิดข้อผิดพลาดในการสร้างตารางเวรรายสัปดาห์");
      }

      toast.success("สร้างตารางเวรรายสัปดาห์เรียบร้อยแล้ว");
      onSuccess(data);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "ไม่สามารถสร้างตารางเวรรายสัปดาห์ได้");
      setErrorMsg(err.message || "ไม่สามารถสร้างตารางเวรรายสัปดาห์ได้");
    } finally {
      setSubmitting(false);
    }
  };

  const mondayFormatted = weekDays[0]?.formattedThai ?? "";
  const saturdayFormatted = weekDays[5]?.formattedThai ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-clinic-primary">
            <CalendarDays className="w-5 h-5 text-clinic-primary" />
            <DialogTitle className="text-lg font-bold text-clinic-primary-deep">
              จัดตารางเวรรายสัปดาห์ (จันทร์ - เสาร์)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-clinic-ink-soft">
            ระบบจะสร้างตารางเวรล่วงหน้า 6 วัน พร้อมสร้างสล็อตตรวจ 1 ชั่วโมง (60 นาที) อัตโนมัติในคลิกเดียว
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Section 1: Week Selector */}
          <div className="p-3.5 bg-clinic-bg rounded-control border border-clinic-line space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="weekInput" className="text-xs font-semibold text-clinic-ink">
                เลือกสัปดาห์ที่ต้องการจัดตาราง
              </Label>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setThisWeek}
                  className="h-6 px-2 text-[11px]"
                >
                  สัปดาห์นี้
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setNextWeek}
                  className="h-6 px-2 text-[11px]"
                >
                  สัปดาห์หน้า
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
              <DatePicker
                value={selectedMonday}
                onChange={(val) => handleDateChange(val)}
                placeholder="เลือกวันในสัปดาห์"
              />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-clinic-line text-xs">
                <span className="text-clinic-ink-soft">สัปดาห์:</span>
                <Badge variant="outline" className="text-[11px] font-semibold text-clinic-primary border-clinic-primary/30 bg-clinic-primary/5">
                  {mondayFormatted} – {saturdayFormatted}
                </Badge>
              </div>
            </div>
            <p className="text-[10px] text-clinic-ink-soft">
              * เลือกวันที่ใดๆ ในปฏิทิน ระบบจะคำนวณหาวันจันทร์ของสัปดาห์นั้นโดยอัตโนมัติ (เว้นวันอาทิตย์)
            </p>
          </div>

          {/* Section 2: Days of the Week Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-clinic-ink">
                เลือกวันทำการตรวจ ({selectedDates.length}/6 วัน)
              </Label>
              <div className="flex items-center gap-2 text-[11px] text-clinic-primary">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="hover:underline font-medium cursor-pointer"
                >
                  เลือกทั้งหมด
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={deselectAllDays}
                  className="hover:underline font-medium text-clinic-ink-soft cursor-pointer"
                >
                  ล้างทั้งหมด
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {weekDays.map((day) => {
                const isChecked = selectedDates.includes(day.dateStr);
                return (
                  <button
                    type="button"
                    key={day.dateStr}
                    onClick={() => toggleDay(day.dateStr)}
                    className={`p-2.5 rounded-control border text-left flex items-center justify-between transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-clinic-primary/5 border-clinic-primary ring-1 ring-clinic-primary/20 text-clinic-primary-deep shadow-xs"
                        : "bg-white border-clinic-line text-clinic-ink-soft hover:border-clinic-line-strong hover:bg-clinic-bg/50"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>วัน{day.dayName}</span>
                      </div>
                      <div className="text-[10px] text-clinic-ink-soft mt-0.5">
                        {day.dateStr}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isChecked
                          ? "bg-clinic-primary border-clinic-primary text-white"
                          : "border-clinic-line bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Time & Slot Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="weeklyShiftStart" className="text-xs font-semibold text-clinic-ink" required>
                เวลาเริ่มตรวจ (ทุกวัน)
              </Label>
              <Input
                id="weeklyShiftStart"
                type="time"
                required
                value={shiftStartTime}
                onChange={(e) => setShiftStartTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weeklyShiftEnd" className="text-xs font-semibold text-clinic-ink" required>
                เวลาสิ้นสุดการตรวจ (ทุกวัน)
              </Label>
              <Input
                id="weeklyShiftEnd"
                type="time"
                required
                value={shiftEndTime}
                onChange={(e) => setShiftEndTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Slot Size & Lunch Break */}
          <div className="p-3 bg-clinic-bg rounded-control border border-clinic-line space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-clinic-primary" />
                <span className="text-xs font-semibold text-clinic-ink">
                  ขนาดสล็อตตรวจมาตรฐาน:
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-bold text-clinic-primary border-clinic-primary/30 bg-white">
                60 นาที (1 ชั่วโมง)
              </Badge>
            </div>

            <div className="pt-2 border-t border-clinic-line">
              <label className="flex items-center gap-2 text-xs font-semibold text-clinic-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasLunchBreak}
                  onChange={(e) => setHasLunchBreak(e.target.checked)}
                  className="rounded text-clinic-primary focus:ring-clinic-primary w-4 h-4"
                />
                <Coffee className="w-4 h-4 text-clinic-terracotta" />
                <span>เว้นช่วงพักเที่ยง (12:00 - 13:00 น.) ไม่สร้างสล็อต</span>
              </label>
              <p className="text-[10px] text-clinic-ink-soft pl-6 mt-0.5">
                ช่วงเช้า 3 สล็อต (09:00 - 12:00) และช่วงบ่ายถึงค่ำ 6 สล็อต (13:00 - 19:00)
              </p>
            </div>
          </div>

          {/* Section 4: Live Preview Summary */}
          <div className="p-3 rounded-control bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>สรุปการสร้างสล็อตอัตโนมัติ</span>
            </div>
            <div className="text-xs text-emerald-700 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
              <span>
                วันละ <strong>{sampleDaySlots.length} สล็อต</strong> (1 ชม./สล็อต)
              </span>
              <span>•</span>
              <span>
                เลือก <strong>{selectedDates.length} วัน</strong>
              </span>
              <span>•</span>
              <span className="font-bold text-emerald-900">
                รวมประมาณ {totalEstimatedSlots} สล็อต
              </span>
            </div>
            <p className="text-[10px] text-emerald-600/90 pt-1">
              ✓ หากวันใดมีตารางเวรเดิมอยู่แล้ว หรือเวลาผ่านไปแล้ว ระบบจะข้ามวันนั้นโดยอัตโนมัติ ไม่กระทบคิวเดิม
            </p>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={submitting || selectedDates.length === 0}
              className="text-xs bg-clinic-primary hover:bg-clinic-primary-deep text-white font-medium flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังสร้างตารางเวร...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>สร้างตารางเวร {selectedDates.length} วัน</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
