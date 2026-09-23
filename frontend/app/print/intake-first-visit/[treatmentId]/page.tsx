import { notFound } from "next/navigation";
import { getRecordTreatment } from "@/lib/resources/record-treatments";
import { getPatient } from "@/lib/resources/patients";
import { PrintToolbar } from "@/components/print/PrintToolbar";
import { formatThaiDate, formatDoctorDisplayName } from "@/lib/utils";

interface FirstVisitPrintPageProps {
  params: { treatmentId: string };
}

export default async function FirstVisitPrintPage({ params }: FirstVisitPrintPageProps) {
  const treatmentId = Number(params.treatmentId);
  if (isNaN(treatmentId)) {
    notFound();
  }

  const treatment = await getRecordTreatment(treatmentId).catch(() => null);
  if (!treatment) {
    notFound();
  }

  const patient = await getPatient(treatment.patientId).catch(() => null);

  const hnCode = `P-${String(treatment.patientId).padStart(5, "0")}`;
  const age = patient?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "-";

  const fullAddress = [
    patient?.houseNo ? `บ้านเลขที่ ${patient.houseNo}` : "",
    patient?.moo ? `หมู่ ${patient.moo}` : "",
    patient?.soi ? `ซอย ${patient.soi}` : "",
    patient?.road ? `ถนน ${patient.road}` : "",
    patient?.subDistrict ? `ตำบล/แขวง ${patient.subDistrict}` : "",
    patient?.district ? `อำเภอ/เขต ${patient.district}` : "",
    patient?.province ? `จังหวัด ${patient.province}` : "",
    patient?.zipCode || "",
  ]
    .filter(Boolean)
    .join(" ");

  const emergency = patient?.contactPersons?.[0];

  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle={`แบบบันทึกข้อมูลผู้รับบริการ (ครั้งแรก 4 หน้า) - ${treatment.patientFullname}`}
        subtitle={`HN: ${hnCode} · เวชระเบียน #${treatment.recordTreatmentId} · ตรวจเมื่อ ${formatThaiDate(treatment.recordDate)}`}
        docxUrl={`/api/documents/intake-form/treatment/${treatment.recordTreatmentId}`}
        docxFilename={`treatment-record-first-visit-${treatment.recordTreatmentId}.docx`}
      />

      {/* Page 1: ข้อมูลทั่วไป + ประวัติสุขภาพ */}
      <main className="a4-sheet print-page space-y-4 text-xs font-body text-slate-900 leading-relaxed">
        <div className="text-center border-b-2 border-slate-900 pb-2">
          <div className="flex justify-between items-start text-[10px] text-slate-500 mb-1">
            <span>พิมพ์วิมานคลินิกการแพทย์แผนไทย (081-9358026)</span>
            <span className="font-bold text-slate-900">หน้า ๑ จาก ๔ (สำหรับผู้รับบริการครั้งแรก)</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            แบบบันทึกข้อมูลผู้รับบริการและผลการตรวจรักษา (CLIENT INTAKE RECORD)
          </h2>
          <p className="text-xs text-slate-700">
            เลขที่เวชระเบียน: <strong className="font-mono">#{treatment.recordTreatmentId}</strong> · วันที่ตรวจ: {formatThaiDate(treatment.recordDate)}
          </p>
        </div>

        {/* ส่วนที่ ๑ ข้อมูลทั่วไป */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            ส่วนที่ ๑: ข้อมูลทั่วไปของผู้รับบริการ (Personal Information)
          </h3>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8">
              <span className="text-slate-600">ชื่อ - นามสกุล: </span>
              <strong className="text-slate-900">{treatment.patientFullname}</strong>
            </div>
            <div className="col-span-4 font-mono font-bold text-emerald-800">
              HN: {hnCode}
            </div>
            <div className="col-span-4">
              <span className="text-slate-600">เพศ: </span>
              <span>{patient?.gender === "MALE" ? "ชาย" : patient?.gender === "FEMALE" ? "หญิง" : "-"}</span>
            </div>
            <div className="col-span-4">
              <span className="text-slate-600">อายุ: </span>
              <span>{age} ปี</span>
            </div>
            <div className="col-span-4">
              <span className="text-slate-600">อาชีพ: </span>
              <span>{patient?.occupation || "-"}</span>
            </div>
            <div className="col-span-6">
              <span className="text-slate-600">เลขบัตร ปชช. / Passport: </span>
              <span className="font-mono font-bold">{patient?.nationalId || patient?.passportNo || "-"}</span>
            </div>
            <div className="col-span-6">
              <span className="text-slate-600">เบอร์โทรศัพท์: </span>
              <span className="font-mono">{patient?.mobileNumber || "-"}</span>
            </div>
            <div className="col-span-12">
              <span className="text-slate-600">ที่อยู่ปัจจุบัน: </span>
              <span>{fullAddress || "-"}</span>
            </div>
            <div className="col-span-12 pt-1 border-t border-slate-200">
              <span className="text-slate-600">ผู้ติดต่อฉุกเฉิน: </span>
              <span>
                {emergency
                  ? `${emergency.contactName} (${emergency.relationship || "ญาติ"}) โทร. ${emergency.mobileNumber || "-"}`
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* ส่วนที่ ๒ ประวัติสุขภาพ */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2.5">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            ส่วนที่ ๒: ประวัติสุขภาพและการเจ็บป่วย (Health & Illness History)
          </h3>

          <div>
            <span className="font-bold text-slate-800 block">อาการสำคัญที่มารับการตรวจ (Chief Complaint):</span>
            <p className="p-2 bg-slate-50 border border-slate-200 rounded mt-0.5 text-slate-900 font-medium">
              {treatment.symptoms || "ไม่ได้ระบุ"}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block">ประวัติการเจ็บป่วยปัจจุบัน (Present Illness):</span>
            <p className="p-2 bg-slate-50 border border-slate-200 rounded mt-0.5 text-slate-800">
              {treatment.presentHistory || "ไม่มี"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-bold text-slate-800 block">โรคประจำตัว (Underlying Disease):</span>
              <p className="p-1.5 bg-slate-50 border border-slate-200 rounded mt-0.5">
                {patient?.healthProfile?.underlyingDisease || "ปฏิเสธ / ไม่มี"}
              </p>
            </div>
            <div>
              <span className="font-bold text-rose-800 block">ประวัติการแพ้ยา (Drug Allergy):</span>
              <p className="p-1.5 bg-rose-50 border border-rose-200 rounded mt-0.5 font-bold text-rose-900">
                {patient?.healthProfile?.drugAllergy || "ปฏิเสธประวัติแพ้ยา"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-700 block">ประวัติการเจ็บป่วยในครอบครัว (Family History):</span>
              <p className="p-1.5 bg-slate-50 border border-slate-200 rounded mt-0.5 text-slate-800">
                {patient?.healthProfile?.hereditaryDisease || "-"}
              </p>
            </div>
            <div>
              <span className="text-slate-700 block">ประวัติอุบัติเหตุ / ผ่าตัด (Accident & Surgery):</span>
              <p className="p-1.5 bg-slate-50 border border-slate-200 rounded mt-0.5 text-slate-800">
                {patient?.healthProfile?.accidentHistory || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-400 pt-8">
          แบบบันทึกเวชระเบียน พิมพ์วิมานคลินิก · หน้า ๑
        </div>
      </main>

      {/* Page 2: ธาตุสมุฏฐานและการตรวจสัญญาณชีพ */}
      <main className="a4-sheet print-page space-y-4 text-xs font-body text-slate-900 leading-relaxed mt-6 print:mt-0">
        <div className="flex justify-between items-center border-b border-slate-400 pb-2">
          <span className="font-bold text-xs text-slate-800">
            ผู้ป่วย: {treatment.patientFullname} (HN: {hnCode})
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            หน้า ๒ จาก ๔ (ธาตุสมุฏฐานและสัญญาณชีพ)
          </span>
        </div>

        {/* สัญญาณชีพ (Vital Signs) */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            สัญญาณชีพและข้อมูลกายภาพ (Vital Signs & Physical Metrics)
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2 border border-slate-300 rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">ความดันโลหิต (BP)</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {treatment.bp || "-"} <span className="text-[10px] font-normal">mmHg</span>
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">ชีพจร (Pulse)</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {treatment.pulse || "-"} <span className="text-[10px] font-normal">bpm</span>
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">อัตราหายใจ (RR)</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {treatment.respirationRate || "-"} <span className="text-[10px] font-normal">/min</span>
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">อุณหภูมิ (Temp)</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {treatment.temp || "-"} <span className="text-[10px] font-normal">°C</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-slate-200">
            <div>
              <span className="text-slate-500 text-[10px]">น้ำหนัก (Weight): </span>
              <strong className="font-mono">{treatment.weight || "-"} kg</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">ส่วนสูง (Height): </span>
              <strong className="font-mono">{treatment.height || "-"} cm</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">ดัชนีมวลกาย (BMI): </span>
              <strong className="font-mono">{treatment.bmi || "-"}</strong>
            </div>
          </div>
        </div>

        {/* ส่วนที่ ๓ ธาตุสมุฏฐาน */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2.5">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            ส่วนที่ ๓: การวิเคราะห์ธาตุสมุฏฐาน (Dhatu & Constitution Analysis)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-600 block text-[11px]">ธาตุเจ้าเรือนกำเนิด:</span>
              <strong className="text-sm text-emerald-900">
                {patient?.principle?.principalDhatu ? `ธาตุ${patient.principle.principalDhatu}` : "-"}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-600 block text-[11px]">ธาตุสมุฏฐานที่พิการ/หย่อน/กำเริบ:</span>
              <strong className="text-sm text-slate-900">
                {treatment.diagnosisElements || "ไม่ได้ระบุ"}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="font-bold text-slate-800 block">สรุปการเกิดโรคตามหลักเวชกรรมไทย:</span>
            <p className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800">
              {treatment.summaryOfSickness || "-"}
            </p>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-400 pt-8">
          แบบบันทึกเวชระเบียน พิมพ์วิมานคลินิก · หน้า ๒
        </div>
      </main>

      {/* Page 3: ตรวจร่างกายและการประเมิน Reflexes/Causes */}
      <main className="a4-sheet print-page space-y-4 text-xs font-body text-slate-900 leading-relaxed mt-6 print:mt-0">
        <div className="flex justify-between items-center border-b border-slate-400 pb-2">
          <span className="font-bold text-xs text-slate-800">
            ผู้ป่วย: {treatment.patientFullname} (HN: {hnCode})
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            หน้า ๓ จาก ๔ (ตรวจร่างกายและระบบประสาท)
          </span>
        </div>

        {/* Deep Tendon Reflexes Table */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            การตรวจรีเฟล็กซ์และการเคลื่อนไหว (Deep Tendon Reflexes & ROM)
          </h3>

          <table className="w-full text-center border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-[11px]">
              <tr>
                <th className="border border-slate-300 p-1.5 text-left">ตำแหน่งตรวจ (Location)</th>
                <th className="border border-slate-300 p-1.5 w-32">ข้างขวา (RT)</th>
                <th className="border border-slate-300 p-1.5 w-32">ข้างซ้าย (LT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-medium">Biceps Reflex</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.bicepRt || "-"}</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.bicepLt || "-"}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-medium">Triceps Reflex</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.tricepsRt || "-"}</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.tricepsLt || "-"}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-medium">Knee Jerk Reflex</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.kneeRt || "-"}</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.kneeLt || "-"}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 text-left font-medium">Ankle Jerk Reflex</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.ankleRt || "-"}</td>
                <td className="border border-slate-300 p-1.5 font-mono">{treatment.ankleLt || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* มูลเหตุแห่งการเกิดโรค ๘ ประการ */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            มูลเหตุแห่งการเกิดโรคทางเวชกรรมไทย (Causes of Symptoms)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { key: "FOOD", label: "อาหาร (Food)" },
              { key: "POSTURE", label: "อิริยาบถ (Posture/Position)" },
              { key: "WEATHER", label: "ความร้อน-เย็น (Weather)" },
              { key: "FASTING_LACK_SLEEP", label: "อดนอน อดข้าว (Lack of sleep/fasting)" },
              { key: "SUPPRESS_URGES", label: "กลั้นอุจจาระปัสสาวะ (Suppress urges)" },
              { key: "OVEREXERTION", label: "ทำงานเกินกำลัง (Overexertion)" },
              { key: "SADNESS", label: "ความเศร้าโศกเสียใจ (Sadness)" },
              { key: "ANGER", label: "ความโกรธ (Anger)" },
            ].map((cause) => {
              const checked = treatment.causesOfSymptoms?.includes(cause.key as any);
              return (
                <div key={cause.key} className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-slate-700 inline-block text-center leading-3 font-bold">
                    {checked ? "✓" : ""}
                  </span>
                  <span>{cause.label}</span>
                </div>
              );
            })}
          </div>
          {treatment.causeOfSymptomsOther && (
            <p className="pt-1 text-slate-700 text-[11px]">
              สาเหตุอื่นๆ: {treatment.causeOfSymptomsOther}
            </p>
          )}
        </div>

        <div className="text-right text-[10px] text-slate-400 pt-8">
          แบบบันทึกเวชระเบียน พิมพ์วิมานคลินิก · หน้า ๓
        </div>
      </main>

      {/* Page 4: การวินิจฉัย แผนการรักษา และการลงชื่อ */}
      <main className="a4-sheet print-page space-y-4 text-xs font-body text-slate-900 leading-relaxed mt-6 print:mt-0">
        <div className="flex justify-between items-center border-b border-slate-400 pb-2">
          <span className="font-bold text-xs text-slate-800">
            ผู้ป่วย: {treatment.patientFullname} (HN: {hnCode})
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            หน้า ๔ จาก ๔ (การวินิจฉัยและแผนการรักษา)
          </span>
        </div>

        {/* การวินิจฉัย (Diagnosis) */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            การวินิจฉัยโรค (Diagnosis)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-600 block text-[11px]">การวินิจฉัยการแพทย์แผนไทย (TTM Diagnosis):</span>
              <p className="p-2 bg-emerald-50/50 border border-emerald-300 rounded font-bold text-emerald-950 mt-0.5">
                {treatment.ttmDiagnosis || "ไม่ได้ระบุ"}
              </p>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px]">การวินิจฉัยการแพทย์แผนปัจจุบัน (Modern Diagnosis):</span>
              <p className="p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800 mt-0.5">
                {treatment.modernDiagnosis || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* แผนการรักษาและการประเมินความเจ็บปวด */}
        <div className="border border-slate-400 p-3 rounded-xs space-y-2.5">
          <h3 className="font-bold text-xs uppercase bg-slate-100 p-1 rounded border-l-3 border-emerald-800">
            แผนการรักษาและผลการประเมิน (Treatment Plan & Evaluation)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-slate-50 border border-slate-300 rounded text-center">
              <span className="text-slate-600 block text-[11px]">ระดับความเจ็บปวดก่อนรักษา (Pain Score Before):</span>
              <span className="text-lg font-bold font-mono text-rose-700">{treatment.painScoreBefore ?? "-"} / 10</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-300 rounded text-center">
              <span className="text-slate-600 block text-[11px]">ระดับความเจ็บปวดหลังรักษา (Pain Score After):</span>
              <span className="text-lg font-bold font-mono text-emerald-700">{treatment.painScoreAfter ?? "-"} / 10</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 block">หัตถการ / แผนการรักษาที่ทำ:</span>
            <p className="p-2 bg-slate-50 border border-slate-200 rounded mt-0.5 text-slate-800">
              {treatment.treatmentPlan || treatment.treatmentProgram || "-"}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block">คำแนะนำการปฏิบัติตัวและข้อห้ามทางเวชปฏิบัติ:</span>
            <p className="p-2 bg-slate-50 border border-slate-200 rounded mt-0.5 text-slate-800">
              {treatment.suggestions || "ปฏิบัติตามคำแนะนำของแพทย์อย่างเคร่งครัด"}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block">การนัดหมายติดตามผล (Follow-up):</span>
            <p className="p-2 bg-slate-50 border border-slate-200 rounded mt-0.5 font-medium text-emerald-900">
              {treatment.followup || "ไม่มีนัดหมายต่อเนื่อง"}
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-6">
            <p className="text-slate-600">ลงชื่อผู้รับบริการ</p>
            <p className="font-medium text-slate-900">({treatment.patientFullname})</p>
            <p className="text-[10px] text-slate-500">วันที่ {formatThaiDate(treatment.recordDate)}</p>
          </div>
          <div className="space-y-6">
            <p className="text-slate-600">ลงชื่อแพทย์แผนไทยผู้ตรวจรักษา</p>
            <p className="font-bold text-slate-900">({formatDoctorDisplayName(treatment.doctorFullname)})</p>
            <p className="text-[10px] text-slate-500">แพทย์แผนไทยประจำพิมพ์วิมานคลินิก</p>
          </div>
        </div>
      </main>
    </div>
  );
}
