import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPatient } from "@/lib/resources/patients";
import {
  getAppointmentsByPatientId,
  getUpcomingNotifications,
} from "@/lib/resources/appointments";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { LeafIcon, CalendarIcon, PhoneIcon } from "@/components/site/icons";

export default async function PatientDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const patient = await getPatient(session.id).catch(() => null);
  if (!patient) {
    return (
      <div className="p-8 bg-white rounded-card border border-clinic-line shadow-sm text-center">
        <h2 className="text-xl font-bold text-clinic-danger">ไม่พบข้อมูลผู้ป่วย</h2>
        <p className="text-clinic-ink-soft text-sm mt-1">กรุณาติดต่อเจ้าหน้าที่คลินิก</p>
      </div>
    );
  }

  const [upcomingNotifications, appointmentsData, treatmentsData] = await Promise.all([
    getUpcomingNotifications(session.id).catch(() => []),
    getAppointmentsByPatientId(session.id, 0, 5).catch(() => ({ content: [] })),
    getRecordTreatmentsByPatientId(session.id, 0, 3).catch(() => ({ content: [] })),
  ]);

  const upcomingAppointment = upcomingNotifications.length > 0 ? upcomingNotifications[0] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-card bg-gradient-to-br from-clinic-primary to-clinic-primary-deep text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-clinic-accent text-xs font-semibold backdrop-blur-xs border border-white/20">
              <span className="w-2 h-2 rounded-full bg-clinic-accent animate-pulse" />
              <span>ยินดีต้อนรับสู่ระบบผู้ป่วยออนไลน์</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              สวัสดีคุณ {patient.fullname}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-white/10 font-mono">
                HN: P-{String(patient.patientId).padStart(5, "0")}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 font-mono">
                โทร: {patient.mobileNumber}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 font-medium">
                กรุ๊ปเลือด: {patient.bloodGroup || "-"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/patient/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control font-semibold text-sm bg-clinic-accent hover:bg-clinic-accent-deep text-clinic-ink hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <CalendarIcon width={18} height={18} />
              <span>จองคิวนัดหมายใหม่</span>
            </Link>
          </div>
        </div>

        {/* Decorative background leaf */}
        <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none text-white">
          <LeafIcon width={240} height={240} />
        </div>
      </section>

      {/* Next Upcoming Appointment Highlight */}
      <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-clinic-primary/10 text-clinic-primary flex items-center justify-center">
              <CalendarIcon width={18} height={18} />
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep">
              การนัดหมายครั้งถัดไป
            </h2>
          </div>
          <Link
            href="/patient/appointments"
            className="text-xs font-semibold text-clinic-primary hover:text-clinic-primary-deep hover:underline"
          >
            ดูการนัดหมายทั้งหมด →
          </Link>
        </div>

        {upcomingAppointment ? (
          <div className="bg-clinic-bg rounded-control border border-clinic-line p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {upcomingAppointment.status === "SCHEDULED" ? "นัดหมายยืนยันแล้ว" : upcomingAppointment.status}
                </span>
                <span className="text-xs text-clinic-ink-soft">
                  รหัสนัดหมาย #{upcomingAppointment.appointmentId}
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-clinic-ink">
                วัน{new Date(upcomingAppointment.slotStartTime).toLocaleDateString("th-TH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-clinic-ink-soft">
                เวลา:{" "}
                <strong className="text-clinic-ink font-semibold">
                  {new Date(upcomingAppointment.slotStartTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(upcomingAppointment.slotEndTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  น.
                </strong>{" "}
                · แพทย์ผู้ตรวจ:{" "}
                <span className="text-clinic-primary-deep font-semibold">
                  {upcomingAppointment.doctorFullname}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/patient/appointments"
                className="px-4 py-2 bg-white border border-clinic-line hover:border-clinic-primary text-clinic-primary text-xs font-semibold rounded-control transition-all shadow-xs"
              >
                ดูรายละเอียด
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-clinic-ink-soft space-y-2">
            <p className="text-sm">ท่านยังไม่มีรายการนัดหมายที่กำลังจะมาถึง</p>
            <Link
              href="/patient/book"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-clinic-primary hover:underline"
            >
              คลิกที่นี่เพื่อจองคิวนัดหมายล่วงหน้า
            </Link>
          </div>
        )}
      </section>

      {/* Quick Action Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/patient/book"
          className="group bg-white p-5 rounded-card border border-clinic-line hover:border-clinic-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-clinic-accent/15 text-clinic-accent-deep flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarIcon width={22} height={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-clinic-primary-deep group-hover:text-clinic-primary transition-colors">
                จองคิวตรวจออนไลน์
              </h3>
              <p className="text-xs text-clinic-ink-soft mt-1 line-clamp-2">
                เลือกวัน เวลา และแพทย์แผนไทยที่ต้องการเข้ารับการรักษา
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-clinic-accent-deep mt-4 flex items-center gap-1">
            จองคิวทันที →
          </span>
        </Link>

        <Link
          href="/patient/appointments"
          className="group bg-white p-5 rounded-card border border-clinic-line hover:border-clinic-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-clinic-primary/10 text-clinic-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="2" />
                <path d="m9 14 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-clinic-primary-deep group-hover:text-clinic-primary transition-colors">
                รายการนัดหมายของฉัน
              </h3>
              <p className="text-xs text-clinic-ink-soft mt-1 line-clamp-2">
                ตรวจสอบสถานะนัดหมาย ปรับเปลี่ยน หรือยกเลิกคิวตรวจ
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-clinic-primary mt-4 flex items-center gap-1">
            ดูนัดหมาย ({appointmentsData?.content?.length || 0}) →
          </span>
        </Link>

        <Link
          href="/patient/treatments"
          className="group bg-white p-5 rounded-card border border-clinic-line hover:border-clinic-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LeafIcon width={22} height={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-clinic-primary-deep group-hover:text-clinic-primary transition-colors">
                ประวัติการรักษา & ยา
              </h3>
              <p className="text-xs text-clinic-ink-soft mt-1 line-clamp-2">
                ดูผลการตรวจรักษา ยาสมุนไพรที่ได้รับ และคำแนะนำจากแพทย์
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 mt-4 flex items-center gap-1">
            ดูประวัติการรักษา →
          </span>
        </Link>

        <Link
          href="/patient/profile"
          className="group bg-white p-5 rounded-card border border-clinic-line hover:border-clinic-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-clinic-primary-deep group-hover:text-clinic-primary transition-colors">
                ข้อมูลส่วนตัว & ประวัติสุขภาพ
              </h3>
              <p className="text-xs text-clinic-ink-soft mt-1 line-clamp-2">
                ข้อมูลทั่วไป ประวัติการแพ้ยา และผู้ติดต่อฉุกเฉิน
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 mt-4 flex items-center gap-1">
            ดูโปรไฟล์ →
          </span>
        </Link>
      </section>

      {/* Two Columns: Health Snapshot & Recent Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Profile Snapshot */}
        <section className="lg:col-span-1 bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <div className="w-7 h-7 rounded-md bg-clinic-bg text-clinic-primary flex items-center justify-center font-bold text-sm">
              ℹ
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep">
              ข้อมูลสุขภาพสำคัญ
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Drug Allergy Banner */}
            <div
              className={`p-3.5 rounded-control border ${
                patient.healthProfile?.drugAllergy &&
                patient.healthProfile.drugAllergy !== "ไม่มีประวัติแพ้ยา" &&
                patient.healthProfile.drugAllergy !== "ไม่ทราบประวัติแพ้ยา"
                  ? "bg-clinic-danger-bg border-clinic-danger text-clinic-danger font-semibold"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <p className="text-[11px] uppercase tracking-wider font-bold mb-0.5">
                ประวัติการแพ้ยา (Drug Allergy)
              </p>
              <p className="text-sm font-medium">
                {patient.healthProfile?.drugAllergy || "ไม่มีข้อมูลประวัติแพ้ยา"}
              </p>
            </div>

            {/* General Health Snapshot */}
            <div className="bg-clinic-bg rounded-control p-3.5 space-y-2 border border-clinic-line">
              <div className="flex justify-between">
                <span className="text-clinic-ink-soft">โรคประจำตัว:</span>
                <span className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.underlyingDisease || "ไม่มี"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinic-ink-soft">ธาตุเจ้าเรือนกำเนิด:</span>
                <span className="font-semibold text-clinic-primary-deep text-right">
                  {patient.principle?.principleDhatu || "รอตรวจประเมิน"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinic-ink-soft">ผู้ติดต่อฉุกเฉิน:</span>
                <span className="font-semibold text-clinic-ink text-right">
                  {patient.contactPersons && patient.contactPersons.length > 0
                    ? `${patient.contactPersons[0].contactName} (${patient.contactPersons[0].relationship || "ผู้ติดต่อ"})`
                    : "ไม่ได้ระบุ"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/patient/profile"
            className="block text-center text-xs font-semibold text-clinic-primary hover:underline pt-1"
          >
            ดูรายละเอียดประวัติสุขภาพฉบับเต็ม →
          </Link>
        </section>

        {/* Right Column: Recent Treatments & Clinic Info */}
        <section className="lg:col-span-2 space-y-6">
          {/* Recent Treatments */}
          <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-clinic-line pb-3 mb-4">
              <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
                <span>ประวัติการรับการรักษาล่าสุด</span>
              </h2>
              <Link
                href="/patient/treatments"
                className="text-xs font-semibold text-clinic-primary hover:text-clinic-primary-deep hover:underline"
              >
                ดูทั้งหมด →
              </Link>
            </div>

            {treatmentsData?.content && treatmentsData.content.length > 0 ? (
              <div className="divide-y divide-clinic-line">
                {treatmentsData.content.map((treatment) => (
                  <div key={treatment.recordTreatmentId} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-clinic-primary-deep">
                        {new Date(treatment.recordDate).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-clinic-ink-soft">แพทย์ผู้ตรวจ: {treatment.doctorFullname}</span>
                    </div>
                    <p className="text-sm font-medium text-clinic-ink">
                      อาการ: {treatment.symptoms || "ตรวจสุขภาพทั่วไป"}
                    </p>
                    {treatment.ttmDiagnosis && (
                      <p className="text-xs text-clinic-primary-deep">
                        การวินิจฉัยแผนไทย: {treatment.ttmDiagnosis}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-clinic-ink-soft text-sm">
                ยังไม่มีประวัติการบันทึกการรักษา
              </div>
            )}
          </div>

          {/* Clinic Information Card */}
          <div className="bg-clinic-primary/5 border border-clinic-primary/20 rounded-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-display font-bold text-sm text-clinic-primary-deep">
                พิมพ์วิมาน · คลินิกการแพทย์แผนไทย
              </h4>
              <p className="text-xs text-clinic-ink-soft">
                เปิดทำการทุกวัน เวลา 09:00 - 18:00 น. ให้บริการตรวจ วินิจฉัย และจ่ายยาสมุนไพร
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:0812345678"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-semibold bg-white border border-clinic-primary text-clinic-primary hover:bg-clinic-primary hover:text-white transition-all shadow-xs"
              >
                <PhoneIcon width={14} height={14} />
                <span>ติดต่อคลินิก</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
