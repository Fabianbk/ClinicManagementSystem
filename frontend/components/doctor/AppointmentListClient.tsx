"use client";

import { useState } from "react";
import Link from "next/link";
import type { AppointmentResponseDTO, PageResponse, AppointmentStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, AppointmentStatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  UserX,
  RefreshCw,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";

interface AppointmentListClientProps {
  doctorId: number;
  initialData: PageResponse<AppointmentResponseDTO> | null;
}

function formatDateThai(dateStr?: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(startStr?: string, endStr?: string): string {
  if (!startStr) return "-";
  const s = new Date(startStr);
  const startFormatted = s.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (!endStr) return startFormatted;
  const e = new Date(endStr);
  const endFormatted = e.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${startFormatted} - ${endFormatted} น.`;
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
    if (app.doctorId && app.doctorId !== doctorId) {
      return false;
    }
    if (statusFilter !== "ALL" && app.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchPatient = app.patientFullname?.toLowerCase().includes(q);
      const matchDoctor = app.doctorFullname?.toLowerCase().includes(q);
      const matchId = app.patientId?.toString().includes(q) || app.appointmentId?.toString().includes(q);
      if (!matchPatient && !matchDoctor && !matchId) return false;
    }
    if (selectedDate !== "") {
      const slotDateStr = app.slotStartTime ? app.slotStartTime.split("T")[0] : "";
      if (slotDateStr !== selectedDate) return false;
    }
    return true;
  });

  // KPI Calculations
  const doctorAppointments = appointments.filter((a) => !a.doctorId || a.doctorId === doctorId);
  const totalCount = doctorAppointments.length;
  const scheduledCount = doctorAppointments.filter((a) => a.status === "SCHEDULED").length;
  const completedCount = doctorAppointments.filter((a) => a.status === "COMPLETED").length;
  const noShowCount = doctorAppointments.filter((a) => a.status === "NO_SHOW" || a.status === "CANCELLED").length;

  return (
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      <PageHeader
        icon={<Calendar className="w-5 h-5 text-clinic-primary" />}
        title="รายการนัดหมายตรวจรักษา (Appointments)"
        subtitle="ตรวจสอบคิวผู้ป่วย นัดหมายที่กำลังมาถึง และบันทึกผลการตรวจรักษา"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshAppointments}
            disabled={loading}
            className="gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>รีเฟรชข้อมูล</span>
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-clinic-ink-soft">นัดหมายทั้งหมด</p>
            <p className="text-2xl font-bold font-display text-clinic-primary-deep mt-1">
              {totalCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-clinic-primary">นัดหมายยืนยัน / รอตรวจ</p>
            <p className="text-2xl font-bold font-display text-clinic-primary mt-1">
              {scheduledCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-emerald-700">ตรวจเสร็จสิ้นแล้ว</p>
            <p className="text-2xl font-bold font-display text-emerald-800 mt-1">
              {completedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-rose-700">ยกเลิก / ไม่มาตามนัด</p>
            <p className="text-2xl font-bold font-display text-rose-800 mt-1">
              {noShowCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-clinic-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="ค้นหาชื่อผู้ป่วย, รหัส HN หรือรหัสนัดหมาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-44">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs"
            >
              <option value="ALL">ทุกสถานะนัดหมาย</option>
              <option value="SCHEDULED">ยืนยันแล้ว (SCHEDULED)</option>
              <option value="COMPLETED">เสร็จสิ้น (COMPLETED)</option>
              <option value="CANCELLED">ยกเลิก (CANCELLED)</option>
              <option value="NO_SHOW">ไม่มาตามนัด (NO_SHOW)</option>
            </Select>
          </div>

          {(searchQuery || selectedDate || statusFilter !== "ALL") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedDate("");
                setStatusFilter("ALL");
              }}
              className="text-xs text-clinic-ink-soft shrink-0"
            >
              ล้างตัวกรอง
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((app) => {
            const isUpdating = updatingId === app.appointmentId;
            const isScheduled = app.status === "SCHEDULED";

            return (
              <Card
                key={app.appointmentId}
                className="hover:border-clinic-primary/40 hover:shadow-sm transition-all"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <AppointmentStatusBadge status={app.status} />
                      <span className="text-xs font-mono text-clinic-ink-soft">
                        นัดหมาย #{app.appointmentId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-clinic-primary-deep">
                        {app.patientFullname || `ผู้ป่วยรหัส #${app.patientId}`}
                      </h3>
                      {app.patientId && (
                        <span className="text-xs font-mono text-clinic-ink-soft bg-clinic-bg px-2 py-0.5 rounded border border-clinic-line">
                          HN: P-{String(app.patientId).padStart(5, "0")}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-clinic-ink-soft">
                      <span className="flex items-center gap-1.5 font-medium text-clinic-ink">
                        <CalendarDays className="w-3.5 h-3.5 text-clinic-primary" />
                        {formatDateThai(app.slotStartTime)}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-clinic-ink">
                        <Clock className="w-3.5 h-3.5 text-clinic-terracotta" />
                        {formatTimeRange(app.slotStartTime, app.slotEndTime)}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-clinic-line">
                    {app.patientId && (
                      <Button asChild variant="outline" size="sm" className="text-xs gap-1">
                        <Link href={`/doctor/patients/${app.patientId}`}>
                          <User className="w-3.5 h-3.5" />
                          <span>ดูประวัติ</span>
                        </Link>
                      </Button>
                    )}

                    {isScheduled && (
                      <>
                        <Button
                          asChild
                          variant="terracotta"
                          size="sm"
                          className="text-xs gap-1 shadow-2xs font-semibold"
                        >
                          <Link
                            href={`/doctor/treatments/new?appointmentId=${app.appointmentId}&patientId=${app.patientId}`}
                          >
                            <FilePlus className="w-3.5 h-3.5" />
                            <span>บันทึกการรักษา</span>
                          </Link>
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleComplete(app.appointmentId)}
                          className="text-xs text-emerald-800 hover:bg-emerald-100"
                        >
                          เสร็จสิ้น
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleNoShow(app.appointmentId)}
                          className="text-xs text-rose-700 hover:bg-rose-50"
                        >
                          ไม่มาตามนัด
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-clinic-primary" />}
          title="ไม่พบรายการนัดหมายตามเงื่อนไขที่เลือก"
          description="ลองปรับตัวกรองวันที่หรือสถานะนัดหมายใหม่"
        />
      )}
    </div>
  );
}
