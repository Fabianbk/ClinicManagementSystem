import { notFound } from "next/navigation";
import { getRecordTreatment } from "@/lib/resources/record-treatments";
import { getPatient } from "@/lib/resources/patients";
import { PrintToolbar } from "@/components/print/PrintToolbar";
import { formatThaiDate, formatDoctorDisplayName } from "@/lib/utils";
import { CLINIC_INFO } from "@/lib/constants";

interface ContinuedPrintPageProps {
  params: { treatmentId: string };
}

export default async function ContinuedPrintPage({ params }: ContinuedPrintPageProps) {
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

  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle={`แบบบันทึกข้อมูลการรักษาต่อเนื่อง (1 หน้า) - ${treatment.patientFullname}`}
        subtitle={`HN: ${hnCode} · เวชระเบียน #${treatment.recordTreatmentId} · ตรวจเมื่อ ${formatThaiDate(treatment.recordDate)}`}
        docxUrl={`/api/documents/intake-form/treatment/${treatment.recordTreatmentId}/continued`}
        docxFilename={`treatment-record-continued-${treatment.recordTreatmentId}.docx`}
      />

      {/* 1-Page Continued Treatment Record */}
      <main className="a4-sheet space-y-3.5 text-xs font-body text-slate-900 leading-relaxed">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-2">
          <div className="flex justify-between items-center text-[10px] text-slate-600 mb-0.5">
            <span>{CLINIC_INFO.nameTh} ({CLINIC_INFO.phone})</span>
            <span className="font-bold text-slate-900">แบบบันทึกการรักษาต่อเนื่อง (CONTINUED VISIT)</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            แบบบันทึกข้อมูลผู้รับบริการและผลการตรวจรักษา (รักษาต่อเนื่อง)
          </h2>
          <p className="text-xs text-slate-700">
            เวชระเบียนเลขที่: <strong className="font-mono">#{treatment.recordTreatmentId}</strong> · วันที่ตรวจ: {formatThaiDate(treatment.recordDate)}
          </p>
        </div>

        {/* Patient Summary Bar */}
        <div className="border border-slate-400 p-2.5 rounded-xs bg-slate-50 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-600">ชื่อ - สกุล: </span>
            <strong className="text-slate-900">{treatment.patientFullname}</strong>
          </div>
          <div className="font-mono font-bold text-emerald-800">
            HN: {hnCode}
          </div>
          <div>
            <span className="text-slate-600">เพศ: </span>
            <span>{patient?.gender === "MALE" ? "ชาย" : patient?.gender === "FEMALE" ? "หญิง" : "-"}</span>
          </div>
          <div>
            <span className="text-slate-600">อายุ: </span>
            <span>{age} ปี</span>
          </div>
          <div>
            <span className="text-slate-600">โทร: </span>
            <span className="font-mono">{patient?.mobileNumber || "-"}</span>
          </div>
        </div>

        {/* Vital Signs Table */}
        <div className="border border-slate-400 p-2.5 rounded-xs space-y-1.5">
          <span className="font-bold text-xs text-slate-800 uppercase block">
            สัญญาณชีพและการประเมินกายภาพ (Vital Signs & Metrics):
          </span>
          <div className="grid grid-cols-7 gap-2 text-center text-[11px]">
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[9px]">BP</span>
              <strong className="font-mono">{treatment.bp || "-"}</strong>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[9px]">Pulse</span>
              <strong className="font-mono">{treatment.pulse || "-"}</strong>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[9px]">RR</span>
              <strong className="font-mono">{treatment.respirationRate || "-"}</strong>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[9px]">Temp</span>
              <strong className="font-mono">{treatment.temp ? `${treatment.temp}°C` : "-"}</strong>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[9px]">Weight</span>
              <strong className="font-mono">{treatment.weight ? `${treatment.weight}kg` : "-"}</strong>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[9px]">Height</span>
              <strong className="font-mono">{treatment.height ? `${treatment.height}cm` : "-"}</strong>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[9px]">BMI</span>
              <strong className="font-mono">{treatment.bmi || "-"}</strong>
            </div>
          </div>
        </div>

        {/* Symptoms & Pain Score */}
        <div className="border border-slate-400 p-2.5 rounded-xs space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="font-bold text-slate-800 block">อาการปัจจุบันและการเปลี่ยนแปลง (Current Symptoms):</span>
              <p className="p-1.5 bg-slate-50 border border-slate-200 rounded mt-0.5 text-slate-800 font-medium">
                {treatment.symptoms || "ไม่มีการเปลี่ยนแปลงเป็นพิเศษ"}
              </p>
            </div>
            <div className="w-56 p-1.5 border border-slate-300 rounded bg-slate-50 text-center shrink-0">
              <span className="text-slate-600 block text-[10px]">ระดับความเจ็บปวด (Pain Score 0-10):</span>
              <div className="flex justify-around items-center pt-1 font-mono font-bold">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">ก่อนตรวจ</span>
                  <span className="text-sm text-rose-700">{treatment.painScoreBefore ?? "-"}</span>
                </div>
                <span className="text-slate-300">→</span>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">หลังตรวจ</span>
                  <span className="text-sm text-emerald-700">{treatment.painScoreAfter ?? "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflexes Table */}
        <div className="border border-slate-400 p-2.5 rounded-xs space-y-1.5">
          <span className="font-bold text-xs text-slate-800 uppercase block">
            การตรวจรีเฟล็กซ์ (Deep Tendon Reflexes):
          </span>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[10px]">Biceps</span>
              <span className="font-mono font-medium">ขวา: {treatment.bicepRt || "-"} | ซ้าย: {treatment.bicepLt || "-"}</span>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[10px]">Triceps</span>
              <span className="font-mono font-medium">ขวา: {treatment.tricepsRt || "-"} | ซ้าย: {treatment.tricepsLt || "-"}</span>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[10px]">Knee Jerk</span>
              <span className="font-mono font-medium">ขวา: {treatment.kneeRt || "-"} | ซ้าย: {treatment.kneeLt || "-"}</span>
            </div>
            <div className="p-1 border border-slate-200 bg-white rounded">
              <span className="text-slate-500 block text-[10px]">Ankle Jerk</span>
              <span className="font-mono font-medium">ขวา: {treatment.ankleRt || "-"} | ซ้าย: {treatment.ankleLt || "-"}</span>
            </div>
          </div>
        </div>

        {/* Diagnosis & Treatment Program */}
        <div className="border border-slate-400 p-2.5 rounded-xs space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-bold text-slate-800 block">การวินิจฉัยแพทย์แผนไทย (TTM Diagnosis):</span>
              <p className="p-1.5 bg-emerald-50 border border-emerald-200 rounded font-semibold text-emerald-950 mt-0.5">
                {treatment.ttmDiagnosis || "-"}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">การวินิจฉัยแผนปัจจุบัน (Modern Diagnosis):</span>
              <p className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 mt-0.5">
                {treatment.modernDiagnosis || "-"}
              </p>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 block">หัตถการและแผนการรักษาต่อเนื่อง:</span>
            <p className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 mt-0.5">
              {treatment.treatmentPlan || treatment.treatmentProgram || "-"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-bold text-slate-800 block">คำแนะนำและการปฏิบัติตัว:</span>
              <p className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 mt-0.5">
                {treatment.suggestions || "ปฏิบัติตามคำแนะนำของแพทย์"}
              </p>
            </div>
            <div>
              <span className="font-bold text-emerald-900 block">วันนัดหมายครั้งต่อไป (Follow-up):</span>
              <p className="p-1.5 bg-emerald-50/70 border border-emerald-300 rounded font-bold text-emerald-950 mt-0.5">
                {treatment.followup || "ไม่มีนัดหมายต่อเนื่อง"}
              </p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-4">
            <p className="text-slate-600">ลงชื่อผู้รับบริการ</p>
            <p className="font-medium text-slate-900">({treatment.patientFullname})</p>
            <p className="text-[10px] text-slate-500">วันที่ {formatThaiDate(treatment.recordDate)}</p>
          </div>
          <div className="space-y-4">
            <p className="text-slate-600">ลงชื่อแพทย์แผนไทยผู้ตรวจรักษา</p>
            <p className="font-bold text-slate-900">({formatDoctorDisplayName(treatment.doctorFullname)})</p>
            <p className="text-[10px] text-slate-500">แพทย์แผนไทยประจำ{CLINIC_INFO.nameTh}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
