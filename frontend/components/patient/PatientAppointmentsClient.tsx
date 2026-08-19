"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppointmentResponseDTO } from "@/lib/types";
import { CalendarIcon } from "@/components/site/icons";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            นัดหมายยืนยันแล้ว
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            ตรวจเสร็จสิ้น
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            ยกเลิกแล้ว
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            ไม่มาตามนัด
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-clinic-line rounded-card p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-bold text-clinic-primary-deep flex items-center gap-2">
            การนัดหมายของฉัน
          </h1>
          <p className="text-xs text-clinic-ink-soft mt-0.5">
            ตรวจสอบรายการนัดพบแพทย์แผนไทย ปรับปรุง หรือยกเลิกการนัดหมาย
          </p>
        </div>

        <Link
          href="/patient/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control font-semibold text-sm bg-clinic-primary hover:bg-clinic-primary-deep text-white transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <CalendarIcon width={18} height={18} />
          <span>+ จองคิวนัดหมายใหม่</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-clinic-line pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "upcoming"
              ? "border-clinic-primary text-clinic-primary"
              : "border-transparent text-clinic-ink-soft hover:text-clinic-ink"
          }`}
        >
          นัดหมายที่กำลังจะมาถึง ({upcomingList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-clinic-primary text-clinic-primary"
              : "border-transparent text-clinic-ink-soft hover:text-clinic-ink"
          }`}
        >
          ประวัตินัดหมายทั้งหมด ({appointments.length})
        </button>
      </div>

      {/* Appointment Cards List */}
      {displayList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((app) => {
            const startDate = new Date(app.slotStartTime);
            const endDate = new Date(app.slotEndTime);
            const canCancel = app.status === "SCHEDULED";

            return (
              <div
                key={app.appointmentId}
                className="bg-white border border-clinic-line rounded-card p-5 shadow-sm hover:border-clinic-primary/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-clinic-ink-soft font-medium">
                      รหัสนัดหมาย #{app.appointmentId}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="space-y-1">
                    <p className="font-display font-bold text-base text-clinic-primary-deep">
                      {startDate.toLocaleDateString("th-TH", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-clinic-ink">
                      เวลา:{" "}
                      <strong className="font-semibold">
                        {startDate.toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {endDate.toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        น.
                      </strong>
                    </p>
                    <p className="text-xs text-clinic-ink-soft">
                      แพทย์ผู้ตรวจ:{" "}
                      <span className="font-semibold text-clinic-ink">
                        {app.doctorFullname}
                      </span>
                    </p>
                  </div>
                </div>

                {canCancel && (
                  <div className="pt-3 border-t border-clinic-line flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCancelModalId(app.appointmentId)}
                      className="px-3.5 py-1.5 rounded-control text-xs font-semibold border border-clinic-danger/30 text-clinic-danger hover:bg-clinic-danger hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      ยกเลิกนัดหมาย
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-clinic-line rounded-card p-12 text-center text-clinic-ink-soft space-y-3">
          <div className="w-12 h-12 rounded-full bg-clinic-bg border border-clinic-line mx-auto flex items-center justify-center text-clinic-primary">
            <CalendarIcon width={24} height={24} />
          </div>
          <h3 className="font-bold text-base text-clinic-ink">
            {activeTab === "upcoming"
              ? "ไม่มีรายการนัดหมายที่กำลังจะมาถึง"
              : "ยังไม่มีประวัติการนัดหมาย"}
          </h3>
          <p className="text-xs text-clinic-ink-soft max-w-sm mx-auto">
            คุณสามารถจองคิวนัดตรวจกับแพทย์แผนไทยของพิมพ์วิมานคลินิกได้ล่วงหน้าผ่านระบบออนไลน์
          </p>
          <Link
            href="/patient/book"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-clinic-primary text-white text-xs font-semibold rounded-control hover:bg-clinic-primary-deep transition-colors mt-2"
          >
            + จองคิวออนไลน์ตอนนี้
          </Link>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-card border border-clinic-line max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-clinic-danger">
              <div className="w-10 h-10 rounded-full bg-clinic-danger-bg flex items-center justify-center font-bold text-lg">
                !
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-clinic-ink">
                  ยืนยันการยกเลิกนัดหมาย
                </h3>
                <p className="text-xs text-clinic-ink-soft">
                  รหัสนัดหมาย #{cancelModalId}
                </p>
              </div>
            </div>

            <p className="text-sm text-clinic-ink leading-relaxed">
              คุณต้องการยกเลิกการนัดหมายนี้ใช่หรือไม่? หลังจากยกเลิกแล้ว
              ช่องเวลานัดหมายจะเปิดให้ผู้ป่วยท่านอื่นสามารถจองได้
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalId(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-control text-xs font-semibold text-clinic-ink bg-clinic-bg border border-clinic-line hover:bg-slate-100 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isPending}
                className="px-4 py-2 rounded-control text-xs font-semibold text-white bg-clinic-danger hover:bg-red-700 transition-colors shadow-xs"
              >
                {isPending ? "กำลังยกเลิก…" : "ยืนยันยกเลิกนัด"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
