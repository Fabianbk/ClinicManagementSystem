"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
import { DatePicker } from "@/components/ui/date-picker";
import type {
  PatientResponseDTO,
  WorkingScheduleResponseDTO,
  AppointmentSlotResponseDTO,
  PageResponse,
} from "@/lib/types";
import {
  Calendar,
  Clock,
  Search,
  User,
  Check,
  AlertCircle,
  Loader2,
  X,
  CalendarPlus,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface DoctorCreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  initialDate?: string;
  initialHour?: string;
  initialSlotId?: number;
  onSuccess: () => void;
}

function getTodayLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function matchesDate(dateInput: string | Date | undefined, targetDate: string): boolean {
  if (!dateInput || !targetDate) return false;
  if (typeof dateInput === "string") {
    // 1. Direct match or starts with targetDate (e.g. "2026-09-23T...")
    if (dateInput === targetDate || dateInput.startsWith(targetDate)) {
      return true;
    }
    // 2. Split on 'T'
    if (dateInput.split("T")[0] === targetDate) {
      return true;
    }
  }

  // 3. Date instance checking with local & UTC components
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      // Local calendar date
      const ly = d.getFullYear();
      const lm = String(d.getMonth() + 1).padStart(2, "0");
      const ld = String(d.getDate()).padStart(2, "0");
      if (`${ly}-${lm}-${ld}` === targetDate) {
        return true;
      }
      // UTC calendar date
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

export function DoctorCreateAppointmentModal({
  isOpen,
  onClose,
  doctorId,
  initialDate,
  initialHour,
  initialSlotId,
  onSuccess,
}: DoctorCreateAppointmentModalProps) {
  // Date State - default to today or initialDate if not in the past
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate && initialDate >= getTodayLocalDate()) {
      return initialDate;
    }
    return getTodayLocalDate();
  });

  // Patient Autocomplete State
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientResponseDTO[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientResponseDTO | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Doctor Schedule & Slots State
  const [schedule, setSchedule] = useState<WorkingScheduleResponseDTO | null>(null);
  const [slots, setSlots] = useState<AppointmentSlotResponseDTO[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [noScheduleForDate, setNoScheduleForDate] = useState(false);

  // Form Submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialDate && initialDate >= getTodayLocalDate()) {
        setSelectedDate(initialDate);
      } else {
        setSelectedDate(getTodayLocalDate());
      }
      if (initialSlotId) setSelectedSlotId(initialSlotId);
      setErrorMessage(null);
    } else {
      setSelectedPatient(null);
      setPatientQuery("");
      setPatientResults([]);
      setSelectedSlotId(null);
      setErrorMessage(null);
    }
  }, [isOpen, initialDate, initialSlotId]);

  // Search Patients with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!patientQuery.trim()) {
      setPatientResults([]);
      setIsLoadingPatients(false);
      return;
    }

    setIsLoadingPatients(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients?page=0&size=10&query=${encodeURIComponent(patientQuery.trim())}`);
        if (!res.ok) throw new Error("ค้นหาผู้ป่วยไม่สำเร็จ");
        const data: PageResponse<PatientResponseDTO> = await res.json();
        setPatientResults(data.content ?? []);
        setShowPatientDropdown(true);
      } catch (err) {
        console.error("Error searching patients:", err);
      } finally {
        setIsLoadingPatients(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [patientQuery]);

  // Fetch doctor working schedule & slots for selectedDate
  useEffect(() => {
    if (!isOpen || !selectedDate || !doctorId) return;

    let isMounted = true;
    const fetchScheduleAndSlots = async () => {
      try {
        setIsLoadingSlots(true);
        setNoScheduleForDate(false);
        setSlots([]);

        // 1. Fetch schedules of doctor
        const res = await fetch(`/api/working-schedules/doctor/${doctorId}`);
        if (!res.ok) throw new Error("ไม่สามารถโหลดตารางแพทย์ได้");
        const schedules: WorkingScheduleResponseDTO[] = await res.json();

        // 2. Find all schedules for selected date
        const matchedSchedules = (schedules || []).filter((s) => matchesDate(s.date, selectedDate));
        if (!isMounted) return;

        if (matchedSchedules.length === 0) {
          setSchedule(null);
          setNoScheduleForDate(true);
          setSelectedSlotId(null);
          return;
        }

        setSchedule(matchedSchedules[0]);

        // 3. Fetch slots for all schedules on this date
        const slotResponses = await Promise.all(
          matchedSchedules.map((ms) =>
            fetch(`/api/appointment-slots/schedule/${ms.scheduleId}`).then((r) =>
              r.ok ? r.json() : []
            )
          )
        );
        const slotData: AppointmentSlotResponseDTO[] = slotResponses.flat();
        slotData.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        if (!isMounted) return;
        setSlots(slotData);

        // Auto-select slot if initialHour or initialSlotId provided (only if AVAILABLE and NOT in the past)
        if (initialSlotId) {
          const found = slotData.find((s) => s.slotId === initialSlotId);
          const isPast = found ? new Date(found.startTime).getTime() <= Date.now() : false;
          if (found && found.status === "AVAILABLE" && !isPast) {
            setSelectedSlotId(found.slotId);
            return;
          }
        }

        if (initialHour) {
          const hourNum = parseInt(initialHour.split(":")[0], 10);
          const matchedHourSlot = slotData.find((s) => {
            const startH = new Date(s.startTime).getHours();
            const isPast = new Date(s.startTime).getTime() <= Date.now();
            return startH === hourNum && s.status === "AVAILABLE" && !isPast;
          });
          if (matchedHourSlot) {
            setSelectedSlotId(matchedHourSlot.slotId);
            return;
          }
        }

        // If currently selected slot is not valid in new slots or is past, reset
        if (selectedSlotId) {
          const cur = slotData.find((s) => s.slotId === selectedSlotId);
          const isPast = cur ? new Date(cur.startTime).getTime() <= Date.now() : false;
          if (!cur || cur.status !== "AVAILABLE" || isPast) {
            setSelectedSlotId(null);
          }
        }
      } catch (err: any) {
        console.error("Error loading doctor schedule/slots:", err);
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    };

    fetchScheduleAndSlots();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedDate, doctorId, initialHour, initialSlotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage("กรุณาค้นหาและเลือกผู้ป่วยที่ต้องการนัดหมาย");
      return;
    }

    if (selectedDate < getTodayLocalDate()) {
      setErrorMessage("ไม่สามารถเลือกวันที่ในอดีตได้ กรุณาเลือกวันปัจจุบันหรือในอนาคต");
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage("กรุณาเลือกช่วงเวลาตรวจ (Appointment Slot)");
      return;
    }

    const slotToBook = slots.find((s) => s.slotId === selectedSlotId);
    if (slotToBook && new Date(slotToBook.startTime).getTime() <= Date.now()) {
      setErrorMessage("ไม่สามารถเลือกช่วงเวลาตรวจในอดีตได้ กรุณาเลือกช่วงเวลาในอนาคต");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.patientId,
          slotId: selectedSlotId,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถสร้างการนัดหมายได้");
      }

      toast.success(
        `สร้างการนัดหมายสำหรับ ${selectedPatient.fullname} เรียบร้อยแล้ว`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการสร้างนัดหมาย");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSlot = slots.find((s) => s.slotId === selectedSlotId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-display font-bold text-clinic-primary-deep">
            <CalendarPlus className="w-5 h-5 text-clinic-primary" />
            <span>สร้างการนัดหมายตรวจรักษา (Doctor Booking)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-clinic-ink-soft">
            แพทย์สามารถนัดหมายเวลาตรวจให้กับผู้ป่วยได้โดยตรง โดยเลือกผู้ป่วยและช่วงเวลาในตารางตรวจ
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs hover:underline cursor-pointer"
            >
              ปิด
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
          {/* 1. Patient Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-clinic-ink flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-clinic-primary" />
              <span>1. ผู้ป่วยที่ต้องการนัดหมาย:</span>
              <span className="text-rose-500">*</span>
            </label>

            {selectedPatient ? (
              <div className="p-3 rounded-control bg-clinic-primary/5 border border-clinic-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-clinic-primary text-white flex items-center justify-center font-bold text-xs">
                    {selectedPatient.fullname.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-clinic-primary-deep text-xs">
                      {selectedPatient.fullname}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-clinic-ink-soft">
                      <span>HN: P-{String(selectedPatient.patientId).padStart(5, "0")}</span>
                      {selectedPatient.mobileNumber && <span>โทร: {selectedPatient.mobileNumber}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientQuery("");
                  }}
                  className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-7 px-2"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  <span>เปลี่ยน</span>
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-clinic-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="พิมพ์ชื่อ-นามสกุล, เลขประจำตัวประชาชน หรือ HN เพื่อค้นหาผู้ป่วย..."
                    value={patientQuery}
                    onChange={(e) => {
                      setPatientQuery(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="pl-9 pr-9 text-xs"
                  />
                  {isLoadingPatients && (
                    <Loader2 className="w-4 h-4 text-clinic-primary animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {showPatientDropdown && patientResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto bg-white border border-clinic-line rounded-control shadow-md divide-y divide-clinic-line">
                    {patientResults.map((p) => (
                      <div
                        key={p.patientId}
                        onClick={() => {
                          setSelectedPatient(p);
                          setShowPatientDropdown(false);
                          setPatientQuery("");
                        }}
                        className="p-2.5 hover:bg-clinic-primary-soft/10 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-clinic-ink text-xs">{p.fullname}</p>
                          <div className="flex items-center gap-2 text-[10px] text-clinic-ink-soft mt-0.5">
                            <span className="font-mono">HN: P-{String(p.patientId).padStart(5, "0")}</span>
                            {p.mobileNumber && <span>| โทร: {p.mobileNumber}</span>}
                            {p.nationalId && <span>| บัตร ปชช: {p.nationalId}</span>}
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="h-6 text-[10px] px-2">
                          เลือก
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {showPatientDropdown && patientQuery.trim() !== "" && !isLoadingPatients && patientResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 p-3 bg-white border border-clinic-line rounded-control shadow-md text-center text-clinic-ink-soft text-xs">
                    ไม่พบข้อมูลผู้ป่วยตามคำค้นหา &ldquo;{patientQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Date Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-clinic-ink flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-clinic-primary" />
              <span>2. วันที่ต้องการนัดตรวจ:</span>
              <span className="text-rose-500">*</span>
            </label>
            <DatePicker
              value={selectedDate}
              onChange={(val) => {
                if (val && val < getTodayLocalDate()) {
                  toast.error("ไม่สามารถเลือกวันที่ในอดีตได้");
                  return;
                }
                setSelectedDate(val);
              }}
              minDate={getTodayLocalDate()}
              className="text-xs"
            />
          </div>

          {/* 3. Slot Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-clinic-ink flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-clinic-terracotta" />
                <span>3. เลือกช่วงเวลาตรวจของแพทย์ (Appointment Slot):</span>
                <span className="text-rose-500">*</span>
              </label>
              {isLoadingSlots && (
                <span className="text-[11px] text-clinic-ink-soft flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> กำลังโหลดช่วงเวลา...
                </span>
              )}
            </div>

            {noScheduleForDate ? (
              <div className="p-3.5 rounded-control bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="font-bold text-xs">ยังไม่มีตารางเวลาปฏิบัติงานของแพทย์ในวันที่เลือก ({selectedDate})</p>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  ระบบกำหนดให้การนัดหมายต้องผูกกับช่วงเวลาตรวจในตารางปฏิบัติงานจริง กรุณากำหนดตารางเวลาปฏิบัติงานก่อนทำการนัดหมาย
                </p>
                <Link
                  href="/doctor/schedule"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-clinic-primary hover:bg-clinic-primary-deep text-white font-bold text-xs rounded-control transition-all shadow-2xs mt-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>ไปที่หน้ากำหนดตารางตรวจ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-h-48 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.slotId;
                  const isAvailable = slot.status === "AVAILABLE";
                  const isBooked = slot.status === "BOOKED";
                  const isBlocked = slot.status === "BLOCKED";
                  const isPastSlot = new Date(slot.startTime).getTime() <= Date.now();
                  const canSelect = isAvailable && !isPastSlot;

                  const startTimeStr = new Date(slot.startTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const endTimeStr = new Date(slot.endTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return (
                    <button
                      key={slot.slotId}
                      type="button"
                      disabled={!canSelect}
                      onClick={() => setSelectedSlotId(slot.slotId)}
                      className={`p-2 rounded-control border text-left text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-clinic-primary/10 border-clinic-primary ring-2 ring-clinic-primary/30 font-bold text-clinic-primary-deep shadow-2xs"
                          : !canSelect
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                          : "bg-white border-clinic-line hover:border-clinic-primary hover:bg-clinic-primary-soft/10 text-clinic-ink cursor-pointer"
                      }`}
                    >
                      <div className="font-mono text-[11px] font-semibold flex items-center justify-between">
                        <span>
                          {startTimeStr} - {endTimeStr}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-clinic-primary font-bold" />}
                      </div>
                      <span className="text-[9px] mt-0.5 font-medium">
                        {isBooked
                          ? "มีนัดแล้ว (BOOKED)"
                          : isBlocked
                          ? "ระงับ (BLOCKED)"
                          : isPastSlot
                          ? "เลยเวลาแล้ว (PAST)"
                          : "ว่าง (AVAILABLE)"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              !isLoadingSlots && (
                <p className="text-xs text-clinic-ink-soft italic p-2 border border-clinic-line rounded-control bg-clinic-bg text-center">
                  ไม่พบช่วงเวลาตรวจในตารางของแพทย์
                </p>
              )
            )}

            {/* Helper notice if all slots for selected date are passed or unavailable */}
            {slots.length > 0 &&
              slots.every(
                (s) => s.status !== "AVAILABLE" || new Date(s.startTime).getTime() <= Date.now()
              ) && (
                <div className="p-2.5 rounded-control bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>ช่วงเวลาตรวจของวันนี้ผ่านไปแล้วหรือถูกจองเต็มทั้งหมด กรุณาเลือกวันที่อื่น</span>
                </div>
              )}
          </div>

          {/* Summary Details */}
          {selectedPatient && selectedSlot && (
            <div className="p-3 rounded-control bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <span className="font-bold text-clinic-ink">สรุปรายการนัดหมาย:</span>
              <p className="text-clinic-ink-soft">
                ผู้ป่วย: <span className="font-semibold text-clinic-ink">{selectedPatient.fullname}</span>
                {" | "}วันที่: <span className="font-semibold text-clinic-ink">{selectedDate}</span>
                {" | "}เวลา:{" "}
                <span className="font-mono font-semibold text-clinic-primary">
                  {new Date(selectedSlot.startTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  -{" "}
                  {new Date(selectedSlot.endTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  น.
                </span>
              </p>
            </div>
          )}

          <DialogFooter className="border-t border-clinic-line pt-3 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                submitting ||
                !selectedPatient ||
                !selectedSlotId ||
                !selectedSlot ||
                new Date(selectedSlot.startTime).getTime() <= Date.now()
              }
              className="text-xs bg-clinic-primary hover:bg-clinic-primary-deep text-white font-bold gap-1.5 shadow-2xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>ยืนยันการนัดหมาย</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
