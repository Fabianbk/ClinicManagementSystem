import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/lib/resources/patients";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { ApiError } from "@/lib/api-client";
import type { PatientResponseDTO, RecordTreatmentResponseDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  User,
  CreditCard,
  HeartPulse,
  MapPin,
  Users,
  Phone,
  FileText,
  Calendar,
  Sparkles,
  Edit,
  ArrowLeft,
  FilePlus,
  Eye,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

function formatMaritalStatus(status: string | undefined | null): string {
  switch (status) {
    case "SINGLE":
      return "โสด (Single)";
    case "IN_RELATIONSHIP":
      return "มีคู่ / อยู่ด้วยกัน (In a relationship)";
    case "MARRIED":
      return "สมรส (Married)";
    case "WIDOWED":
      return "หม้าย (Widowed)";
    case "SEPARATED":
      return "แยกกันอยู่ (Separated)";
    case "DIVORCED":
      return "หย่า (Divorced)";
    case "MONK":
      return "สมณะ / นักบวช (Monk / Clergy)";
    default:
      return status || "-";
  }
}

function formatTreatmentRights(rights: string | undefined | null): { label: string; variant: "default" | "secondary" | "outline" | "terracotta" } {
  switch (rights) {
    case "ELDERLY":
      return { label: "สิทธิผู้สูงอายุ", variant: "terracotta" };
    case "MONK":
      return { label: "สิทธินักบวช / สมณะ", variant: "terracotta" };
    case "DISABLED":
      return { label: "สิทธิผู้พิการ", variant: "secondary" };
    case "OTHER":
      return { label: "สิทธิอื่นๆ", variant: "outline" };
    case "PAY_DIRECT":
    default:
      return { label: "ชำระเงินเอง (Self-pay)", variant: "outline" };
  }
}

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const patientId = Number(params.id);
  if (isNaN(patientId)) {
    notFound();
  }

  let patient: PatientResponseDTO | null = null;
  let treatments: RecordTreatmentResponseDTO[] = [];
  let errorMessage: string | null = null;

  try {
    const [patientData, treatmentsData] = await Promise.all([
      getPatient(patientId),
      getRecordTreatmentsByPatientId(patientId, 0, 50).catch(() => ({ content: [] })),
    ]);
    patient = patientData;
    treatments = treatmentsData.content || [];
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    errorMessage = err instanceof ApiError ? err.message : "ไม่สามารถโหลดข้อมูลผู้ป่วยได้";
  }

  if (errorMessage || !patient) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/doctor/patients">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>กลับไปยังรายชื่อผู้ป่วย</span>
          </Link>
        </Button>
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium">
          {errorMessage || "ไม่พบข้อมูลผู้ป่วย"}
        </div>
      </div>
    );
  }

  // Calculate age from ISO date of birth
  const age = patient.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const rightsBadge = formatTreatmentRights(patient.treatmentRights);
  const latestHp = treatments.find((t) => t.healthProfile)?.healthProfile;

  return (
    <div className="space-y-6 pb-16 font-body text-clinic-ink">
      {/* Top Page Header */}
      <PageHeader
        icon={<User className="w-5 h-5 text-clinic-primary" />}
        title={patient.fullname}
        subtitle={`HN: P-${String(patient.patientId).padStart(5, "0")} · ข้อมูลเวชระเบียนผู้ป่วยและประวัติการรักษา`}
        badge={
          <Badge variant="terracotta" className="text-xs">
            HN: P-{String(patient.patientId).padStart(5, "0")}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/doctor/patients">
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับ</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/doctor/patients/${patient.patientId}/edit`}>
                <Edit className="w-4 h-4" />
                <span>แก้ไขข้อมูล</span>
              </Link>
            </Button>
            <Button asChild variant="terracotta" size="sm">
              <Link href={`/doctor/treatments/new?patientId=${patient.patientId}`}>
                <FilePlus className="w-4 h-4" />
                <span>+ บันทึกการรักษาใหม่</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Patient Key Metrics Banner */}
      <div className="bg-white border border-clinic-line rounded-card p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-clinic-line">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold text-clinic-ink-soft uppercase">เพศ / อายุ</p>
          <p className="text-sm font-bold text-clinic-ink">
            {patient.gender === "MALE" ? "ชาย" : patient.gender === "FEMALE" ? "หญิง" : patient.gender || "-"} · {age !== null ? `${age} ปี` : "-"}
          </p>
        </div>
        <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
          <p className="text-[11px] font-semibold text-clinic-ink-soft uppercase">กรุ๊ปเลือด</p>
          <p className="text-sm font-bold text-clinic-primary-deep">
            {patient.bloodGroupAbo && patient.bloodGroupAbo !== "UNKNOWN"
              ? `${patient.bloodGroupAbo}${patient.bloodGroupRh === "POSITIVE" ? "+" : patient.bloodGroupRh === "NEGATIVE" ? "-" : ""}`
              : patient.bloodGroup || "ไม่ระบุ"}
          </p>
        </div>
        <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
          <p className="text-[11px] font-semibold text-clinic-ink-soft uppercase">เบอร์ติดต่อ</p>
          <p className="text-sm font-bold font-mono text-clinic-ink">
            {patient.mobileNumber || "-"}
          </p>
        </div>
        <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
          <p className="text-[11px] font-semibold text-clinic-ink-soft uppercase">ธาตุเจ้าเรือนกำเนิด</p>
          <p className="text-sm font-bold text-clinic-terracotta-deep">
            {patient.principle?.principalDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
             patient.principle?.principalDhatu === "APO" ? "อาโป (น้ำ)" :
             patient.principle?.principalDhatu === "VAYO" ? "วาโย (ลม)" :
             patient.principle?.principalDhatu === "TECHO" ? "เตโช (ไฟ)" :
             patient.principle?.principalDhatu || "รอตรวจประเมิน"}
          </p>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-clinic-primary" />
              <span>ข้อมูลระบุตัวตน & ข้อมูลพื้นฐาน (Basic Info)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="font-semibold text-clinic-ink-soft">
                  {patient.idType === "THAI_ID" ? "เลขบัตรประจำตัวประชาชน" : "เลขหนังสือเดินทาง (Passport No.)"}
                </dt>
                <dd className="font-mono font-bold text-clinic-ink mt-0.5">
                  {patient.nationalId || patient.passportNo || patient.idNumber || "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">สถานภาพสมรส</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{formatMaritalStatus(patient.maritalStatus)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">อาชีพ</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.occupation || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">สัญชาติ / เชื้อชาติ</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">
                  {patient.citizenship || "ไทย"} / {patient.ethnicity || "ไทย"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">ศาสนา</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.religion || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">สิทธิการรักษา</dt>
                <dd className="font-medium text-clinic-terracotta mt-0.5">{rightsBadge.label}</dd>
              </div>
              <div className="sm:col-span-2 pt-1">
                <dt className="font-semibold text-clinic-ink-soft">วันเดือนปีเกิดทางจันทรคติ (Lunar Birth Date)</dt>
                <dd className="font-mono font-bold text-clinic-primary-deep mt-0.5">{patient.thaiCalendarBirthDate || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Health Profile */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-clinic-terracotta" />
              <span>ประวัติสุขภาพ & การแพ้ยา (ล่าสุดจากการตรวจรักษา)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div>
              <span className="font-semibold text-clinic-ink-soft block mb-1">ประวัติแพ้ยา (Drug Allergy)</span>
              {latestHp?.drugAllergy &&
              latestHp.drugAllergy !== "ไม่มีประวัติแพ้ยา" &&
              latestHp.drugAllergy !== "ปฏิเสธการแพ้ยา" &&
              latestHp.drugAllergy !== "No" ? (
                <div className="p-3 bg-clinic-danger-bg border border-clinic-danger/40 rounded-control text-clinic-danger font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>⚠️ {latestHp.drugAllergy}</span>
                </div>
              ) : (
                <Badge variant="success" className="gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>✓ {latestHp?.drugAllergy || "ไม่มีประวัติแพ้ยา / ปฏิเสธ"}</span>
                </Badge>
              )}
            </div>

            <div>
              <span className="font-semibold text-clinic-ink-soft block">โรคประจำตัว</span>
              <p className="text-clinic-ink font-medium mt-0.5">
                {latestHp?.underlyingDisease || "ปฏิเสธโรคประจำตัว"}
              </p>
            </div>

            {latestHp?.foodAllergy && !latestHp.foodAllergy.includes("ปฏิเสธ") && (
              <div>
                <span className="font-semibold text-clinic-ink-soft block">แพ้อาหาร</span>
                <p className="text-amber-700 font-medium mt-0.5">{latestHp.foodAllergy}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Structured Address */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-clinic-primary" />
              <span>ที่อยู่อาศัย & ข้อมูลติดต่อ (Address & Contact)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs">
            <div>
              <dt className="font-semibold text-clinic-ink-soft">ที่อยู่ตามเวชระเบียน</dt>
              <dd className="font-medium text-clinic-ink mt-0.5 leading-relaxed">
                {patient.address ||
                  [
                    patient.houseNo ? `บ้านเลขที่ ${patient.houseNo}` : "",
                    patient.moo ? `หมู่ ${patient.moo}` : "",
                    patient.soi ? `ซอย ${patient.soi}` : "",
                    patient.road ? `ถนน ${patient.road}` : "",
                    patient.subDistrict ? `ต. ${patient.subDistrict}` : "",
                    patient.district ? `อ. ${patient.district}` : "",
                    patient.province ? `จ. ${patient.province}` : "",
                    patient.zipCode,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "-"}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <dt className="font-semibold text-clinic-ink-soft">เบอร์โทรศัพท์</dt>
                <dd className="font-mono font-medium text-clinic-ink mt-0.5">{patient.mobileNumber || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">อีเมล</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.email || "-"}</dd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thai Specific Master Data */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-clinic-terracotta" />
              <span>ข้อมูลประวัติเฉพาะ & ฤกษ์กำเนิดแผนไทย (Master Data)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="font-semibold text-clinic-ink-soft">ภูมิลำเนาเดิม</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.originalDomicile || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">สถานที่เกิด</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.birthPlace || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">วุฒิการศึกษา</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.education || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">สถานภาพในบ้าน</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">
                  {patient.householdStatus === "HEAD_OF_HOUSEHOLD"
                    ? "เจ้าบ้าน"
                    : patient.householdStatus === "RESIDENT"
                    ? "ผู้อาศัย"
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">บิดา / มารดา</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">
                  {patient.fatherName || "-"} / {patient.motherName || "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-clinic-ink-soft">คู่สมรส</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.spouseName || "-"}</dd>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-clinic-line">
                <dt className="font-semibold text-clinic-ink-soft">
                  วันเดือนปีเกิดทางจันทรคติ (Thai Calendar Birth Date)
                </dt>
                <dd className="font-serif font-bold text-clinic-primary-deep mt-0.5">
                  {patient.thaiCalendarBirthDate || "-"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Dhatu Principle Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-clinic-primary" />
              <span>ธาตุสมุฏฐานประจำตัวผู้ป่วย (Dhatu Principle)</span>
            </CardTitle>
            {patient.principle ? (
              <Badge variant="success" className="text-xs">
                ประเมินแล้ว
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-clinic-ink-soft">
                ยังไม่มีข้อมูลการประเมิน
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {patient.principle ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line space-y-1.5">
                  <span className="font-bold text-clinic-primary-deep block">ธาตุเจ้าเรือน</span>
                  <div>
                    <span className="text-clinic-ink-soft">หลัก:</span>{" "}
                    <strong className="text-clinic-ink">
                      {patient.principle.principalDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                       patient.principle.principalDhatu === "APO" ? "อาโป (น้ำ)" :
                       patient.principle.principalDhatu === "VAYO" ? "วาโย (ลม)" :
                       patient.principle.principalDhatu === "TECHO" ? "เตโช (ไฟ)" :
                       patient.principle.principalDhatu || "-"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-clinic-ink-soft">รอง:</span>{" "}
                    <strong className="text-clinic-ink">
                      {patient.principle.secondaryDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                       patient.principle.secondaryDhatu === "APO" ? "อาโป (น้ำ)" :
                       patient.principle.secondaryDhatu === "VAYO" ? "วาโย (ลม)" :
                       patient.principle.secondaryDhatu === "TECHO" ? "เตโช (ไฟ)" :
                       patient.principle.secondaryDhatu || "-"}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line space-y-1.5">
                  <span className="font-bold text-clinic-primary-deep block">ธาตุสมุฏฐาน</span>
                  <div>
                    <span className="text-clinic-ink-soft">ปฏิสนธิตอนเกิด:</span>{" "}
                    <strong className="text-clinic-ink">
                      {patient.principle.conceptionDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                       patient.principle.conceptionDhatu === "APO" ? "อาโป (น้ำ)" :
                       patient.principle.conceptionDhatu === "VAYO" ? "วาโย (ลม)" :
                       patient.principle.conceptionDhatu === "TECHO" ? "เตโช (ไฟ)" :
                       patient.principle.conceptionDhatu || "-"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-clinic-ink-soft">ปฏิสนธิลักษณะ:</span>{" "}
                    <strong className="text-clinic-ink">
                      {patient.principle.conceptionCharacteristic === "SEMHA" ? "เสมหะ" :
                       patient.principle.conceptionCharacteristic === "VATA" ? "วาตะ" :
                       patient.principle.conceptionCharacteristic === "PITTA" ? "ปิตตะ" :
                       patient.principle.conceptionCharacteristic || "-"}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line space-y-1.5">
                  <span className="font-bold text-clinic-primary-deep block">อุตุ & อายุสมุฏฐาน</span>
                  <div>
                    <span className="text-clinic-ink-soft">เริ่มป่วย → พบแพทย์:</span>{" "}
                    <strong className="text-clinic-ink">
                      {(patient.principle.seasonalOnset === "SEMHA" ? "เสมหะ" : patient.principle.seasonalOnset === "VATA" ? "วาตะ" : patient.principle.seasonalOnset === "PITTA" ? "ปิตตะ" : "-")} → {(patient.principle.seasonalCurrent === "SEMHA" ? "เสมหะ" : patient.principle.seasonalCurrent === "VATA" ? "วาตะ" : patient.principle.seasonalCurrent === "PITTA" ? "ปิตตะ" : "-")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-clinic-ink-soft">ช่วงวัย:</span>{" "}
                    <strong className="text-clinic-ink">
                      {patient.principle.agePrinciple === "CHILD" ? "ปฐมวัย (เด็ก)" :
                       patient.principle.agePrinciple === "ADULT" ? "มัชฌิมวัย (ผู้ใหญ่)" :
                       patient.principle.agePrinciple === "AGING" ? "ปัจฉิมวัย (สูงอายุ)" :
                       patient.principle.agePrinciple || "-"}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line space-y-1.5">
                  <span className="font-bold text-clinic-primary-deep block">กาล & ประเทศสมุฏฐาน</span>
                  <div>
                    <span className="text-clinic-ink-soft">กำเริบ → พบแพทย์:</span>{" "}
                    <strong className="text-clinic-ink">
                      {(patient.principle.timeOnset === "SEMHA" ? "เสมหะ" : patient.principle.timeOnset === "VATA" ? "วาตะ" : patient.principle.timeOnset === "PITTA" ? "ปิตตะ" : "-")} → {(patient.principle.timeCurrent === "SEMHA" ? "เสมหะ" : patient.principle.timeCurrent === "VATA" ? "วาตะ" : patient.principle.timeCurrent === "PITTA" ? "ปิตตะ" : "-")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-clinic-ink-soft">ภูมิลำเนา → ปัจจุบัน:</span>{" "}
                    <strong className="text-clinic-ink">
                      {(patient.principle.geoBirthplace === "PATHAVI" ? "ปถวี (ดิน)" : patient.principle.geoBirthplace === "APO" ? "อาโป (น้ำ)" : patient.principle.geoBirthplace === "VAYO" ? "วาโย (ลม)" : patient.principle.geoBirthplace === "TECHO" ? "เตโช (ไฟ)" : "-")} → {(patient.principle.geoCurrent === "PATHAVI" ? "ปถวี (ดิน)" : patient.principle.geoCurrent === "APO" ? "อาโป (น้ำ)" : patient.principle.geoCurrent === "VAYO" ? "วาโย (ลม)" : patient.principle.geoCurrent === "TECHO" ? "เตโช (ไฟ)" : "-")}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-clinic-ink-soft italic">
                จะถูกประเมินและบันทึกอัตโนมัติเมื่อแพทย์ทำการบันทึกเวชระเบียนการรักษาครั้งแรก (First Visit)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts List */}
      {patient.contactPersons && patient.contactPersons.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-clinic-primary" />
              <span>บุคคลที่ติดต่อได้ในกรณีฉุกเฉิน (Emergency Contacts)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patient.contactPersons.map((contact, index) => (
                <div key={contact.contactId || index} className="p-4 rounded-control bg-clinic-bg/50 border border-clinic-line space-y-1 text-xs">
                  <strong className="block font-bold text-clinic-ink text-sm">
                    {contact.contactName} ({contact.relationship || "ผู้ติดต่อ"})
                  </strong>
                  <p className="text-clinic-ink-soft flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-clinic-primary" />
                    <span>{contact.mobileNumber || "-"}</span>
                  </p>
                  {contact.contactAddress && (
                    <p className="text-clinic-ink-muted text-[11px] mt-1">{contact.contactAddress}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment History Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-clinic-line">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-clinic-primary" />
            <span>ประวัติการตรวจรักษาทั้งหมด ({treatments.length} ครั้ง)</span>
          </CardTitle>
          <Button asChild variant="secondary" size="sm" className="h-7 text-xs">
            <Link href={`/doctor/treatments/new?patientId=${patient.patientId}`}>
              + บันทึกการรักษาใหม่
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {treatments.length > 0 ? (
            <div className="space-y-3">
              {treatments.map((t) => {
                const meds = t.recordTreatmentMedicines || [];
                return (
                  <div
                    key={t.recordTreatmentId}
                    className="p-4 bg-clinic-bg/40 border border-clinic-line rounded-control space-y-2.5 hover:border-clinic-primary/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-clinic-line/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs font-bold">
                          การรักษา #{t.recordTreatmentId}
                        </Badge>
                        <span className="text-xs text-clinic-ink-soft">
                          {t.recordDate
                            ? new Date(t.recordDate).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-clinic-ink-soft">
                          แพทย์: <strong className="text-clinic-ink">{t.doctorFullname}</strong>
                        </span>
                        <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-xs text-clinic-primary">
                          <Link href={`/doctor/treatments/${t.recordTreatmentId}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>ดูบันทึก</span>
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-semibold text-clinic-ink-soft">อาการ:</span>{" "}
                        <span className="text-clinic-ink">{t.symptoms || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-clinic-ink-soft">การวินิจฉัยแผนไทย:</span>{" "}
                        <span className="text-clinic-primary font-semibold">{t.ttmDiagnosis || "-"}</span>
                      </div>
                      {meds.length > 0 && (
                        <div className="sm:col-span-2">
                          <span className="font-semibold text-clinic-ink-soft">ยาที่ได้รับ:</span>{" "}
                          <span className="text-clinic-ink">
                            {meds.map((m) => `${m.medicineName} (${m.quantity})`).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-clinic-ink-soft space-y-2">
              <p className="text-xs">ยังไม่มีประวัติการบันทึกการรักษาสำหรับผู้ป่วยรายนี้</p>
              <Button asChild variant="terracotta" size="sm">
                <Link href={`/doctor/treatments/new?patientId=${patient.patientId}`}>
                  + บันทึกการตรวจรักษาครั้งแรก
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
