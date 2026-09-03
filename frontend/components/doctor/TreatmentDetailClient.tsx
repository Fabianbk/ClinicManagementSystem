"use client";

import Link from "next/link";
import type { RecordTreatmentResponseDTO, PatientResponseDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Edit, Leaf, ShieldAlert } from "lucide-react";
import { DownloadDocxButton } from "@/components/doctor/DownloadDocxButton";

interface TreatmentDetailClientProps {
  treatment: RecordTreatmentResponseDTO;
  patient: PatientResponseDTO | null;
  currentDoctorId: number;
}

function formatDateThaiFull(dateInput: string | Date | undefined): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SYMPTOM_CAUSE_MAP: Record<string, string> = {
  FOOD: "อาหาร (Food)",
  POSTURE: "อิริยาบถ (Position/Posture)",
  WEATHER: "ความร้อน-ความเย็น (Weather/Temperature)",
  FASTING_LACK_SLEEP: "อดนอน อดข้าว อดน้ำ (Fasting & lack of sleep)",
  SUPPRESS_URGES: "กลั้นอุจจาระปัสสาวะ (Incontinence)",
  OVEREXERTION: "ทำงานเกินกำลัง (Overexertion)",
  SADNESS: "ความเศร้าโศกเสียใจ (Sadness)",
  ANGER: "ความโกรธ (Wrath/Anger)",
  OTHER: "อื่นๆ (Other)",
};

export function TreatmentDetailClient({
  treatment,
  patient,
  currentDoctorId,
}: TreatmentDetailClientProps) {
  const medicines = treatment.recordTreatmentMedicines || [];
  const receipt = treatment.receipt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 font-body text-clinic-ink">
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-2xs">
          <Link href="/doctor/treatments">
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปยังรายการเวชระเบียน</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2.5">
          <DownloadDocxButton
            recordTreatmentId={treatment.recordTreatmentId}
            label="ดาวน์โหลดแบบบันทึก (Word)"
            className="gap-1.5 shadow-2xs text-clinic-primary font-semibold"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 shadow-2xs text-clinic-primary font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์เวชระเบียน / ใบสั่งยา</span>
          </Button>

          <Button asChild variant="terracotta" size="sm" className="gap-1.5 shadow-xs font-semibold">
            <Link href={`/doctor/treatments/${treatment.recordTreatmentId}/edit`}>
              <Edit className="w-4 h-4" />
              <span>แก้ไขข้อมูลการรักษา</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Treatment Document (Print-friendly format) */}
      <div className="bg-white border border-clinic-line rounded-card p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="text-center border-b border-clinic-line pb-5 space-y-1">
          <h1 className="font-display font-bold text-xl text-clinic-primary-deep">
            แบบบันทึกข้อมูลผู้รับบริการและใบสั่งการรักษา (Client Intake & Treatment Record)
          </h1>
          <p className="text-sm font-semibold text-clinic-ink">
            พิมพ์วิมานคลินิกการแพทย์แผนไทย (Pimvimaan Thai Traditional Clinic) · 081-9358026
          </p>
          <p className="text-xs text-clinic-ink-soft">
            เวชระเบียนเลขที่: <strong className="text-clinic-ink font-mono">#{treatment.recordTreatmentId}</strong> · นัดหมายเลขที่: #{treatment.appointmentId} · วันที่ตรวจ: {formatDateThaiFull(treatment.recordDate)}
          </p>
        </div>

        {/* Section 1: ข้อมูลผู้รับบริการ (Part 1 Personal Info) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-clinic-primary-deep bg-clinic-primary-soft px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๑: ข้อมูลทั่วไป (Personal Information)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-clinic-ink-soft">ชื่อ-สกุล:</span>{" "}
              <strong className="text-clinic-ink">{treatment.patientFullname}</strong>
            </div>
            <div>
              <span className="text-clinic-ink-soft">เลขที่บัตร (OPD):</span>{" "}
              <strong className="text-clinic-ink font-mono">#{treatment.patientId}</strong>
            </div>
            <div>
              <span className="text-clinic-ink-soft">เพศ:</span>{" "}
              <strong className="text-clinic-ink">{patient?.gender || "-"}</strong>
            </div>
            <div>
              <span className="text-clinic-ink-soft">วันเกิด:</span>{" "}
              <strong className="text-clinic-ink">
                {patient?.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString("th-TH")
                  : "-"}
              </strong>
            </div>
            <div>
              <span className="text-clinic-ink-soft">เลขบัตรประชาชน:</span>{" "}
              <strong className="text-clinic-ink font-mono">{patient?.idNumber || "-"}</strong>
            </div>
            <div>
              <span className="text-clinic-ink-soft">เบอร์โทรศัพท์:</span>{" "}
              <strong className="text-clinic-ink">{patient?.mobileNumber || "-"}</strong>
            </div>
            <div>
              <span className="text-clinic-ink-soft">สถานภาพ:</span>{" "}
              <span className="text-clinic-ink">{patient?.marital || "โสด"}</span>
            </div>
            <div>
              <span className="text-clinic-ink-soft">อาชีพ:</span>{" "}
              <span className="text-clinic-ink">{patient?.occupation || "-"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-clinic-ink-soft">ที่อยู่ปัจจุบัน:</span>{" "}
              <span className="text-clinic-ink">{patient?.address || "-"}</span>
            </div>
          </div>
        </div>

        {/* Section 2: ประวัติการเจ็บป่วย & ธาตุเจ้าเรือน (Part 2 Medical Info) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-clinic-primary-deep bg-clinic-primary-soft px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๒: ประวัติการเจ็บป่วย & ธาตุเจ้าเรือน (General and Medical Information)
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-clinic-bg/60 rounded-control border border-clinic-line">
              <div>
                <span className="text-clinic-ink-soft font-semibold">ธาตุเจ้าเรือนหลัก:</span>{" "}
                <strong className="text-clinic-primary font-bold">
                  {patient?.principle?.principalDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                   patient?.principle?.principalDhatu === "APO" ? "อาโป (น้ำ)" :
                   patient?.principle?.principalDhatu === "VAYO" ? "วาโย (ลม)" :
                   patient?.principle?.principalDhatu === "TECHO" ? "เตโช (ไฟ)" :
                   patient?.principle?.principalDhatu || "-"}
                </strong>
              </div>
              <div>
                <span className="text-clinic-ink-soft font-semibold">ธาตุเจ้าเรือนรอง:</span>{" "}
                <strong className="text-clinic-primary font-bold">
                  {patient?.principle?.secondaryDhatu === "PATHAVI" ? "ปถวี (ดิน)" :
                   patient?.principle?.secondaryDhatu === "APO" ? "อาโป (น้ำ)" :
                   patient?.principle?.secondaryDhatu === "VAYO" ? "วาโย (ลม)" :
                   patient?.principle?.secondaryDhatu === "TECHO" ? "เตโช (ไฟ)" :
                   patient?.principle?.secondaryDhatu || "-"}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line space-y-1">
              <span className="font-bold text-clinic-ink">อาการสำคัญ (Symptoms / Chief Complaint):</span>
              <p className="text-clinic-ink mt-0.5 whitespace-pre-line leading-relaxed">{treatment.symptoms || "-"}</p>
            </div>

            {/* Health profile badges for this visit */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-clinic-bg/40 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">โรคประจำตัว:</span>
                <span className="font-semibold text-clinic-ink">
                  {treatment.healthProfile?.underlyingDisease || "ปฏิเสธโรคประจำตัว"}
                </span>
              </div>
              <div className="p-2 bg-clinic-bg/40 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">การแพ้ยา:</span>
                <span className="font-semibold text-rose-700">
                  {treatment.healthProfile?.drugAllergy || "ปฏิเสธการแพ้ยา"}
                </span>
              </div>
              <div className="p-2 bg-clinic-bg/40 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">การแพ้อาหาร:</span>
                <span className="font-semibold text-amber-700">
                  {treatment.healthProfile?.foodAllergy || "ปฏิเสธการแพ้อาหาร"}
                </span>
              </div>
              <div className="p-2 bg-clinic-bg/40 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">แอลกอฮอล์ / บุหรี่:</span>
                <span className="font-semibold text-clinic-ink">
                  {treatment.healthProfile?.alcoholConsumption || "ปฏิเสธ"} / {treatment.healthProfile?.smokingHistory || "ปฏิเสธ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: ตรวจร่างกาย & สัญญาณชีพ (Part 3 Physical Exam) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-clinic-primary-deep bg-clinic-primary-soft px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๓: การตรวจร่างกายและสัญญาณชีพ (Physical Examination)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs text-center">
            <div className="bg-clinic-bg/40 p-2.5 rounded-control border border-clinic-line">
              <span className="text-clinic-ink-soft block text-[10px]">อุณหภูมิ</span>
              <strong className="text-sm font-mono">{treatment.temp ? `${treatment.temp} °C` : "-"}</strong>
            </div>
            <div className="bg-clinic-bg/40 p-2.5 rounded-control border border-clinic-line">
              <span className="text-clinic-ink-soft block text-[10px]">ชีพจร</span>
              <strong className="text-sm font-mono">{treatment.pulse ? `${treatment.pulse} bpm` : "-"}</strong>
            </div>
            <div className="bg-clinic-bg/40 p-2.5 rounded-control border border-clinic-line">
              <span className="text-clinic-ink-soft block text-[10px]">การหายใจ</span>
              <strong className="text-sm font-mono">{treatment.respirationRate ? `${treatment.respirationRate} /min` : "-"}</strong>
            </div>
            <div className="bg-clinic-bg/40 p-2.5 rounded-control border border-clinic-line">
              <span className="text-clinic-ink-soft block text-[10px]">ความดันโลหิต</span>
              <strong className="text-sm font-mono">{treatment.bp || "-"}</strong>
            </div>
            <div className="bg-clinic-bg/40 p-2.5 rounded-control border border-clinic-line">
              <span className="text-clinic-ink-soft block text-[10px]">ส่วนสูง</span>
              <strong className="text-sm font-mono">{treatment.height ? `${treatment.height} cm` : "-"}</strong>
            </div>
            <div className="bg-clinic-bg/40 p-2.5 rounded-control border border-clinic-line">
              <span className="text-clinic-ink-soft block text-[10px]">น้ำหนัก</span>
              <strong className="text-sm font-mono">{treatment.weight ? `${treatment.weight} kg` : "-"}</strong>
            </div>
            <div className="bg-clinic-bg/40 p-2.5 rounded-control border border-clinic-line">
              <span className="text-clinic-ink-soft block text-[10px]">ดัชนีมวลกาย BMI</span>
              <strong className="text-sm font-mono text-clinic-primary">{treatment.bmi || "-"}</strong>
            </div>
          </div>

          {/* Pain Score Bar */}
          <div className="bg-clinic-bg/30 p-3 rounded-control border border-clinic-line flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-clinic-ink-soft">ระดับความปวดก่อนการรักษา:</span>{" "}
              <strong className="text-amber-800 font-mono text-sm">{treatment.painScoreBefore ?? "-"} / 10</strong>
            </div>
            <div>
              <span className="text-clinic-ink-soft">ระดับความปวดหลังการรักษา:</span>{" "}
              <strong className="text-emerald-700 font-mono text-sm">{treatment.painScoreAfter ?? "-"} / 10</strong>
            </div>
            {treatment.painScoreBefore !== null && treatment.painScoreAfter !== null && (
              <Badge variant="success" className="font-bold">
                ผลการรักษา: ความปวดลดลง {Math.max(0, treatment.painScoreBefore - treatment.painScoreAfter)} ระดับ
              </Badge>
            )}
          </div>

          {/* Deep Tendon Reflexes */}
          {(treatment.bicepRt || treatment.bicepLt || treatment.tricepsRt || treatment.tricepsLt || treatment.kneeRt || treatment.kneeLt || treatment.ankleRt || treatment.ankleLt) && (
            <div className="bg-clinic-bg/40 p-3 rounded-control border border-clinic-line space-y-2 text-xs">
              <span className="font-bold text-clinic-ink block">ผลการตรวจระบบประสาทและรีเฟล็กซ์ (Deep Tendon Reflexes):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded border border-clinic-line">
                  <span className="text-[10px] text-clinic-ink-soft block font-medium">Bicep Jerk</span>
                  <div className="font-mono text-xs font-bold text-clinic-primary-deep mt-0.5">
                    RT: {treatment.bicepRt || "-"} | LT: {treatment.bicepLt || "-"}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-clinic-line">
                  <span className="text-[10px] text-clinic-ink-soft block font-medium">Triceps Jerk</span>
                  <div className="font-mono text-xs font-bold text-clinic-primary-deep mt-0.5">
                    RT: {treatment.tricepsRt || "-"} | LT: {treatment.tricepsLt || "-"}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-clinic-line">
                  <span className="text-[10px] text-clinic-ink-soft block font-medium">Knee Jerk</span>
                  <div className="font-mono text-xs font-bold text-clinic-primary-deep mt-0.5">
                    RT: {treatment.kneeRt || "-"} | LT: {treatment.kneeLt || "-"}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-clinic-line">
                  <span className="text-[10px] text-clinic-ink-soft block font-medium">Ankle Jerk</span>
                  <div className="font-mono text-xs font-bold text-clinic-primary-deep mt-0.5">
                    RT: {treatment.ankleRt || "-"} | LT: {treatment.ankleLt || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {treatment.modernDiagnosis && (
            <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line text-xs">
              <span className="font-bold text-clinic-ink-soft">การวินิจฉัยแผนปัจจุบัน:</span>
              <p className="text-clinic-ink mt-0.5 whitespace-pre-line">{treatment.modernDiagnosis}</p>
            </div>
          )}
        </div>

        {/* Section 4: การวินิจฉัยแพทย์แผนไทย (Part 4 TTM Diagnosis) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-clinic-primary-deep bg-clinic-primary-soft px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๔: การวินิจฉัยทางการแพทย์แผนไทย (Thai Traditional Medical Diagnosis)
          </h2>
          <div className="space-y-2 text-xs">
            {treatment.ttmDiagnosis && (
              <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line">
                <span className="font-bold text-clinic-primary-deep">การวินิจฉัยโรคทางการแพทย์แผนไทย / รหัสโรค:</span>
                <p className="text-clinic-ink font-bold text-sm mt-0.5 text-clinic-primary-deep">{treatment.ttmDiagnosis}</p>
              </div>
            )}

            {((treatment.causesOfSymptoms && treatment.causesOfSymptoms.length > 0) || treatment.causeOfSymptomsOther) && (
              <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line space-y-2">
                <span className="font-bold text-clinic-ink block">มูลเหตุการเกิดโรค (Cause of symptoms):</span>
                <div className="flex flex-wrap gap-1.5">
                  {treatment.causesOfSymptoms?.map((cause) => (
                    <Badge key={cause} variant="default" className="text-xs bg-white border border-clinic-line text-clinic-primary-deep font-semibold">
                      {SYMPTOM_CAUSE_MAP[cause] || cause}
                    </Badge>
                  ))}
                </div>
                {treatment.causeOfSymptomsOther && (
                  <p className="text-xs text-clinic-ink-soft italic pt-0.5">
                    หมายเหตุเพิ่มเติม: {treatment.causeOfSymptomsOther}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: การสั่งการรักษา & ยาสมุนไพร */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-clinic-primary-deep bg-clinic-primary-soft px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๕: หัตถการบำบัดและใบสั่งยาสมุนไพร (Treatment & Prescriptions)
          </h2>

          <div className="space-y-3 text-xs">
            {treatment.treatmentProgram && (
              <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line">
                <span className="font-bold text-clinic-ink">หัตถการทางการแพทย์แผนไทยที่ได้รับ:</span>
                <p className="text-clinic-ink font-medium mt-0.5">{treatment.treatmentProgram}</p>
              </div>
            )}

            {medicines.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-clinic-ink">รายการยาสมุนไพรที่สั่งจ่าย:</span>
                <div className="overflow-x-auto border border-clinic-line rounded-control">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-clinic-bg border-b border-clinic-line text-clinic-ink-soft">
                      <tr>
                        <th className="p-2.5">ลำดับ</th>
                        <th className="p-2.5">รายการยา</th>
                        <th className="p-2.5 text-center">จำนวน</th>
                        <th className="p-2.5 text-right">ราคา/หน่วย (บาท)</th>
                        <th className="p-2.5 text-right">รวมเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-clinic-line bg-white">
                      {medicines.map((m, idx) => (
                        <tr key={m.recordTreatmentMedicineId}>
                          <td className="p-2.5 text-center font-mono">{idx + 1}</td>
                          <td className="p-2.5 font-semibold text-clinic-ink">{m.medicineName}</td>
                          <td className="p-2.5 text-center font-mono">{m.quantity}</td>
                          <td className="p-2.5 text-right font-mono">฿{(m.priceAtTime ?? 0).toLocaleString()}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-clinic-primary">
                            ฿{(m.subTotal ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {treatment.suggestions && (
              <div className="p-3 bg-clinic-bg/40 rounded-control border border-clinic-line">
                <span className="font-bold text-clinic-ink">คำแนะนำการปฏิบัติตัว / ข้อห้ามทางเวชปฏิบัติ:</span>
                <p className="text-clinic-ink mt-0.5 leading-relaxed">{treatment.suggestions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 6: ใบเสร็จรับเงินและการชำระเงิน (Itemized Billing & Receipt) */}
        {receipt && (
          <div className="p-5 bg-white border border-clinic-line rounded-control shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-clinic-line pb-3">
              <div>
                <span className="font-bold text-clinic-primary-deep text-sm block">
                  🧾 ใบเสร็จรับเงิน / ใบแจ้งหนี้ (Receipt #{receipt.receiptId})
                </span>
                <span className="text-[11px] text-clinic-ink-soft">
                  วันที่ออกใบเสร็จ: {formatDateThaiFull(receipt.receiptDate)} · วิธีชำระเงิน: {receipt.paymentMethod || "เงินสด (CASH)"}
                </span>
              </div>
              <Badge variant="success" className="font-bold self-start sm:self-auto">
                {receipt.paymentStatus === "PAID" ? "✓ ชำระเงินเรียบร้อยแล้ว (PAID)" : receipt.paymentStatus}
              </Badge>
            </div>

            {/* Itemized Breakdown Table */}
            <div className="space-y-3">
              <span className="font-bold text-clinic-ink block">รายการแจกแจงค่าใช้จ่าย (Itemized Charges):</span>
              
              <div className="overflow-x-auto border border-clinic-line rounded-control">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-clinic-bg text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                    <tr>
                      <th className="p-2.5">รายการ</th>
                      <th className="p-2.5 text-center">ประเภท</th>
                      <th className="p-2.5 text-center">จำนวน</th>
                      <th className="p-2.5 text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-clinic-line bg-white">
                    {/* Medicines */}
                    {medicines.map((m) => (
                      <tr key={m.recordTreatmentMedicineId} className="hover:bg-clinic-bg/20">
                        <td className="p-2.5 font-medium text-clinic-ink">
                          💊 {m.medicineName}
                        </td>
                        <td className="p-2.5 text-center text-clinic-ink-soft">ยาสมุนไพร</td>
                        <td className="p-2.5 text-center font-mono">{m.quantity}</td>
                        <td className="p-2.5 text-right font-mono text-clinic-ink">
                          ฿{(m.subTotal ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {/* Custom Additional Items */}
                    {receipt.additionalItems?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-clinic-bg/20">
                        <td className="p-2.5 font-medium text-clinic-ink">
                          ➕ {item.itemName}
                        </td>
                        <td className="p-2.5 text-center text-clinic-ink-soft">บริการ/อื่นๆ</td>
                        <td className="p-2.5 text-center font-mono">1</td>
                        <td className="p-2.5 text-right font-mono text-clinic-ink">
                          ฿{(item.amount ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-clinic-bg/40 font-semibold border-t-2 border-clinic-line">
                    {receipt.medicineTotal !== undefined && receipt.medicineTotal !== null && (
                      <tr>
                        <td colSpan={3} className="p-2.5 text-right text-clinic-ink-soft">รวมค่ายาสมุนไพร:</td>
                        <td className="p-2.5 text-right font-mono text-clinic-ink">฿{receipt.medicineTotal.toLocaleString()}</td>
                      </tr>
                    )}
                    {receipt.additionalItems && receipt.additionalItems.length > 0 && (
                      <tr>
                        <td colSpan={3} className="p-2.5 text-right text-clinic-ink-soft">รวมค่าบริการและอื่นๆ:</td>
                        <td className="p-2.5 text-right font-mono text-clinic-ink">
                          ฿{receipt.additionalItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-clinic-primary-soft/30 border-t border-clinic-line">
                      <td colSpan={3} className="p-3 text-right text-clinic-primary-deep text-sm font-bold">
                        ยอดชำระสุทธิ (Grand Total):
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-base text-clinic-primary-deep">
                        ฿{(receipt.totalPrice ?? 0).toLocaleString()} บาท
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {receipt.note && (
                <p className="text-xs text-clinic-ink-soft italic pt-1">
                  หมายเหตุ: {receipt.note}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Doctor Signature Block */}
        <div className="pt-8 border-t border-clinic-line grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-8">
            <p className="text-clinic-ink-soft">ลงชื่อผู้รับบริการ</p>
            <p className="text-clinic-ink font-semibold">({treatment.patientFullname})</p>
          </div>
          <div className="space-y-8">
            <p className="text-clinic-ink-soft">ลงชื่อแพทย์แผนไทยผู้ตรวจรักษา</p>
            <p className="text-clinic-ink font-semibold">(พท. {treatment.doctorFullname})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
