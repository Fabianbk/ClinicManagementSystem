import { notFound } from "next/navigation";
import { getRecordTreatment } from "@/lib/resources/record-treatments";
import { getPatient } from "@/lib/resources/patients";
import { getDoctor } from "@/lib/resources/doctors";
import { PrintToolbar } from "@/components/print/PrintToolbar";
import { formatThaiDate, formatThaiAddress, formatDoctorDisplayName } from "@/lib/utils";
import { CLINIC_INFO } from "@/lib/constants";

interface MedicalCertificatePrintPageProps {
  params: { treatmentId: string };
  searchParams: {
    sickLeaveDays?: string;
    sickLeaveFrom?: string;
    sickLeaveTo?: string;
  };
}

export default async function MedicalCertificatePrintPage({
  params,
  searchParams,
}: MedicalCertificatePrintPageProps) {
  const treatmentId = Number(params.treatmentId);
  if (isNaN(treatmentId)) {
    notFound();
  }

  const treatment = await getRecordTreatment(treatmentId).catch(() => null);
  if (!treatment) {
    notFound();
  }

  const [patient, doctor] = await Promise.all([
    getPatient(treatment.patientId).catch(() => null),
    treatment.doctorId ? getDoctor(treatment.doctorId).catch(() => null) : Promise.resolve(null),
  ]);

  const hnCode = `P-${String(treatment.patientId).padStart(5, "0")}`;
  const sickLeaveDays = searchParams.sickLeaveDays ? Number(searchParams.sickLeaveDays) : null;
  const sickLeaveFrom = searchParams.sickLeaveFrom || "";
  const sickLeaveTo = searchParams.sickLeaveTo || "";

  const fullAddress = formatThaiAddress(patient);
  const doctorLicenseNo = doctor?.physicianLicenseNo || CLINIC_INFO.defaultDoctorLicenseNo;

  const docxQuery = new URLSearchParams();
  if (sickLeaveDays) docxQuery.set("sickLeaveDays", String(sickLeaveDays));
  if (sickLeaveFrom) docxQuery.set("sickLeaveFrom", sickLeaveFrom);
  if (sickLeaveTo) docxQuery.set("sickLeaveTo", sickLeaveTo);
  const docxUrl = `/api/documents/medical-certificate/${treatment.recordTreatmentId}${docxQuery.toString() ? `?${docxQuery.toString()}` : ""}`;

  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle={`ใบรับรองแพทย์ (Medical Certificate) - ${treatment.patientFullname}`}
        subtitle={`HN: ${hnCode} · เวชระเบียน #${treatment.recordTreatmentId}`}
        docxUrl={docxUrl}
        docxFilename={`medical-certificate-${treatment.recordTreatmentId}.docx`}
      />

      {/* 1-Page Official Medical Certificate */}
      <main className="a4-sheet space-y-6 text-sm font-body text-slate-900 leading-relaxed p-8 sm:p-12">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {CLINIC_INFO.nameTh}
          </h2>
          <p className="text-xs text-slate-600">
            {CLINIC_INFO.nameEn} · ใบอนุญาตให้จัดตั้งคลินิกเลขที่ {CLINIC_INFO.licenseNo}
          </p>
          <p className="text-xs text-slate-600">
            {CLINIC_INFO.addressTh} · โทร. {CLINIC_INFO.phone}
          </p>
          <div className="inline-block mt-2 px-4 py-1 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded-xs">
            ใบรับรองแพทย์ (MEDICAL CERTIFICATE)
          </div>
        </div>

        {/* Certificate Body */}
        <div className="space-y-5 pt-2 text-justify text-[13px] leading-8">
          <div className="text-right text-xs text-slate-600">
            วันที่ออกใบรับรอง: <strong className="text-slate-900 font-medium">{formatThaiDate(treatment.recordDate)}</strong>
          </div>

          <p className="indent-8">
            ข้าพเจ้า <strong className="text-slate-900 border-b border-dotted border-slate-400 px-1 font-bold">{formatDoctorDisplayName(treatment.doctorFullname)}</strong> ผู้ประกอบวิชาชีพการแพทย์แผนไทย ใบอนุญาตประกอบวิชาชีพเลขที่ <strong className="border-b border-dotted border-slate-400 px-1 font-mono">{doctorLicenseNo}</strong> ประจำ{CLINIC_INFO.nameTh}
          </p>

          <p className="indent-8">
            ได้ทำการตรวจร่างกาย <strong className="text-slate-900 border-b border-dotted border-slate-400 px-1 font-bold">{treatment.patientFullname}</strong> รหัสเวชระเบียน (HN): <strong className="border-b border-dotted border-slate-400 px-1 font-mono font-bold text-emerald-900">{hnCode}</strong> เลขประจำตัวประชาชน: <strong className="border-b border-dotted border-slate-400 px-1 font-mono">{patient?.nationalId || patient?.passportNo || "-"}</strong> ที่อยู่: <span className="border-b border-dotted border-slate-400 px-1">{fullAddress || "-"}</span>
          </p>

          <p className="indent-8">
            เมื่อวันที่ <strong className="border-b border-dotted border-slate-400 px-1">{formatThaiDate(treatment.recordDate)}</strong> มีอาการสำคัญ: <span className="border-b border-dotted border-slate-400 px-1 font-medium">{treatment.symptoms || "-"}</span>
          </p>

          <p className="indent-8">
            ผลการตรวจวินิจฉัยโรคทางการแพทย์แผนไทย: <strong className="text-emerald-950 border-b border-dotted border-slate-400 px-1 text-base">{treatment.ttmDiagnosis || "ไม่ได้ระบุ"}</strong> {treatment.modernDiagnosis ? `(การแพทย์แผนปัจจุบัน: ${treatment.modernDiagnosis})` : ""}
          </p>

          <p className="indent-8">
            การรักษาที่ได้รับ: <span className="border-b border-dotted border-slate-400 px-1">{treatment.treatmentPlan || treatment.treatmentProgram || "หัตถการบำบัดทางการแพทย์แผนไทยและสั่งจ่ายยาสมุนไพร"}</span>
          </p>

          {/* Doctor Opinion & Sick Leave */}
          <div className="p-4 border border-slate-300 rounded bg-slate-50/60 space-y-2 mt-4">
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">
              ความเห็นของแพทย์ผู้ตรวจรักษา:
            </span>
            {sickLeaveDays && sickLeaveDays > 0 ? (
              <p className="text-slate-800 leading-relaxed indent-6">
                เห็นสมควรให้ผู้ป่วยรายนี้ <strong>หยุดพักรักษาตัวและงดการทำงานหนักเป็นเวลา {sickLeaveDays} วัน</strong> {sickLeaveFrom ? `ตั้งแต่วันที่ ${sickLeaveFrom}` : ""} {sickLeaveTo ? `ถึงวันที่ ${sickLeaveTo}` : ""} เพื่อให้ร่างกายฟื้นตัวจากการรักษา
              </p>
            ) : (
              <p className="text-slate-800 leading-relaxed indent-6">
                เห็นสมควรให้ผู้ป่วยปฏิบัติตามคำแนะนำของแพทย์ และหลีกเลี่ยงพฤติกรรมเสี่ยงที่อาจกระตุ้นให้อาการกำเริบ
              </p>
            )}
          </div>
        </div>

        {/* Doctor Signature & Clinic Stamp */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded text-slate-400 h-32">
            <span>( ประทับตราคลินิก / Clinic Seal )</span>
          </div>

          <div className="space-y-5 flex flex-col justify-end">
            <p className="text-slate-700">ลงชื่อ ................................................................</p>
            <p className="font-bold text-slate-900 text-sm">
              ({formatDoctorDisplayName(treatment.doctorFullname)})
            </p>
            <p className="text-slate-600 text-xs">
              แพทย์แผนไทยผู้ตรวจรักษา
            </p>
            <p className="text-[11px] text-slate-500">
              วันที่ {formatThaiDate(treatment.recordDate)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
