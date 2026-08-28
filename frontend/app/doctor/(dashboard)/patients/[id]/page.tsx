import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/lib/resources/patients";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { ApiError } from "@/lib/api-client";
import type { PatientResponseDTO, RecordTreatmentResponseDTO } from "@/lib/types";
// Local Badge helper
function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "terracotta";
  className?: string;
}) {
  const variantStyles =
    variant === "terracotta"
      ? "bg-clinic-terracotta/10 text-clinic-terracotta border-clinic-terracotta/20"
      : variant === "secondary"
      ? "bg-clinic-accent/10 text-clinic-accent-deep border-clinic-accent/20"
      : "bg-clinic-bg text-clinic-ink border-clinic-line";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
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
        <div className="flex items-center justify-between">
          <Link
            href="/doctor/patients"
            className="text-sm font-semibold text-clinic-primary hover:underline flex items-center gap-1"
          >
            ← ย้อนกลับไปรายชื่อผู้ป่วย
          </Link>
        </div>
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium">
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body text-clinic-ink">
      {/* Top Action & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-semibold text-clinic-ink bg-white border border-clinic-line hover:bg-clinic-bg transition-colors shadow-xs"
        >
          ← ย้อนกลับ
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/doctor/treatments/new?patientId=${patient.patientId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control text-xs font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-sm"
          >
            <span>📝 บันทึกการรักษาใหม่</span>
          </Link>

          <Link
            href={`/doctor/patients/${patient.patientId}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-control text-xs font-semibold text-clinic-ink bg-white hover:bg-slate-50 border border-clinic-line transition-all shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>แก้ไขข้อมูล</span>
          </Link>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-clinic-primary-deep text-white font-display font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
            {patient.fullname.substring(0, 2)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-clinic-primary-deep">
                {patient.fullname}
              </h1>
              <span className="bg-clinic-primary/10 text-clinic-primary-deep border border-clinic-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                HN-{patient.patientId}
              </span>
              <Badge variant={rightsBadge.variant} className="text-xs">
                {rightsBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-clinic-ink-soft flex flex-wrap items-center gap-3">
              <span>เพศ: <strong>{patient.gender === "MALE" ? "ชาย" : "หญิง"}</strong></span>
              <span>•</span>
              <span>อายุ: <strong>{age !== null ? `${age} ปี` : "-"}</strong></span>
              <span>•</span>
              <span>เกิด: <strong>{patient.dateOfBirthThai || patient.dateOfBirth}</strong></span>
              <span>•</span>
              <span>สัญชาติ: <strong>{patient.citizenship || "ไทย"}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto border-t md:border-t-0 border-clinic-line pt-4 md:pt-0">
          <div className="text-center px-4 py-2 bg-clinic-bg rounded-control border border-clinic-line">
            <span className="block text-[10px] font-semibold text-clinic-ink-soft uppercase">กรุ๊ปเลือด</span>
            <span className="text-sm font-bold text-clinic-primary-deep">
              {patient.bloodGroupAbo && patient.bloodGroupAbo !== "UNKNOWN"
                ? `${patient.bloodGroupAbo}${patient.bloodGroupRh === "POSITIVE" ? "+" : patient.bloodGroupRh === "NEGATIVE" ? "-" : ""}`
                : patient.bloodGroup || "ไม่ระบุ"}
            </span>
          </div>
          <div className="text-center px-4 py-2 bg-clinic-bg rounded-control border border-clinic-line">
            <span className="block text-[10px] font-semibold text-clinic-ink-soft uppercase">เบอร์โทรศัพท์</span>
            <span className="text-sm font-bold font-mono text-clinic-ink">{patient.mobileNumber || "-"}</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-clinic-primary" />
            <span>ข้อมูลระบุตัวตน & ข้อมูลพื้นฐาน (Basic Info)</span>
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">
                {patient.idType === "THAI_ID" ? "เลขบัตรประจำตัวประชาชน" : "เลขหนังสือเดินทาง (Passport No.)"}
              </dt>
              <dd className="font-mono font-bold text-clinic-ink mt-0.5">
                {patient.nationalId || patient.passportNo || patient.idNumber || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">สถานภาพสมรส</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{formatMaritalStatus(patient.maritalStatus)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">อาชีพ</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.occupation || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">สัญชาติ / เชื้อชาติ</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">
                {patient.citizenship || "-"} / {patient.ethnicity || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">ศาสนา</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.religion || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">สิทธิการรักษา</dt>
              <dd className="font-medium text-clinic-terracotta mt-0.5">{rightsBadge.label}</dd>
            </div>
          </dl>
        </div>

        {/* Health Profile */}
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-clinic-terracotta" />
            <span>ประวัติสุขภาพ & การแพ้ยา (Health Profile)</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-clinic-ink-soft block mb-1">ประวัติแพ้ยา (Drug Allergy)</span>
              {patient.healthProfile?.drugAllergy &&
              patient.healthProfile.drugAllergy !== "ไม่มีประวัติแพ้ยา" &&
              patient.healthProfile.drugAllergy !== "No" ? (
                <div className="p-3 bg-clinic-danger-bg border border-clinic-danger/40 rounded-control text-clinic-danger font-semibold text-xs flex items-center gap-2">
                  <span>⚠️ {patient.healthProfile.drugAllergy}</span>
                </div>
              ) : (
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                  ✓ {patient.healthProfile?.drugAllergy || "ไม่มีประวัติแพ้ยา"}
                </span>
              )}
            </div>

            {patient.healthProfile?.underlyingDisease && (
              <div>
                <span className="text-xs font-semibold text-clinic-ink-soft block">โรคประจำตัว</span>
                <p className="text-clinic-ink font-medium">{patient.healthProfile.underlyingDisease}</p>
              </div>
            )}
          </div>
        </div>

        {/* Structured Address */}
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-clinic-primary" />
            <span>ที่อยู่อาศัย & ข้อมูลติดต่อ (Address & Contact)</span>
          </h2>

          <dl className="space-y-2.5 text-sm">
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">ที่อยู่ตามเวชระเบียน</dt>
              <dd className="font-medium text-clinic-ink mt-0.5 leading-relaxed">
                {patient.address ||
                  [
                    patient.houseNo ? `บ้านเลขที่ ${patient.houseNo}` : "",
                    patient.moo ? `หมู่ ${patient.moo}` : "",
                    patient.soi ? `ซอย ${patient.soi}` : "",
                    patient.road ? `ถนน ${patient.road}` : "",
                    patient.subDistrict ? `ต./แขวง ${patient.subDistrict}` : "",
                    patient.district ? `อ./เขต ${patient.district}` : "",
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
                <dt className="text-xs font-semibold text-clinic-ink-soft">เบอร์โทรศัพท์</dt>
                <dd className="font-mono font-medium text-clinic-ink mt-0.5">{patient.mobileNumber || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-clinic-ink-soft">อีเมล</dt>
                <dd className="font-medium text-clinic-ink mt-0.5">{patient.email || "-"}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Thai Specific Master Data */}
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-clinic-terracotta" />
            <span>ข้อมูลประวัติเฉพาะ & ฤกษ์กำเนิดแผนไทย (Master Data)</span>
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">ภูมิลำเนาเดิม</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.originalDomicile || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">สถานที่เกิด</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.birthPlace || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">วุฒิการศึกษา</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.education || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">สถานภาพในบ้าน</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">
                {patient.householdStatus === "HEAD_OF_HOUSEHOLD"
                  ? "เจ้าบ้าน"
                  : patient.householdStatus === "RESIDENT"
                  ? "ผู้อาศัย"
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">บิดา / มารดา</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">
                {patient.fatherName || "-"} / {patient.motherName || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">คู่สมรส</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.spouseName || "-"}</dd>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-clinic-line">
              <dt className="text-xs font-semibold text-clinic-ink-soft">
                วันเดือนปีเกิดทางจันทรคติ (Thai Calendar Birth Date)
              </dt>
              <dd className="font-serif font-bold text-clinic-primary-deep mt-0.5">
                {patient.thaiCalendarBirthDate || "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Emergency Contacts List */}
      {patient.contactPersons && patient.contactPersons.length > 0 && (
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-clinic-primary" />
            <span>บุคคลที่ติดต่อได้ในกรณีฉุกเฉิน (Emergency Contacts)</span>
          </h2>

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
        </div>
      )}

      {/* Treatment History Records */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-clinic-line pb-2.5">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
            <FileText className="w-4 h-4 text-clinic-primary" />
            <span>ประวัติการตรวจรักษาทั้งหมด ({treatments.length} ครั้ง)</span>
          </h2>
          <Link
            href={`/doctor/treatments/new?patientId=${patient.patientId}`}
            className="text-xs font-semibold text-clinic-primary hover:underline"
          >
            + บันทึกการรักษาใหม่
          </Link>
        </div>

        {treatments.length === 0 ? (
          <p className="text-xs text-clinic-ink-soft py-6 text-center">ยังไม่มีประวัติการรักษา</p>
        ) : (
          <div className="space-y-3">
            {treatments.map((t) => (
              <div
                key={t.recordTreatmentId}
                className="p-4 rounded-control border border-clinic-line hover:border-clinic-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-clinic-bg/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-clinic-ink">
                      {new Date(t.recordDate).toLocaleDateString("th-TH")}
                    </span>
                    <span className="text-xs text-clinic-ink-soft">• หมอผู้ตรวจ: {t.doctorFullname || "-"}</span>
                  </div>
                  <p className="text-xs text-clinic-ink line-clamp-1">
                    <strong>อาการสำคัญ:</strong> {t.symptoms || "-"}
                  </p>
                </div>

                <Link
                  href={`/doctor/treatments/${t.recordTreatmentId}`}
                  className="text-xs font-semibold text-clinic-primary hover:underline shrink-0"
                >
                  ดูรายละเอียด →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
