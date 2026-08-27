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
  Phone,
  Calendar,
  AlertTriangle,
  FilePlus,
  Edit,
  ArrowLeft,
  Heart,
  MapPin,
  ShieldCheck,
  Eye,
  Activity,
  History,
} from "lucide-react";

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
            {patient.gender || "-"} · {age !== null ? `${age} ปี` : "-"}
          </p>
        </div>
        <div className="space-y-0.5 sm:pl-4 pt-2 sm:pt-0">
          <p className="text-[11px] font-semibold text-clinic-ink-soft uppercase">กรุ๊ปเลือด</p>
          <p className="text-sm font-bold text-clinic-primary-deep">
            {patient.bloodGroup || "-"}
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
            {patient.principle?.principleDhatu || "รอตรวจประเมิน"}
          </p>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic Information */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-clinic-primary" />
              <span>ข้อมูลพื้นฐาน (Basic Information)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <dt className="text-clinic-ink-soft font-semibold">เลขบัตรประชาชน</dt>
                <dd className="font-mono text-clinic-ink mt-0.5">{patient.idNumber || "-"}</dd>
              </div>
              <div>
                <dt className="text-clinic-ink-soft font-semibold">วันเกิด</dt>
                <dd className="text-clinic-ink mt-0.5">{patient.dateOfBirth || "-"}</dd>
              </div>
              <div>
                <dt className="text-clinic-ink-soft font-semibold">อาชีพ</dt>
                <dd className="text-clinic-ink mt-0.5">{patient.occupation || "-"}</dd>
              </div>
              <div>
                <dt className="text-clinic-ink-soft font-semibold">สถานภาพ</dt>
                <dd className="text-clinic-ink mt-0.5">{patient.marital || "-"}</dd>
              </div>
              <div>
                <dt className="text-clinic-ink-soft font-semibold">สัญชาติ / เชื้อชาติ</dt>
                <dd className="text-clinic-ink mt-0.5">
                  {patient.nationality || "-"} / {patient.ethnic || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-clinic-ink-soft font-semibold">ศาสนา</dt>
                <dd className="text-clinic-ink mt-0.5">{patient.religion || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Right Column: Health Profile & Allergies */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-clinic-terracotta" />
              <span>ประวัติสุขภาพ & การแพ้ยา (Health Profile)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div>
              <span className="font-semibold text-clinic-ink-soft block mb-1">
                ประวัติการแพ้ยา (Drug Allergy)
              </span>
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

            <div>
              <span className="font-semibold text-clinic-ink-soft block">โรคประจำตัว</span>
              <p className="text-clinic-ink font-medium mt-0.5">
                {patient.healthProfile?.underlyingDisease || "ไม่มี"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address & Contact */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-clinic-primary" />
              <span>ที่อยู่อาศัย & ข้อมูลติดต่อ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs">
            <div>
              <span className="font-semibold text-clinic-ink-soft block">ที่อยู่ตามสำเนา</span>
              <p className="text-clinic-ink leading-relaxed mt-0.5">
                {patient.address || "-"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-semibold text-clinic-ink-soft block">เบอร์โทรศัพท์</span>
                <p className="font-mono text-clinic-ink mt-0.5">{patient.mobileNumber || "-"}</p>
              </div>
              <div>
                <span className="font-semibold text-clinic-ink-soft block">อีเมล</span>
                <p className="text-clinic-ink mt-0.5">{patient.email || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-clinic-terracotta" />
              <span>ผู้ติดต่อกรณีฉุกเฉิน (Emergency Contacts)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {patient.contactPersons && patient.contactPersons.length > 0 ? (
              <div className="space-y-2.5">
                {patient.contactPersons.map((contact) => (
                  <div
                    key={contact.contactId}
                    className="p-3 bg-clinic-bg border border-clinic-line rounded-control text-xs space-y-1"
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-clinic-ink-soft italic">ไม่มีข้อมูลผู้ติดต่อฉุกเฉิน</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Treatment History Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-clinic-line">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-clinic-primary" />
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
