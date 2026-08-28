import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPatient } from "@/lib/resources/patients";

export default async function PatientProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const patient = await getPatient(session.id).catch(() => null);
  if (!patient) {
    return (
      <div className="p-8 bg-white rounded-card border border-clinic-line shadow-sm text-center">
        <h2 className="text-xl font-bold text-clinic-danger">ไม่พบข้อมูลโปรไฟล์</h2>
        <p className="text-clinic-ink-soft text-sm mt-1">กรุณาติดต่อเจ้าหน้าที่คลินิก</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-clinic-primary-deep flex items-center gap-2">
            ข้อมูลส่วนตัวและประวัติสุขภาพ
          </h1>
          <p className="text-xs text-clinic-ink-soft mt-0.5">
            HN: P-{String(patient.patientId).padStart(5, "0")} · ข้อมูลเวชระเบียนผู้ป่วย
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-clinic-bg border border-clinic-line text-xs font-mono text-clinic-ink">
          <span>เบอร์ติดต่อ: {patient.mobileNumber}</span>
        </div>
      </div>

      {/* Grid: 3 Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Information */}
        <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <div className="w-7 h-7 rounded-md bg-clinic-bg text-clinic-primary flex items-center justify-center font-bold text-xs">
              👤
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep">
              ข้อมูลทั่วไป
            </h2>
          </div>

          <dl className="divide-y divide-clinic-line text-xs">
            <div className="py-2.5 flex justify-between">
              <dt className="text-clinic-ink-soft">ชื่อ-นามสกุล</dt>
              <dd className="font-semibold text-clinic-ink text-right">{patient.fullname}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-clinic-ink-soft">เพศ</dt>
              <dd className="font-semibold text-clinic-ink">{patient.gender === "MALE" ? "ชาย" : "หญิง"}</dd>
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
                  : "-"}
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
        </section>

        {/* Middle Column: Health Profile & Allergies */}
        <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <div className="w-7 h-7 rounded-md bg-clinic-danger-bg text-clinic-danger flex items-center justify-center font-bold text-xs">
              💊
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep">
              ข้อมูลสุขภาพ & การแพ้
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Drug Allergy Box */}
            <div
              className={`p-4 rounded-control border ${
                patient.healthProfile?.drugAllergy &&
                patient.healthProfile.drugAllergy !== "ไม่มีประวัติแพ้ยา" &&
                patient.healthProfile.drugAllergy !== "ไม่ทราบประวัติแพ้ยา"
                  ? "bg-clinic-danger-bg border-clinic-danger text-clinic-danger"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <p className="font-bold text-[11px] uppercase tracking-wider mb-1">
                ประวัติแพ้ยา (Drug Allergy)
              </p>
              <p className="text-sm font-semibold">
                {patient.healthProfile?.drugAllergy || "ไม่มีประวัติแพ้ยา"}
              </p>
            </div>

            <dl className="divide-y divide-clinic-line">
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">แพ้อาหาร</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.foodAllergy || "ไม่มี"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">โรคประจำตัว</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.underlyingDisease || "ไม่มี"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">โรคทางพันธุกรรม</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.hereditaryDisease || "ไม่มี"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">ประวัติอุบัติเหตุ/ผ่าตัด</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.accidentHistory || "ไม่มี"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">การดื่มแอลกอฮอล์</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.alcoholConsumption || "ไม่ระบุ"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">การสูบบุหรี่</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.healthProfile?.smokingHistory || "ไม่ระบุ"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Right Column: TTM Principle & Emergency Contacts */}
        <div className="space-y-6 lg:col-span-1">
          {/* TTM Principle Assessment */}
          <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
              <div className="w-7 h-7 rounded-md bg-clinic-accent/15 text-clinic-accent-deep flex items-center justify-center font-bold text-xs">
                🌿
              </div>
              <h2 className="font-display font-bold text-base text-clinic-primary-deep">
                ธาตุเจ้าเรือน (แผนไทย)
              </h2>
            </div>

            <dl className="divide-y divide-clinic-line text-xs">
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">ธาตุเจ้าเรือนหลัก</dt>
                <dd className="font-bold text-clinic-primary-deep text-right">
                  {patient.principle?.principleDhatu || "รอการตรวจวิเคราะห์"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">ธาตุเจ้าเรือนรอง</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.principle?.secondaryDhatu || "-"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">สมุฏฐานอายุ</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.principle?.agePrinciples || "-"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-clinic-ink-soft">สมุฏฐานกาล</dt>
                <dd className="font-semibold text-clinic-ink text-right">
                  {patient.principle?.timePrinciples || "-"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Emergency Contacts */}
          <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
              <div className="w-7 h-7 rounded-md bg-clinic-bg text-clinic-primary flex items-center justify-center font-bold text-xs">
                ☎
              </div>
              <h2 className="font-display font-bold text-base text-clinic-primary-deep">
                ผู้ติดต่อกรณีฉุกเฉิน
              </h2>
            </div>

            {patient.contactPersons && patient.contactPersons.length > 0 ? (
              <div className="space-y-3">
                {patient.contactPersons.map((c) => (
                  <div
                    key={c.contactId}
                    className="p-3.5 bg-clinic-bg rounded-control border border-clinic-line text-xs space-y-1"
                  >
                    <p className="font-bold text-clinic-ink text-sm">{c.contactName}</p>
                    <p className="text-clinic-ink-soft">
                      ความสัมพันธ์:{" "}
                      <span className="font-semibold text-clinic-ink">{c.relationship || "-"}</span>
                    </p>
                    <p className="text-clinic-ink-soft font-mono">
                      เบอร์โทรศัพท์:{" "}
                      <span className="font-semibold text-clinic-primary-deep">
                        {c.mobileNumber || "-"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-clinic-ink-soft text-center py-3">
                ไม่มีข้อมูลผู้ติดต่อกรณีฉุกเฉิน
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
