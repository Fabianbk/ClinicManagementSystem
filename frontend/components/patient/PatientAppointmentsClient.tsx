"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppointmentResponseDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, AppointmentStatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  Calendar,
  CalendarPlus,
  Clock,
  User,
  AlertTriangle,
  CalendarDays,
  XCircle,
} from "lucide-react";

export function PatientAppointmentsClient({
  initialAppointments,
  patientId,
}: {
  initialAppointments: AppointmentResponseDTO[];
  patientId: number;
}) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>(initialAppointments);
  const [activeTab, setActiveTab] = useState<"upcoming" | "all">("upcoming");
  const [cancelModalId, setCancelModalId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const now = new Date().getTime();

  // Categorize appointments
  const upcomingList = appointments.filter((app) => {
    const isFuture = new Date(app.slotEndTime).getTime() >= now;
    return app.status === "SCHEDULED" && isFuture;
  });

  const displayList = activeTab === "upcoming" ? upcomingList : appointments;

  async function handleConfirmCancel() {
    if (!cancelModalId) return;
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/appointments/${cancelModalId}/cancel`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setErrorMessage(err?.message || "ไม่สามารถยกเลิกการนัดหมายได้");
        return;
      }

      setAppointments((prev) =>
        prev.map((app) =>
          app.appointmentId === cancelModalId ? { ...app, status: "CANCELLED" } : app
        )
      );

      setCancelModalId(null);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  }

  return (
    <div className="space-y-6 pb-16 font-body text-clinic-ink">
      {/* Top Header */}
      <PageHeader
        icon={<Calendar className="w-5 h-5 text-clinic-primary" />}
        title="รายการนัดหมายของฉัน (My Appointments)"
        subtitle="ตรวจสอบวัน เวลา สถานะการนัดหมาย และแพทย์แผนไทยผู้ตรวจรักษา"
        actions={
          <Button asChild variant="terracotta" size="sm" className="gap-1.5 shadow-xs">
            <Link href="/patient/book">
              <CalendarPlus className="w-4 h-4" />
              <span>+ จองคิวตรวจใหม่</span>
            </Link>
          </Button>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
        <Button
          type="button"
          variant={activeTab === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("upcoming")}
          className="h-8 text-xs"
        >
          นัดหมายที่กำลังมาถึง ({upcomingList.length})
        </Button>
        <Button
          type="button"
          variant={activeTab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className="h-8 text-xs"
        >
          ประวัตินัดหมายทั้งหมด ({appointments.length})
        </Button>
      </div>

      {/* Appointments List */}
      {displayList.length > 0 ? (
        <div className="space-y-4">
          {displayList.map((app) => {
            const isFuture = new Date(app.slotEndTime).getTime() >= now;
            const canCancel = app.status === "SCHEDULED" && isFuture;

            return (
              <Card
                key={app.appointmentId}
                className="hover:border-clinic-primary/40 hover:shadow-sm transition-all"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <AppointmentStatusBadge status={app.status} />
                      <span className="text-xs font-mono text-clinic-ink-soft">
                        รหัสนัดหมาย #{app.appointmentId}
                      </span>
                    </div>

                    <p className="text-base font-bold font-display text-clinic-primary-deep">
                      วัน{new Date(app.slotStartTime).toLocaleDateString("th-TH", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-clinic-ink-soft">
                      <span className="flex items-center gap-1.5 font-mono font-medium text-clinic-ink">
                        <Clock className="w-3.5 h-3.5 text-clinic-terracotta" />
                        {new Date(app.slotStartTime).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(app.slotEndTime).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        น.
                      </span>

                      <span className="flex items-center gap-1.5 text-clinic-ink">
                        <User className="w-3.5 h-3.5 text-clinic-primary" />
                        <span>แพทย์ผู้ตรวจ:</span>
                        <strong className="text-clinic-primary-deep font-semibold">
                          {app.doctorFullname}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {canCancel && (
                    <div className="flex items-center justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-clinic-line">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelModalId(app.appointmentId)}
                        className="text-xs text-clinic-danger hover:bg-clinic-danger-bg gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ยกเลิกนัดหมาย</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-clinic-primary" />}
          title={
            activeTab === "upcoming"
              ? "ไม่มีรายการนัดหมายที่กำลังจะมาถึง"
              : "ยังไม่มีประวัติการนัดหมาย"
          }
          description="ท่านสามารถเลือกวัน เวลา และแพทย์แผนไทยที่ต้องการตรวจเพื่อจองคิวล่วงหน้าได้ทันที"
          action={
            <Button asChild variant="terracotta" size="sm">
              <Link href="/patient/book">
                <CalendarPlus className="w-4 h-4 mr-1.5" />
                <span>+ จองคิวนัดหมายออนไลน์</span>
              </Link>
            </Button>
          }
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelModalId} onOpenChange={(open) => !open && setCancelModalId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-clinic-danger flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>ยืนยันการยกเลิกนัดหมาย?</span>
            </DialogTitle>
            <DialogDescription>
              การยกเลิกจะมีผลทันที และสล็อตเวลาจะถูกเปิดให้ผู้รับบริการท่านอื่นจองคิวแทน
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs rounded-control">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelModalId(null)}
              disabled={isPending}
            >
              ย้อนกลับ
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmCancel}
              disabled={isPending}
            >
              {isPending ? "กำลังยกเลิก..." : "ยืนยันยกเลิกนัด"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
