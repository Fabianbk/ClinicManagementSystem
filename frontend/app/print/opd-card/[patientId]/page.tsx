import { notFound } from "next/navigation";
import { getPatient } from "@/lib/resources/patients";
import { PrintToolbar } from "@/components/print/PrintToolbar";
import { formatThaiDate } from "@/lib/utils";
import { AlertTriangle, HeartPulse, User, Phone, Home, ShieldAlert } from "lucide-react";

interface OpdCardPrintPageProps {
  params: { patientId: string };
}

export default async function OpdCardPrintPage({ params }: OpdCardPrintPageProps) {
  const patientId = Number(params.patientId);
  if (isNaN(patientId)) {
    notFound();
  }

  const patient = await getPatient(patientId).catch(() => null);
  if (!patient) {
    notFound();
  }

  // Calculate age
  const age = patient.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "-";

  const fullAddress = [
    patient.houseNo ? `บ้านเลขที่ ${patient.houseNo}` : "",
    patient.moo ? `หมู่ ${patient.moo}` : "",
    patient.soi ? `ซอย ${patient.soi}` : "",
    patient.road ? `ถนน ${patient.road}` : "",
    patient.subDistrict ? `ตำบล/แขวง ${patient.subDistrict}` : "",
    patient.district ? `อำเภอ/เขต ${patient.district}` : "",
    patient.province ? `จังหวัด ${patient.province}` : "",
    patient.zipCode ? patient.zipCode : "",
  ]
    .filter(Boolean)
    .join(" ");

  const emergency = patient.contactPersons?.[0];

  const hnCode = `P-${String(patient.patientId).padStart(5, "0")}`;

  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle={`บัตรเวชระเบียน (OPD Card) - ${patient.fullname}`}
        subtitle={`HN: ${hnCode} · ผู้ป่วยทั่วไป`}
        docxUrl={`/api/documents/patient/${patient.patientId}/opd-card`}
        docxFilename={`opd-card-${patient.patientId}.docx`}
      />

      <main className="a4-sheet">
        {/* Document Header */}
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            พิมพ์วิมานคลินิกการแพทย์แผนไทย (Pimvimaan Thai Traditional Medicine Clinic)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            ใบอนุญาตให้จัดตั้งคลินิกเลขที่ 10108002264 · โทรศัพท์: 081-9358026
          </p>
          <div className="inline-block mt-1 px-3 py-0.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xs">
            บัตรประจำตัวผู้ป่วยเวชระเบียน (OUTPATIENT DEPARTMENT CARD)
          </div>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="border-2 border-slate-800 rounded-xs grid grid-cols-2 divide-x-2 divide-y-2 divide-slate-800 text-xs">
          {/* Cell 1 (Top-Left): Patient Identity */}
          <div className="p-4 space-y-3 bg-white">
            <div className="flex items-start justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  รหัสเวชระเบียน (HN)
                </span>
                <span className="text-2xl font-black font-mono text-emerald-900 leading-tight">
                  {hnCode}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">สถานะ</span>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold">
                  ลงทะเบียนแล้ว
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 text-[11px]">ชื่อ - สกุล ผู้ป่วย:</span>
                <p className="text-base font-bold text-slate-900 leading-tight">
                  {patient.fullname}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500 text-[11px]">เพศ:</span>
                  <p className="font-semibold text-slate-800">
                    {patient.gender === "MALE"
                      ? "ชาย (Male)"
                      : patient.gender === "FEMALE"
                      ? "หญิง (Female)"
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">อายุ:</span>
                  <p className="font-semibold text-slate-800">{age} ปี</p>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-slate-500 text-[11px]">อาชีพ:</span>
                <p className="font-medium text-slate-800">{patient.occupation || "-"}</p>
              </div>
            </div>
          </div>

          {/* Cell 2 (Top-Right): Official Registration Info */}
          <div className="p-4 space-y-3 bg-white">
            <div>
              <span className="text-slate-500 text-[11px] block">
                {patient.idType === "PASSPORT" ? "เลขที่หนังสือเดินทาง (Passport No.):" : "เลขประจำตัวประชาชน (National ID):"}
              </span>
              <p className="text-base font-mono font-bold text-slate-900 tracking-wider">
                {patient.nationalId || patient.passportNo || patient.idNumber || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-500 text-[11px]">วันเดือนปีเกิด:</span>
                <p className="font-semibold text-slate-800">
                  {formatThaiDate(patient.dateOfBirth)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">กรุ๊ปเลือด (Blood Group):</span>
                <p className="font-mono font-bold text-rose-700 text-sm">
                  {patient.bloodGroup || patient.bloodGroupAbo || "-"}
                  {patient.bloodGroupRh === "POSITIVE" ? " (Rh+)" : patient.bloodGroupRh === "NEGATIVE" ? " (Rh-)" : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-500 text-[11px]">สิทธิการรักษา:</span>
                <p className="font-semibold text-slate-800">
                  {patient.treatmentRights === "ELDERLY"
                    ? "สิทธิผู้สูงอายุ"
                    : patient.treatmentRights === "MONK"
                    ? "สิทธินักบวช/สมณะ"
                    : patient.treatmentRights === "DISABLED"
                    ? "สิทธิผู้พิการ"
                    : "ชำระเงินเอง (Self-pay)"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">สถานภาพสมรส:</span>
                <p className="font-medium text-slate-800">
                  {patient.maritalStatus || "-"}
                </p>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <span className="text-slate-500 text-[11px]">ธาตุเจ้าเรือน (กำเนิด/หลัก):</span>
              <p className="font-semibold text-emerald-800">
                {patient.principle?.principalDhatu
                  ? `ธาตุ${patient.principle.principalDhatu}`
                  : "ยังไม่ได้ระบุ"}
              </p>
            </div>
          </div>

          {/* Cell 3 (Bottom-Left): Contact & Residence */}
          <div className="p-4 space-y-2.5 bg-white">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b border-slate-200 pb-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>ข้อมูลการติดต่อและที่อยู่</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px]">เบอร์โทรศัพท์มือถือ:</span>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {patient.mobileNumber || "-"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 text-[11px]">ที่อยู่ปัจจุบันตามทะเบียน:</span>
              <p className="text-slate-800 leading-relaxed font-normal">
                {fullAddress || "-"}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-700 block">
                ผู้ติดต่อฉุกเฉิน (Emergency Contact):
              </span>
              {emergency ? (
                <div className="text-[11px] text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                  <p>
                    <strong className="text-slate-900">{emergency.contactName}</strong>
                    {emergency.relationship ? ` (${emergency.relationship})` : ""}
                  </p>
                  <p className="font-mono mt-0.5 text-slate-700">
                    โทร: {emergency.mobileNumber || "-"}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px]">- ไม่ได้ระบุ -</p>
              )}
            </div>
          </div>

          {/* Cell 4 (Bottom-Right): Medical Alerts & Cautions */}
          <div className="p-4 space-y-2.5 bg-rose-50/40">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold border-b border-rose-200 pb-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-rose-900">ข้อควรระวังทางการแพทย์และประวัติแพ้ยา</span>
            </div>

            <div className="p-2.5 bg-white rounded border border-rose-200 space-y-1">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                ประวัติการแพ้ยา (DRUG ALLERGIES):
              </span>
              <p className="text-sm font-black text-rose-800">
                {patient.healthProfile?.drugAllergy || "ปฏิเสธประวัติแพ้ยา (No known drug allergy)"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-[11px]">โรคประจำตัว (Underlying Diseases):</span>
              <p className="font-semibold text-slate-900">
                {patient.healthProfile?.underlyingDisease || "- ไม่มี / ปฏิเสธ -"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-[11px]">ประวัติแพ้อาหาร/สารอื่นๆ:</span>
              <p className="text-slate-800">
                {patient.healthProfile?.foodAllergy || "-"}
              </p>
            </div>

            <div className="pt-2 border-t border-rose-200/60 text-[10px] text-slate-500 italic">
              * ข้อมูลสำหรับแพทย์แผนไทยและผู้ช่วยแพทย์ในการซักประวัติและระมัดระวังก่อนทำหัตถการ
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
          <span>คลินิกการแพทย์แผนไทยพิมพ์วิมาน · เอกสารเวชระเบียนทางการ</span>
          <span>วันที่พิมพ์: {new Date().toLocaleDateString("th-TH")}</span>
        </div>
      </main>
    </div>
  );
}
