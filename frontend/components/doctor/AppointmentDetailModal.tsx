"use client";

import { useState } from "react";
import Link from "next/link";
import type { AppointmentResponseDTO } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppointmentStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  FilePlus,
  CheckCircle2,
  UserX,
  XCircle,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AppointmentDetailModalProps {
  appointment: AppointmentResponseDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

function formatDateThai(dateStr?: string | Date): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeRange(startStr?: string | Date, endStr?: string | Date): string {
  if (!startStr) return "-";
  const s = new Date(startStr);
  const startFormatted = s.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (!endStr) return `${startFormatted} น.`;
  const e = new Date(endStr);
  const endFormatted = e.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${startFormatted} - ${endFormatted} น.`;
}

export function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  onStatusUpdated,
}: AppointmentDetailModalProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!appointment) return null;

  const isScheduled = appointment.status === "SCHEDULED";

  const handleAction = async (action: "complete" | "no-show" | "cancel") => {
    let confirmMsg = "";
    if (action === "complete") confirmMsg = "ยืนยันการทำรายการ: เสร็จสิ้นการรักษา?";
    if (action === "no-show") confirmMsg = "ยืนยันระบุว่าผู้ป่วยไม่มาตามนัด?";
    if (action === "cancel") confirmMsg = "ยืนยันการยกเลิกนัดหมายนี้?";

    if (!confirm(confirmMsg)) return;

    try {
      setLoadingAction(action);
      let endpoint = "";
      if (action === "complete") endpoint = `/api/appointments/${appointment.appointmentId}/complete`;
      if (action === "no-show") endpoint = `/api/appointments/${appointment.appointmentId}/no-show`;
      if (action === "cancel") endpoint = `/api/appointments/${appointment.appointmentId}/cancel`;

      const res = await fetch(endpoint, { method: "PATCH" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถทำรายการได้");
      }

      toast.success(
        action === "complete"
          ? "บันทึกเสร็จสิ้นการตรวจเรียบร้อยแล้ว"
          : action === "no-show"
          ? "บันทึกสถานะไม่มาตามนัดเรียบร้อยแล้ว"
          : "ยกเลิกนัดหมายเรียบร้อยแล้ว"
      );

      onStatusUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการทำรายการ");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-display font-bold text-clinic-primary-deep flex items-center gap-2">
              <Calendar className="w-4 h-4 text-clinic-primary" />
              <span>รายละเอียดการนัดหมาย</span>
            </DialogTitle>
            <span className="text-xs font-mono text-clinic-ink-soft">
              #{appointment.appointmentId}
            </span>
          </div>
          <DialogDescription className="text-xs text-clinic-ink-soft">
            ข้อมูลการนัดหมายตรวจรักษาและตัวเลือกการจัดการ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-3 rounded-control bg-clinic-bg border border-clinic-line">
            <span className="font-semibold text-clinic-ink">สถานะนัดหมาย:</span>
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          {/* Patient Card */}
          <div className="p-3.5 rounded-control bg-clinic-primary-soft/10 border border-clinic-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clinic-primary text-white flex items-center justify-center font-bold text-xs">
                  {appointment.patientFullname ? appointment.patientFullname.charAt(0) : "P"}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-clinic-primary-deep">
                    {appointment.patientFullname || `ผู้ป่วยรหัส #${appointment.patientId}`}
                  </h4>
                  {appointment.patientId && (
                    <span className="text-[11px] font-mono text-clinic-ink-soft">
                      HN: P-{String(appointment.patientId).padStart(5, "0")}
                    </span>
                  )}
                </div>
              </div>

              {appointment.patientId && (
                <Button asChild variant="outline" size="sm" className="text-xs h-7 gap-1">
                  <Link href={`/doctor/patients/${appointment.patientId}`}>
                    <span>ประวัติผู้ป่วย</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Appointment Schedule Details */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-control border border-clinic-line bg-white">
            <div className="space-y-1">
              <span className="text-[11px] text-clinic-ink-soft font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-clinic-primary" /> วันที่นัดหมาย
              </span>
              <p className="font-semibold text-clinic-ink">
                {formatDateThai(appointment.slotStartTime)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-clinic-ink-soft font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-clinic-terracotta" /> เวลาตรวจ
              </span>
              <p className="font-mono font-semibold text-clinic-ink">
                {formatTimeRange(appointment.slotStartTime, appointment.slotEndTime)}
              </p>
            </div>
          </div>

          {/* Quick Workflow Action */}
          {isScheduled && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-clinic-ink-soft uppercase tracking-wider">
                การดำเนินการตรวจรักษา
              </p>

              <Button
                asChild
                variant="terracotta"
                className="w-full justify-center gap-2 shadow-2xs font-bold text-xs"
              >
                <Link
                  href={`/doctor/treatments/new?appointmentId=${appointment.appointmentId}&patientId=${appointment.patientId}`}
                >
                  <FilePlus className="w-4 h-4" />
                  <span>บันทึกการรักษา (Record Treatment)</span>
                </Link>
              </Button>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!!loadingAction}
                  onClick={() => handleAction("complete")}
                  className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                >
                  {loadingAction === "complete" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  )}
                  <span>เสร็จสิ้น</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!!loadingAction}
                  onClick={() => handleAction("no-show")}
                  className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
                >
                  {loadingAction === "no-show" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserX className="w-3.5 h-3.5 mr-1" />
                  )}
                  <span>ไม่มาตามนัด</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!!loadingAction}
                  onClick={() => handleAction("cancel")}
                  className="text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
                >
                  {loadingAction === "cancel" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                  )}
                  <span>ยกเลิก</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-clinic-line pt-3 sm:justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
