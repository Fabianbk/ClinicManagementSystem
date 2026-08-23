import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/lib/resources/patients";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { ApiError } from "@/lib/api-client";
import type { PatientResponseDTO, RecordTreatmentResponseDTO } from "@/lib/types";

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            แก้ไขข้อมูล
          </Link>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-clinic-primary-deep text-white font-display font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
            {patient.fullname.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-clinic-primary-deep">
                {patient.fullname}
              </h1>
              <span className="bg-clinic-primary/10 text-clinic-primary-deep border border-clinic-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                ID: {patient.patientId}
              </span>
            </div>
            <p className="text-xs text-clinic-ink-soft mt-1 flex flex-wrap items-center gap-3">
              <span>เพศ: <strong>{patient.gender}</strong></span>
              <span>•</span>
              <span>อายุ: <strong>{age !== null ? `${age} ปี` : "-"}</strong></span>
              <span>•</span>
              <span>เกิด: <strong>{patient.dateOfBirthThai || patient.dateOfBirth}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto border-t md:border-t-0 border-clinic-line pt-4 md:pt-0">
          <div className="text-center px-4 py-2 bg-clinic-bg rounded-control border border-clinic-line">
            <span className="block text-[10px] font-semibold text-clinic-ink-soft uppercase">กรุ๊ปเลือด</span>
            <span className="text-sm font-bold text-clinic-primary-deep">{patient.bloodGroup || "-"}</span>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            ข้อมูลพื้นฐาน (Basic Info)
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">เลขบัตรประชาชน/พาสปอร์ต</dt>
              <dd className="font-mono font-medium text-clinic-ink mt-0.5">{patient.idNumber || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">อาชีพ</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.occupation || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">สถานภาพสมรส</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.marital || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">สัญชาติ / เชื้อชาติ</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">
                {patient.nationality || "-"} / {patient.ethnic || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">ศาสนา</dt>
              <dd className="font-medium text-clinic-ink mt-0.5">{patient.religion || "-"}</dd>
            </div>
          </dl>
        </div>

        {/* Health Profile */}
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            ประวัติสุขภาพ & การแพ้ยา (Health Profile)
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-clinic-ink-soft block mb-1">ประวัติแพ้ยา (Drug Allergy)</span>
              {patient.healthProfile?.drugAllergy && patient.healthProfile.drugAllergy !== "ไม่มีประวัติแพ้ยา" ? (
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

        {/* Contact Address */}
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            ที่อยู่อาศัย & ข้อมูลติดต่อ (Contact Address)
          </h2>

          <dl className="space-y-2.5 text-sm">
            <div>
              <dt className="text-xs font-semibold text-clinic-ink-soft">ที่อยู่ตามสำเนา</dt>
              <dd className="font-medium text-clinic-ink mt-0.5 leading-relaxed">
                {patient.address || "-"}
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

        {/* Emergency Contact */}
        <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep border-b border-clinic-line pb-2.5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            ผู้ติดต่อกรณีฉุกเฉิน (Emergency Contact)
          </h2>

          {patient.contactPersons && patient.contactPersons.length > 0 ? (
            <div className="space-y-3">
              {patient.contactPersons.map((contact) => (
                <div
                  key={contact.contactId}
                  className="p-3.5 bg-clinic-bg border border-clinic-line rounded-control space-y-1 text-sm"
                >
                  <div className="flex items-center justify-between font-semibold text-clinic-ink">
                    <span>{contact.contactName}</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded border border-clinic-line text-clinic-ink-soft">
                      {contact.relationship || "ผู้ติดต่อ"}
                    </span>
                  </div>
                  {contact.mobileNumber && (
                    <p className="text-xs font-mono text-clinic-ink-soft">
                      โทร: {contact.mobileNumber}
                    </p>
                  )}
                  {contact.contactAddress && (
                    <p className="text-xs text-clinic-ink-soft">
                      ที่อยู่: {contact.contactAddress}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-clinic-ink-soft italic">ไม่มีข้อมูลผู้ติดต่อฉุกเฉิน</p>
          )}
        </div>
      </div>

      {/* Treatment History Section */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
            <span>🌿 ประวัติการตรวจรักษาทั้งหมด ({treatments.length} ครั้ง)</span>
          </h2>
          <Link
            href={`/doctor/treatments/new?patientId=${patient.patientId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-bold text-clinic-primary bg-clinic-bg hover:bg-clinic-primary hover:text-white transition-all border border-clinic-line shadow-2xs"
          >
            + บันทึกการรักษาใหม่
          </Link>
        </div>

        {treatments.length > 0 ? (
          <div className="space-y-4">
            {treatments.map((t) => {
              const meds = t.recordTreatmentMedicines || [];
              return (
                <div
                  key={t.recordTreatmentId}
                  className="p-4 bg-clinic-bg/40 border border-clinic-line rounded-control space-y-3 hover:border-clinic-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-clinic-line/60 pb-2.5">
                    <div>
                      <span className="font-bold text-sm text-clinic-primary-deep">
                        การรักษา #{t.recordTreatmentId}
                      </span>
                      <span className="text-xs text-clinic-ink-soft ml-2">
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
                        แพทย์: <strong>{t.doctorFullname}</strong>
                      </span>
                      <Link
                        href={`/doctor/treatments/${t.recordTreatmentId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-clinic-primary bg-white hover:bg-clinic-primary hover:text-white border border-clinic-line transition-all shadow-2xs"
                      >
                        👁️ ดูรายละเอียด
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-clinic-ink-soft">อาการ:</span>{" "}
                      <span className="text-clinic-ink">{t.symptoms || "-"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-clinic-ink-soft">การวินิจฉัยแผนไทย:</span>{" "}
                      <span className="text-clinic-primary font-semibold">{t.ttmDiagnosis || "-"}</span>
                    </div>
                    {t.treatmentProgram && (
                      <div>
                        <span className="font-semibold text-clinic-ink-soft">หัตถการ:</span>{" "}
                        <span className="text-clinic-ink">{t.treatmentProgram}</span>
                      </div>
                    )}
                    {meds.length > 0 && (
                      <div>
                        <span className="font-semibold text-clinic-ink-soft">ยาที่ได้รับ:</span>{" "}
                        <span className="text-clinic-ink font-medium">
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
            <Link
              href={`/doctor/treatments/new?patientId=${patient.patientId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-clinic-primary text-white text-xs font-semibold rounded-control hover:bg-clinic-primary-deep transition-colors"
            >
              + บันทึกการตรวจรักษาครั้งแรก
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
