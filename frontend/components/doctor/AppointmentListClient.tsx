"use client";

import { useState } from "react";
import Link from "next/link";
import type { AppointmentResponseDTO, PageResponse, AppointmentStatus } from "@/lib/types";

interface AppointmentListClientProps {
  doctorId: number;
  initialData: PageResponse<AppointmentResponseDTO> | null;
}

export function AppointmentListClient({ doctorId, initialData }: AppointmentListClientProps) {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>(
    initialData?.content ?? []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AppointmentStatus>("ALL");
  const [selectedDate, setSelectedDate] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reload doctor's own appointments
  const refreshAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/appointments/doctor/${doctorId}?page=0&size=100`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถโหลดรายการนัดหมายได้");
      }
      const data: PageResponse<AppointmentResponseDTO> = await res.json();
      setAppointments(data.content ?? []);
    } catch (err: any) {
      setErrorMsg(err.message || "ไม่สามารถโหลดรายการนัดหมายได้");
    } finally {
      setLoading(false);
    }
  };

  // Complete appointment action
  const handleComplete = async (appointmentId: number) => {
    if (!confirm("ยืนยันการทำรายการ: เสร็จสิ้นการรักษา?")) return;
    try {
      setUpdatingId(appointmentId);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await fetch(`/api/appointments/${appointmentId}/complete`, { method: "PATCH" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถเปลี่ยนสถานะเป็นเสร็จสิ้นได้");
      }
      setSuccessMsg("บันทึกเสร็จสิ้นการรักษาเรียบร้อยแล้ว");
      refreshAppointments();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // No-show appointment action
  const handleNoShow = async (appointmentId: number) => {
    if (!confirm("ยืนยันระบุว่าผู้ป่วยไม่มาตามนัด?")) return;
    try {
      setUpdatingId(appointmentId);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await fetch(`/api/appointments/${appointmentId}/no-show`, { method: "PATCH" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถบันทึกสถานะไม่มาตามนัดได้");
      }
      setSuccessMsg("บันทึกสถานะผู้ป่วยไม่มาตามนัดเรียบร้อยแล้ว");
      refreshAppointments();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    // Only logged-in doctor's appointments
    if (app.doctorId && app.doctorId !== doctorId) {
      return false;
    }
    // Status filter
    if (statusFilter !== "ALL" && app.status !== statusFilter) {
      return false;
    }
    // Search query filter (Patient Name or Doctor Name)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchPatient = app.patientFullname?.toLowerCase().includes(q);
      const matchDoctor = app.doctorFullname?.toLowerCase().includes(q);
      const matchId = app.patientId?.toString().includes(q) || app.appointmentId?.toString().includes(q);
      if (!matchPatient && !matchDoctor && !matchId) return false;
    }
    // Date filter
    if (selectedDate !== "") {
      const slotDateStr = app.slotStartTime ? app.slotStartTime.split("T")[0] : "";
      if (slotDateStr !== selectedDate) return false;
    }
    return true;
  });

  // KPI Calculations (only for doctor's own appointments)
  const doctorAppointments = appointments.filter((a) => !a.doctorId || a.doctorId === doctorId);
  const totalCount = doctorAppointments.length;
  const scheduledCount = doctorAppointments.filter((a) => a.status === "SCHEDULED").length;
  const completedCount = doctorAppointments.filter((a) => a.status === "COMPLETED").length;
  const noShowCount = doctorAppointments.filter((a) => a.status === "NO_SHOW" || a.status === "CANCELLED").length;

  return (
    <div className="space-y-6 font-body text-clinic-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clinic-primary-deep flex items-center gap-2">
            <span>รายการนัดหมายของฉัน</span>
          </h1>
          <p className="text-sm text-clinic-ink-soft mt-1">
            ตรวจสอบตารางนัดหมายผู้ป่วยที่คุณรับผิดชอบ ปรับสถานะการรักษา และเข้าดูประวัติเวชระเบียน
          </p>
        </div>

        <button
          onClick={refreshAppointments}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-clinic-primary bg-clinic-bg hover:bg-clinic-primary hover:text-white border border-clinic-line transition-all shadow-xs cursor-pointer"
        >
          🔄 อัปเดตข้อมูล
        </button>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-2 cursor-pointer">
            ปิด
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-control bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline ml-2 cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            นัดหมายทั้งหมด
          </span>
          <div className="text-3xl font-bold text-clinic-primary-deep mt-1">{totalCount}</div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            รอดำเนินการ (Scheduled)
          </span>
          <div className="text-3xl font-bold text-blue-600 mt-1">{scheduledCount}</div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            เสร็จสิ้นการรักษา
          </span>
          <div className="text-3xl font-bold text-emerald-600 mt-1">{completedCount}</div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            ไม่มาตามนัด / ยกเลิก
          </span>
          <div className="text-3xl font-bold text-amber-600 mt-1">{noShowCount}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-card border border-clinic-line shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-clinic-ink-soft">
              🔍
            </span>
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ป่วย หรือรหัสผู้ป่วย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-clinic-line rounded-control text-sm text-clinic-ink focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
            />
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-clinic-ink-soft whitespace-nowrap">
              กรองตามวันที่:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="text-xs text-clinic-danger hover:underline cursor-pointer"
              >
                ล้างวันที่
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-t border-clinic-line/60 pt-3 overflow-x-auto">
          {[
            { key: "ALL", label: "ทั้งหมด", count: totalCount },
            { key: "SCHEDULED", label: "รอดำเนินการ", count: scheduledCount },
            { key: "COMPLETED", label: "เสร็จสิ้น", count: completedCount },
            { key: "NO_SHOW", label: "ไม่มาตามนัด", count: doctorAppointments.filter((a) => a.status === "NO_SHOW").length },
            { key: "CANCELLED", label: "ยกเลิกแล้ว", count: doctorAppointments.filter((a) => a.status === "CANCELLED").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-clinic-primary text-white shadow-xs"
                  : "bg-clinic-bg text-clinic-ink-soft hover:bg-clinic-line/50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List Table */}
      {loading ? (
        <div className="p-12 text-center text-clinic-ink-soft">กำลังโหลดรายการนัดหมาย...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="border border-dashed border-clinic-line rounded-card p-12 text-center text-clinic-ink-soft bg-white/50 space-y-2">
          <p className="text-base font-medium">ไม่พบรายการนัดหมายตรงตามเงื่อนไข</p>
          <p className="text-xs">ลองปรับการค้นหาหรือเลือกแท็บอื่น</p>
        </div>
      ) : (
        <div className="bg-white border border-clinic-line rounded-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-clinic-bg border-b border-clinic-line">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    ผู้ป่วย
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    วัน-เวลาที่นัดหมาย
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    สถานะนัดหมาย
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft text-right">
                    การจัดการ / ดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line">
                {filteredAppointments.map((app) => {
                  const isScheduled = app.status === "SCHEDULED";
                  const isCompleted = app.status === "COMPLETED";
                  const isNoShow = app.status === "NO_SHOW";
                  const isCancelled = app.status === "CANCELLED";

                  return (
                    <tr key={app.appointmentId} className="hover:bg-clinic-bg/40 transition-colors">
                      {/* Patient Info */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/doctor/patients/${app.patientId}`}
                          className="font-bold text-clinic-primary-deep hover:underline flex items-center gap-1.5"
                        >
                          <span>{app.patientFullname || `ผู้ป่วย #${app.patientId}`}</span>
                          <span className="text-[10px] font-mono font-normal text-clinic-ink-soft bg-clinic-bg px-1.5 py-0.5 rounded border border-clinic-line">
                            ID: {app.patientId}
                          </span>
                        </Link>
                      </td>

                      {/* Date & Time Slot */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-clinic-ink">
                          {formatDateThai(app.slotStartTime)}
                        </div>
                        <div className="text-xs font-mono text-clinic-ink-soft mt-0.5">
                          🕒 {formatTimeOnly(app.slotStartTime)} - {formatTimeOnly(app.slotEndTime)} น.
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        {isScheduled && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            นัดหมายแล้ว (Scheduled)
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ เสร็จสิ้นการรักษา
                          </span>
                        )}
                        {isNoShow && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            ✕ ไม่มาตามนัด (No-Show)
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            ยกเลิกนัดหมาย
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-2">
                        {isScheduled ? (
                          <>
                            <button
                              disabled={updatingId === app.appointmentId}
                              onClick={() => handleComplete(app.appointmentId)}
                              className="px-3 py-1.5 rounded-control text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                            >
                              ✓ เสร็จสิ้น
                            </button>
                            <button
                              disabled={updatingId === app.appointmentId}
                              onClick={() => handleNoShow(app.appointmentId)}
                              className="px-3 py-1.5 rounded-control text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors border border-amber-300 disabled:opacity-50 cursor-pointer"
                            >
                              ✕ ไม่มาตามนัด
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/doctor/patients/${app.patientId}`}
                            className="px-3 py-1.5 rounded-control text-xs font-semibold text-clinic-primary bg-clinic-bg hover:bg-clinic-primary hover:text-white transition-colors border border-clinic-line"
                          >
                            📄 ดูประวัติ
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
const THAI_WEEKDAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

function formatDateThai(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const cleanDate = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(cleanDate);
    if (isNaN(d.getTime())) return dateStr;

    const weekday = THAI_WEEKDAYS[d.getDay()];
    const day = d.getDate();
    const month = THAI_MONTHS[d.getMonth()];
    const year = d.getFullYear() + 543;

    return `${weekday} ${day} ${month} ${year}`;
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
