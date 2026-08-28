"use client";

import Link from "next/link";
import type { RecordTreatmentResponseDTO, PatientResponseDTO } from "@/lib/types";

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
        <Link
          href="/doctor/treatments"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-control text-xs font-semibold text-clinic-ink bg-white border border-clinic-line hover:bg-clinic-bg transition-colors shadow-2xs"
        >
          ← กลับไปยังรายการเวชระเบียน
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control text-xs font-bold text-clinic-primary bg-clinic-bg hover:bg-clinic-primary hover:text-white border border-clinic-line transition-all shadow-2xs cursor-pointer"
          >
            🖨️ พิมพ์เวชระเบียน / ใบสั่งการรักษา
          </button>

          <Link
            href={`/doctor/treatments/${treatment.recordTreatmentId}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control text-xs font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-2xs"
          >
            ✏️ แก้ไขข้อมูลการรักษา
          </Link>
        </div>
      </div>

      {/* Main Treatment Document (Print-friendly format) */}
      <div className="bg-white border border-clinic-line rounded-card p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="text-center border-b border-clinic-line pb-5 space-y-1">
          <h1 className="font-display font-bold text-xl text-clinic-primary-deep">
            แบบบันทึกข้อมูลผู้รับบริการและใบสั่งการรักษา (Client Intake & Treatment Record)
          </h1>
          <p className="text-sm font-semibold text-clinic-ink">
            พิมพ์วิมานคลินิกการแพทย์แผนไทย (Pimvimaan Thai Traditional Clinic) · 081 - 9358026
          </p>
          <p className="text-xs text-clinic-ink-soft">
            เวชระเบียนเลขที่: <strong>#{treatment.recordTreatmentId}</strong> · นัดหมายเลขที่: #{treatment.appointmentId} · วันที่ตรวจ: {formatDateThaiFull(treatment.recordDate)}
          </p>
        </div>

        {/* Section 1: ข้อมูลผู้รับบริการ (Part 1 Personal Info) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep bg-clinic-bg/60 px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
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
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep bg-clinic-bg/60 px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๒: ประวัติการเจ็บป่วย & ธาตุเจ้าเรือน (General and Medical Information)
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-clinic-bg/30 rounded-control border border-clinic-line">
              <div>
                <span className="text-clinic-ink-soft font-semibold">ธาตุเจ้าเรือนหลัก:</span>{" "}
                <strong className="text-clinic-primary">{patient?.principle?.principleDhatu || "ปถวี ดิน"}</strong>
              </div>
              <div>
                <span className="text-clinic-ink-soft font-semibold">ธาตุเจ้าเรือนรอง:</span>{" "}
                <strong className="text-clinic-primary">{patient?.principle?.secondaryDhatu || "วาโย ลม"}</strong>
              </div>
            </div>

            <div className="p-3 bg-clinic-bg/30 rounded-control border border-clinic-line space-y-1.5">
              <div>
                <span className="font-bold text-clinic-ink">อาการสำคัญ (Symptoms / Chief Complaint):</span>
                <p className="text-clinic-ink mt-0.5 whitespace-pre-line leading-relaxed">{treatment.symptoms || "-"}</p>
              </div>
            </div>

            {/* Health profile badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-clinic-bg/30 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">โรคประจำตัว:</span>
                <span className="font-semibold text-clinic-ink">{patient?.healthProfile?.underlyingDisease || "ปฏิเสธ"}</span>
              </div>
              <div className="p-2 bg-clinic-bg/30 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">การแพ้ยา:</span>
                <span className="font-semibold text-rose-700">{patient?.healthProfile?.drugAllergy || "ปฏิเสธ"}</span>
              </div>
              <div className="p-2 bg-clinic-bg/30 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">การแพ้อาหาร:</span>
                <span className="font-semibold text-amber-700">{patient?.healthProfile?.foodAllergy || "ปฏิเสธ"}</span>
              </div>
              <div className="p-2 bg-clinic-bg/30 rounded border border-clinic-line">
                <span className="text-[10px] text-clinic-ink-soft block">แอลกอฮอล์/บุหรี่:</span>
                <span className="font-semibold text-clinic-ink">ปฏิเสธ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: ตรวจร่างกาย & สัญญาณชีพ (Part 3 Physical Exam) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep bg-clinic-bg/60 px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
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
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                ผลการรักษา: ความปวดลดลง {Math.max(0, treatment.painScoreBefore - treatment.painScoreAfter)} ระดับ
              </span>
            )}
          </div>

          {treatment.modernDiagnosis && (
            <div className="p-3 bg-clinic-bg/30 rounded-control border border-clinic-line text-xs">
              <span className="font-bold text-clinic-ink-soft">การวินิจฉัยแผนปัจจุบัน & รีเฟล็กซ์:</span>
              <p className="text-clinic-ink mt-0.5 whitespace-pre-line">{treatment.modernDiagnosis}</p>
            </div>
          )}
        </div>

        {/* Section 4: การวินิจฉัยแพทย์แผนไทย (Part 4 TTM Diagnosis) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep bg-clinic-bg/60 px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๔: การวินิจฉัยทางการแพทย์แผนไทย (Thai Traditional Medical Diagnosis)
          </h2>
          <div className="space-y-2 text-xs">
            {treatment.ttmDiagnosis && (
              <div className="p-3 bg-clinic-bg/30 rounded-control border border-clinic-line">
                <span className="font-bold text-clinic-primary-deep">การวินิจฉัยโรคทางการแพทย์แผนไทย / รหัสโรค:</span>
                <p className="text-clinic-ink font-bold text-sm mt-0.5 text-clinic-primary-deep">{treatment.ttmDiagnosis}</p>
              </div>
            )}

            {treatment.causeOfSymptoms && (
              <div className="p-3 bg-clinic-bg/30 rounded-control border border-clinic-line">
                <span className="font-bold text-clinic-ink">มูลเหตุการเกิดโรค (Cause of symptoms):</span>
                <p className="text-clinic-ink mt-0.5">{treatment.causeOfSymptoms}</p>
              </div>
            )}

            {treatment.diagnosisElements && (
              <div className="p-3 bg-clinic-bg/30 rounded-control border border-clinic-line">
                <span className="font-bold text-clinic-ink">ผลการวิเคราะห์สมุฏฐาน 5 ด้าน & สมุฏฐานธาตุพิการ:</span>
                <p className="text-clinic-ink mt-0.5 leading-relaxed">{treatment.diagnosisElements}</p>
              </div>
            )}

            {treatment.summaryOfSickness && (
              <div className="p-3 bg-clinic-bg/30 rounded-control border border-clinic-line">
                <span className="font-bold text-clinic-ink">สรุปความเจ็บป่วย (Summary of sickness):</span>
                <p className="text-clinic-ink mt-0.5">{treatment.summaryOfSickness}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: การรักษาและคำแนะนำ (Part 5 Treatment Program) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep bg-clinic-bg/60 px-3 py-1.5 rounded-control border-l-4 border-clinic-primary">
            ส่วนที่ ๕: การรักษาและคำแนะนำ (Treatment Program & Suggestions)
          </h2>
          <div className="space-y-2 text-xs">
            {treatment.treatmentPlan && (
              <div>
                <span className="text-clinic-ink-soft font-semibold">๑. แผนการรักษา:</span>{" "}
                <span className="text-clinic-ink">{treatment.treatmentPlan}</span>
              </div>
            )}

            {treatment.treatmentProgram && (
              <div>
                <span className="text-clinic-ink-soft font-semibold">๒. วิธีการรักษา/หัตถการ:</span>{" "}
                <span className="text-clinic-primary font-semibold">{treatment.treatmentProgram}</span>
              </div>
            )}

            {treatment.suggestions && (
              <div>
                <span className="text-clinic-ink-soft font-semibold">๓. คำแนะนำสำหรับผู้ป่วย:</span>{" "}
                <span className="text-clinic-ink">{treatment.suggestions}</span>
              </div>
            )}

            {treatment.followup && (
              <div>
                <span className="text-clinic-ink-soft font-semibold">๔. นัดหมายติดตามผล:</span>{" "}
                <span className="text-clinic-ink font-bold text-emerald-800">{treatment.followup}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 6: ใบสั่งการรักษา & รายการยาและค่ารักษา (Part 6 Prescription & Billing) */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep bg-clinic-bg/60 px-3 py-1.5 rounded-control border-l-4 border-clinic-primary flex items-center justify-between">
            <span>ส่วนที่ ๖: ใบสั่งการรักษาและค่ารักษาพยาบาล (Prescription & Billing)</span>
            {receipt && (
              <span className="text-xs font-semibold text-emerald-800">
                สถานะ: {receipt.paymentStatus === "PAID" ? "ชำระเงินเรียบร้อยแล้ว" : "รอดำเนินการ"}
              </span>
            )}
          </h2>

          {medicines.length > 0 ? (
            <div className="overflow-x-auto border border-clinic-line rounded-control">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-clinic-bg text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                  <tr>
                    <th className="px-4 py-2 text-center w-12">ลำดับ</th>
                    <th className="px-4 py-2">รายการยาสมุนไพร / หัตถการ</th>
                    <th className="px-4 py-2 text-center">จำนวน</th>
                    <th className="px-4 py-2 text-right">ราคา/หน่วย</th>
                    <th className="px-4 py-2 text-right">รวม (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-clinic-line">
                  {medicines.map((m, index) => (
                    <tr key={m.recordTreatmentMedicineId}>
                      <td className="px-4 py-2 text-center text-clinic-ink-soft font-mono">{index + 1}</td>
                      <td className="px-4 py-2 font-semibold text-clinic-ink">{m.medicineName}</td>
                      <td className="px-4 py-2 text-center font-mono">{m.quantity}</td>
                      <td className="px-4 py-2 text-right font-mono">฿{m.priceAtTime.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-clinic-primary-deep">
                        ฿{m.subTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-clinic-ink-soft italic">ไม่มีรายการสั่งจ่ายยาสมุนไพรในครั้งนี้</p>
          )}

          {/* Grand total footer */}
          {receipt && (
            <div className="bg-clinic-bg/40 p-4 rounded-control border border-clinic-line flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="text-clinic-ink-soft">
                  ใบเสร็จรับเงินเลขที่: <strong className="text-clinic-ink">#{receipt.receiptId}</strong>
                </p>
                <p className="text-clinic-ink-soft">
                  วิธีการชำระเงิน: <strong className="text-clinic-ink">{receipt.paymentMethod || "CASH"}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-clinic-ink-soft block">รวมค่ารักษาทั้งสิ้น</span>
                <span className="font-mono text-xl font-bold text-clinic-primary-deep">
                  ฿{receipt.totalPrice.toLocaleString()} บาท
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Signature Block */}
        <div className="pt-6 border-t border-clinic-line flex flex-col sm:flex-row items-end justify-between gap-4 text-xs">
          <div className="text-clinic-ink-soft space-y-0.5">
            <p>พิมพ์วิมานคลินิกการแพทย์แผนไทย</p>
            <p>081 - 9358026</p>
          </div>

          <div className="text-center space-y-1 min-w-[220px]">
            <div className="border-b border-clinic-ink/40 pb-1 font-semibold text-clinic-ink">
              พท.ภ. {treatment.doctorFullname}
            </div>
            <p className="text-[11px] text-clinic-ink-soft">
              แพทย์แผนไทยผู้ตรวจรักษา (เลขที่ใบประกอบวิชาชีพ พท.ว.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
