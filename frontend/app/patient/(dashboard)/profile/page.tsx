import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPatient } from "@/lib/resources/patients";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  User,
  Heart,
  Phone,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  MapPin,
  CreditCard,
} from "lucide-react";

export default async function PatientProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const [patient, treatmentsData] = await Promise.all([
    getPatient(session.id).catch(() => null),
    getRecordTreatmentsByPatientId(session.id, 0, 10).catch(() => ({ content: [] })),
  ]);

  const latestHealthProfile = treatmentsData?.content?.find((t) => t.healthProfile)?.healthProfile;
  if (!patient) {
    return (
      <div className="p-8 bg-white rounded-card border border-clinic-line shadow-xs text-center space-y-2">
        <h2 className="text-xl font-bold text-clinic-danger">ไม่พบข้อมูลโปรไฟล์</h2>
        <p className="text-clinic-ink-soft text-xs">กรุณาติดต่อเจ้าหน้าที่คลินิกพิมพ์วิมาน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 font-body text-clinic-ink">
      {/* Header */}
      <PageHeader
        icon={<User className="w-5 h-5 text-clinic-primary" />}
        title="ข้อมูลส่วนตัวและประวัติสุขภาพ (Patient Profile)"
        subtitle={`HN: P-${String(patient.patientId).padStart(5, "0")} · ข้อมูลเวชระเบียนผู้รับบริการและประวัติสุขภาพ`}
        badge={
          <Badge variant="terracotta" className="text-xs">
            HN: P-{String(patient.patientId).padStart(5, "0")}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-clinic-bg border border-clinic-line text-xs font-mono text-clinic-ink">
            <span>เบอร์ติดต่อ: {patient.mobileNumber || "-"}</span>
          </div>
        }
      />

      {/* Grid: 3 Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Information */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-clinic-primary" />
              <span>ข้อมูลทั่วไป (General Info)</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <dl className="divide-y divide-clinic-line text-xs">
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">ชื่อ-นามสกุล</dt>
                <dd className="font-semibold text-clinic-ink text-right">{patient.fullname}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">เพศ</dt>
                <dd className="font-semibold text-clinic-ink">
                  {patient.gender === "MALE" ? "ชาย" : patient.gender === "FEMALE" ? "หญิง" : patient.gender || "-"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">วันเกิด</dt>
                <dd className="font-semibold text-clinic-ink">
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString("th-TH")
                    : "-"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">กรุ๊ปเลือด</dt>
                <dd className="font-semibold text-clinic-primary-deep">{patient.bloodGroup || "-"}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">อาชีพ</dt>
                <dd className="font-semibold text-clinic-ink">{patient.occupation || "-"}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">สถานภาพ</dt>
                <dd className="font-semibold text-clinic-ink">
                  {patient.maritalStatus === "SINGLE"
                    ? "โสด"
                    : patient.maritalStatus === "IN_RELATIONSHIP"
                    ? "มีคู่ / อยู่ด้วยกัน"
                    : patient.maritalStatus === "MARRIED"
                    ? "สมรส"
                    : patient.maritalStatus === "WIDOWED"
                    ? "หม้าย"
                    : patient.maritalStatus === "SEPARATED"
                    ? "แยกกันอยู่"
                    : patient.maritalStatus === "DIVORCED"
                    ? "หย่า"
                    : patient.maritalStatus === "MONK"
                    ? "สมณะ / นักบวช"
                    : patient.maritalStatus || "-"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">สัญชาติ / เชื้อชาติ</dt>
                <dd className="font-semibold text-clinic-ink">
                  {patient.citizenship || "ไทย"} / {patient.ethnicity || "ไทย"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">ศาสนา</dt>
                <dd className="font-semibold text-clinic-ink">{patient.religion || "-"}</dd>
              </div>
              <div className="py-2.5 flex flex-col gap-1">
                <dt className="text-clinic-ink-soft">ที่อยู่ตามสำเนา</dt>
                <dd className="font-medium text-clinic-ink leading-relaxed">{patient.address || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Middle Column: Health Profile & Allergies */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-clinic-terracotta" />
              <span>ประวัติสุขภาพ & การแพ้ยา</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 space-y-4 text-xs">
            {/* Drug Allergy Highlight */}
            <div className="space-y-1.5">
              <span className="font-semibold text-clinic-ink-soft block">
                ประวัติการแพ้ยา (Drug Allergy)
              </span>
              {latestHealthProfile?.drugAllergy &&
              latestHealthProfile.drugAllergy !== "ไม่มีประวัติแพ้ยา" &&
              latestHealthProfile.drugAllergy !== "ปฏิเสธการแพ้ยา" &&
              latestHealthProfile.drugAllergy !== "ไม่ทราบประวัติแพ้ยา" ? (
                <div className="p-3.5 bg-clinic-danger-bg border border-clinic-danger/40 rounded-control text-clinic-danger font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{latestHealthProfile.drugAllergy}</span>
                </div>
              ) : (
                <Badge variant="success" className="gap-1 font-medium py-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{latestHealthProfile?.drugAllergy || "ไม่มีประวัติแพ้ยา / ปฏิเสธ"}</span>
                </Badge>
              )}
            </div>

            {/* Underlying disease & Food allergy */}
            <dl className="divide-y divide-clinic-line">
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">แพ้อาหาร</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {latestHealthProfile?.foodAllergy || "ไม่มี / ปฏิเสธ"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">โรคประจำตัว</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {latestHealthProfile?.underlyingDisease || "ไม่มี / ปฏิเสธ"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">โรคทางพันธุกรรม</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {latestHealthProfile?.hereditaryDisease || "ไม่มี / ปฏิเสธ"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">ประวัติอุบัติเหตุ/ผ่าตัด</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {latestHealthProfile?.accidentHistory || "ไม่มี"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">การดื่มแอลกอฮอล์</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {latestHealthProfile?.alcoholConsumption || "ไม่ระบุ / ปฏิเสธ"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">การสูบบุหรี่</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {latestHealthProfile?.smokingHistory || "ไม่ระบุ / ปฏิเสธ"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Right Column: TTM Principle & Emergency Contacts */}
        <div className="space-y-6 lg:col-span-1">
          {/* TTM Principle Assessment */}
          <Card>
            <CardHeader className="pb-3 border-b border-clinic-line">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-clinic-primary" />
                <span>ธาตุเจ้าเรือน & สมุฏฐาน (แผนไทย)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <dl className="divide-y divide-clinic-line text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-clinic-ink-soft">ธาตุเจ้าเรือนหลัก</dt>
                  <dd className="font-bold text-clinic-primary-deep text-right">
                    {patient.principle?.principalDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                     patient.principle?.principalDhatu === "APO" ? "อาโป (น้ำ)" :
                     patient.principle?.principalDhatu === "VAYO" ? "วาโย (ลม)" :
                     patient.principle?.principalDhatu === "TECHO" ? "เตโช (ไฟ)" :
                     patient.principle?.principalDhatu || "รอการตรวจวิเคราะห์"}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-clinic-ink-soft">ธาตุเจ้าเรือนรอง</dt>
                  <dd className="font-semibold text-clinic-ink text-right">
                    {patient.principle?.secondaryDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                     patient.principle?.secondaryDhatu === "APO" ? "อาโป (น้ำ)" :
                     patient.principle?.secondaryDhatu === "VAYO" ? "วาโย (ลม)" :
                     patient.principle?.secondaryDhatu === "TECHO" ? "เตโช (ไฟ)" :
                     patient.principle?.secondaryDhatu || "-"}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-clinic-ink-soft">ธาตุสมุฏฐาน (ตอนเกิด)</dt>
                  <dd className="font-semibold text-clinic-ink text-right">
                    {patient.principle?.conceptionDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                     patient.principle?.conceptionDhatu === "APO" ? "อาโป (น้ำ)" :
                     patient.principle?.conceptionDhatu === "VAYO" ? "วาโย (ลม)" :
                     patient.principle?.conceptionDhatu === "TECHO" ? "เตโช (ไฟ)" :
                     patient.principle?.conceptionDhatu || "-"}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-clinic-ink-soft">สมุฏฐานอายุ</dt>
                  <dd className="font-semibold text-clinic-ink text-right">
                    {patient.principle?.agePrinciple === "CHILD" ? "ปฐมวัย (เด็ก)" :
                     patient.principle?.agePrinciple === "ADULT" ? "มัชฌิมวัย (ผู้ใหญ่)" :
                     patient.principle?.agePrinciple === "AGING" ? "ปัจฉิมวัย (สูงอายุ)" :
                     patient.principle?.agePrinciple || "-"}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-clinic-ink-soft">สมุฏฐานกาล (พบแพทย์)</dt>
                  <dd className="font-semibold text-clinic-ink text-right">
                    {patient.principle?.timeCurrent === "SEMHA" ? "เสมหะ" :
                     patient.principle?.timeCurrent === "VATA" ? "วาตะ" :
                     patient.principle?.timeCurrent === "PITTA" ? "ปิตตะ" :
                     patient.principle?.timeCurrent || "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader className="pb-3 border-b border-clinic-line">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-clinic-terracotta" />
                <span>ผู้ติดต่อฉุกเฉิน (Emergency Contacts)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {patient.contactPersons && patient.contactPersons.length > 0 ? (
                <div className="space-y-3">
                  {patient.contactPersons.map((contact) => (
                    <div
                      key={contact.contactId}
                      className="p-3 bg-clinic-bg border border-clinic-line rounded-control text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-clinic-ink">
                        <span>{contact.contactName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {contact.relationship || "ผู้ติดต่อ"}
                        </Badge>
                      </div>
                      {contact.mobileNumber && (
                        <p className="font-mono text-clinic-ink-soft">
                          โทร: {contact.mobileNumber}
                        </p>
                      )}
                      {contact.contactAddress && (
                        <p className="text-[11px] text-clinic-ink-soft">
                          ที่อยู่: {contact.contactAddress}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-clinic-ink-soft italic text-center py-2">
                  ไม่มีข้อมูลผู้ติดต่อฉุกเฉิน
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
