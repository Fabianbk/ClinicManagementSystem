import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPatient } from "@/lib/resources/patients";
import {
  getAppointmentsByPatientId,
  getUpcomingNotifications,
} from "@/lib/resources/appointments";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, AppointmentStatusBadge } from "@/components/ui/badge";
import {
  Calendar,
  Phone,
  CalendarPlus,
  FileText,
  User,
  HeartPulse,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { LeafIcon } from "@/components/site/icons";

export default async function PatientDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const patient = await getPatient(session.id).catch(() => null);
  if (!patient) {
    return (
      <div className="p-8 bg-white rounded-card border border-clinic-line shadow-xs text-center space-y-2">
        <h2 className="text-xl font-bold text-clinic-danger">ไม่พบข้อมูลผู้รับบริการ</h2>
        <p className="text-clinic-ink-soft text-xs">กรุณาติดต่อเจ้าหน้าที่คลินิกพิมพ์วิมาน</p>
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
    <div className="space-y-6 pb-16 font-body text-clinic-ink">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-card bg-gradient-to-br from-clinic-primary to-clinic-primary-deep text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="terracotta" className="bg-clinic-terracotta/30 text-clinic-terracotta-soft border-clinic-terracotta/40 px-3 py-1 text-xs gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ยินดีต้อนรับสู่ระบบบริการผู้ป่วยออนไลน์</span>
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              สวัสดีคุณ {patient.fullname}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/85 pt-1">
              <span className="px-2.5 py-1 rounded-control bg-white/10 font-mono">
                HN: P-{String(patient.patientId).padStart(5, "0")}
              </span>
              <span className="px-2.5 py-1 rounded-control bg-white/10 font-mono">
                โทร: {patient.mobileNumber}
              </span>
              <span className="px-2.5 py-1 rounded-control bg-white/10 font-medium">
                กรุ๊ปเลือด: {patient.bloodGroup || "-"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button asChild variant="terracotta" size="lg" className="shadow-md font-semibold">
              <Link href="/patient/book">
                <CalendarPlus className="w-4 h-4 mr-1.5" />
                <span>จองคิวนัดหมายใหม่</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Background decorative leaf */}
        <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none text-white">
          <LeafIcon width={240} height={240} />
        </div>
      </section>

      {/* Upcoming Appointment Highlight */}
      <Card>
        <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-clinic-primary" />
            <span>การนัดหมายครั้งถัดไปที่กำลังจะมาถึง</span>
          </CardTitle>
          <Link
            href="/patient/appointments"
            className="text-xs font-semibold text-clinic-primary hover:text-clinic-primary-deep hover:underline"
          >
            ดูการนัดหมายทั้งหมด →
          </Link>
        </CardHeader>

        <CardContent className="pt-4">
          {upcomingAppointment ? (
            <div className="bg-clinic-bg/60 rounded-control border border-clinic-line p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={upcomingAppointment.status} />
                  <span className="text-xs text-clinic-ink-soft">
                    รหัสนัดหมาย #{upcomingAppointment.appointmentId}
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold font-display text-clinic-primary-deep">
                  วัน{new Date(upcomingAppointment.slotStartTime).toLocaleDateString("th-TH", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-clinic-ink-soft">
                  เวลา:{" "}
                  <strong className="text-clinic-ink font-semibold font-mono">
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
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href="/patient/appointments">ดูรายละเอียดคิว</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-clinic-ink-soft space-y-2">
              <p className="text-xs">ท่านยังไม่มีรายการนัดหมายที่กำลังจะมาถึง</p>
              <Button asChild variant="ghost" size="sm" className="text-xs text-clinic-primary">
                <Link href="/patient/book">
                  <span>+ คลิกที่นี่เพื่อจองคิวนัดหมายล่วงหน้า</span>
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Action Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/patient/book"
          className="group bg-white p-5 rounded-card border border-clinic-line hover:border-clinic-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-control bg-clinic-terracotta-soft text-clinic-terracotta-deep flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarPlus className="w-5 h-5 text-clinic-terracotta" />
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
          <span className="text-xs font-semibold text-clinic-terracotta mt-4 flex items-center gap-1">
            จองคิวทันที →
          </span>
        </Link>

        <Link
          href="/patient/appointments"
          className="group bg-white p-5 rounded-card border border-clinic-line hover:border-clinic-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-clinic-primary-deep group-hover:text-clinic-primary transition-colors">
                นัดหมายของฉัน
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
            <div className="w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
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
          <span className="text-xs font-semibold text-clinic-primary mt-4 flex items-center gap-1">
            ดูประวัติการรักษา →
          </span>
        </Link>

        <Link
          href="/patient/profile"
          className="group bg-white p-5 rounded-card border border-clinic-line hover:border-clinic-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-control bg-clinic-terracotta-soft text-clinic-terracotta-deep flex items-center justify-center group-hover:scale-105 transition-transform">
              <User className="w-5 h-5 text-clinic-terracotta" />
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
          <span className="text-xs font-semibold text-clinic-terracotta mt-4 flex items-center gap-1">
            ดูโปรไฟล์ →
          </span>
        </Link>
      </section>

      {/* Two Columns: Health Snapshot & Recent Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Profile Snapshot */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-clinic-primary" />
              <span>ข้อมูลสุขภาพสำคัญ</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 space-y-3 text-xs">
            {/* Drug Allergy Banner */}
            <div>
              <span className="font-semibold text-clinic-ink-soft block mb-1">ประวัติการแพ้ยา</span>
              {patient.healthProfile?.drugAllergy &&
              patient.healthProfile.drugAllergy !== "ไม่มีประวัติแพ้ยา" &&
              patient.healthProfile.drugAllergy !== "ไม่ทราบประวัติแพ้ยา" ? (
                <div className="p-3 bg-clinic-danger-bg border border-clinic-danger/40 rounded-control text-clinic-danger font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{patient.healthProfile.drugAllergy}</span>
                </div>
              ) : (
                <Badge variant="success" className="gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{patient.healthProfile?.drugAllergy || "ไม่มีประวัติแพ้ยา"}</span>
                </Badge>
              )}
            </div>

            {/* General Health Snapshot */}
            <div className="bg-clinic-bg/50 rounded-control p-3.5 space-y-2 border border-clinic-line">
              <div className="flex justify-between">
                <span className="text-clinic-ink-soft">โรคประจำตัว:</span>
                <span className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.underlyingDisease || "ไม่มี"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinic-ink-soft">ธาตุเจ้าเรือนกำเนิด:</span>
                <span className="font-bold text-clinic-terracotta-deep text-right">
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

            <Link
              href="/patient/profile"
              className="block text-center text-xs font-semibold text-clinic-primary hover:underline pt-1"
            >
              ดูรายละเอียดประวัติสุขภาพฉบับเต็ม →
            </Link>
          </CardContent>
        </Card>

        {/* Right Column: Recent Treatments & Clinic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-clinic-primary" />
                <span>ประวัติการตรวจรักษาล่าสุด</span>
              </CardTitle>
              <Link
                href="/patient/treatments"
                className="text-xs font-semibold text-clinic-primary hover:text-clinic-primary-deep hover:underline"
              >
                ดูทั้งหมด →
              </Link>
            </CardHeader>

            <CardContent className="pt-4">
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
                      <p className="text-xs font-medium text-clinic-ink">
                        อาการ: {treatment.symptoms || "ตรวจสุขภาพทั่วไป"}
                      </p>
                      {treatment.ttmDiagnosis && (
                        <p className="text-xs text-clinic-primary font-semibold">
                          การวินิจฉัยแผนไทย: {treatment.ttmDiagnosis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-clinic-ink-soft text-xs">
                  ยังไม่มีประวัติการบันทึกการรักษา
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinic Contact Callout */}
          <div className="bg-clinic-primary-soft/50 border border-clinic-primary/20 rounded-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-sm text-clinic-primary-deep">
                พิมพ์วิมาน · คลินิกการแพทย์แผนไทย
              </h4>
              <p className="text-xs text-clinic-ink-soft">
                เปิดทำการทุกวันจันทร์ - เสาร์ เวลา 09:00 - 18:00 น. ตรวจ วินิจฉัย และจ่ายยาสมุนไพร
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="bg-white gap-1.5 shrink-0">
              <a href="tel:0951234567">
                <Phone className="w-3.5 h-3.5 text-clinic-terracotta" />
                <span>ติดต่อคลินิก</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
