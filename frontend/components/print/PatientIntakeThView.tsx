import type { PatientResponseDTO } from "@/lib/types";
import { formatThaiDate } from "@/lib/utils";

interface PatientIntakeThViewProps {
  patient?: PatientResponseDTO | null;
}

export function PatientIntakeThView({ patient }: PatientIntakeThViewProps) {
  const isBlank = !patient;

  // Split national ID into 13 digits
  const idDigits: string[] = Array(13).fill("");
  if (patient?.nationalId) {
    const cleanId = patient.nationalId.replace(/\D/g, "");
    for (let i = 0; i < Math.min(cleanId.length, 13); i++) {
      idDigits[i] = cleanId[i];
    }
  }

  const age = patient?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "";

  const emergency = patient?.contactPersons?.[0];

  return (
    <main className="a4-sheet text-slate-900 text-xs leading-relaxed space-y-4 font-body">
      {/* Clinic Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3">
        <h2 className="text-base font-bold text-slate-900 leading-tight">
          พิมพ์วิมานคลินิกการแพทย์แผนไทย (Pimvimaan Thai Traditional Medicine Clinic)
        </h2>
        <p className="text-[11px] text-slate-600 mt-0.5">
          ใบอนุญาตให้จัดตั้งคลินิกเลขที่ 10108002264 · โทร. 081-9358026
        </p>
        <h3 className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-wide">
          แบบกรอกประวัติผู้ป่วย (PATIENT REGISTRATION FORM)
        </h3>
      </div>

      {/* 13 Digit National ID Boxes */}
      <div className="p-3 border border-slate-400 rounded-xs bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="font-bold text-slate-800 shrink-0">
          เลขประจำตัวประชาชน (National ID):
        </span>
        <div className="flex items-center gap-1">
          {idDigits.map((digit, idx) => (
            <div
              key={idx}
              className={`w-6 h-7 border border-slate-700 bg-white flex items-center justify-center font-mono font-bold text-sm ${
                idx === 0 || idx === 4 || idx === 9 || idx === 11 ? "mr-1" : ""
              }`}
            >
              {digit}
            </div>
          ))}
        </div>
      </div>

      {/* Section 1: General Info */}
      <div className="border border-slate-400 p-3 rounded-xs space-y-2.5">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs">
          ๑. ข้อมูลส่วนบุคคล (Personal Information)
        </h4>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-8 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ชื่อ - นามสกุล:</span>
            <span className="flex-1 font-bold text-slate-900 border-b border-dotted border-slate-400 px-1">
              {patient?.fullname || <span className="text-transparent">.</span>}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">HN:</span>
            <span className="flex-1 font-mono font-bold text-emerald-800 border-b border-dotted border-slate-400 px-1">
              {patient ? `P-${String(patient.patientId).padStart(5, "0")}` : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">เพศ:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.gender === "MALE"
                ? "ชาย"
                : patient?.gender === "FEMALE"
                ? "หญิง"
                : ""}
            </span>
          </div>
          <div className="col-span-5 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">วันเดือนปีเกิด:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.dateOfBirth ? formatThaiDate(patient.dateOfBirth) : ""}
            </span>
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">อายุ:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {age ? `${age} ปี` : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">สัญชาติ:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.citizenship || (isBlank ? "" : "ไทย")}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">เชื้อชาติ:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.ethnicity || (isBlank ? "" : "ไทย")}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ศาสนา:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.religion || (isBlank ? "" : "พุทธ")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-6 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">อาชีพ:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.occupation || ""}
            </span>
          </div>
          <div className="col-span-6 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ระดับการศึกษา:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.education || ""}
            </span>
          </div>
        </div>

        {/* Marital Status Checkboxes */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-slate-600 shrink-0">สถานภาพ:</span>
          {["โสด", "สมรส", "หม้าย", "หย่า", "สมณะ"].map((item, i) => {
            const isChecked =
              (item === "โสด" && patient?.maritalStatus === "SINGLE") ||
              (item === "สมรส" && patient?.maritalStatus === "MARRIED") ||
              (item === "หม้าย" && patient?.maritalStatus === "WIDOWED") ||
              (item === "หย่า" && patient?.maritalStatus === "DIVORCED") ||
              (item === "สมณะ" && patient?.maritalStatus === "MONK");
            return (
              <span key={i} className="flex items-center gap-1 font-normal">
                <span className="inline-block w-3.5 h-3.5 border border-slate-700 text-center leading-3 font-bold">
                  {isChecked ? "✓" : ""}
                </span>
                <span>{item}</span>
              </span>
            );
          })}
        </div>

        {/* Family Names */}
        <div className="grid grid-cols-3 gap-2 items-center pt-1">
          <div className="flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ชื่อบิดา:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.fatherName || ""}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ชื่อมารดา:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.motherName || ""}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ชื่อคู่สมรส:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.spouseName || ""}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Address & Contact */}
      <div className="border border-slate-400 p-3 rounded-xs space-y-2.5">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs">
          ๒. ที่อยู่และการติดต่อ (Address & Contact)
        </h4>

        {/* Household Status */}
        <div className="flex items-center gap-4">
          <span className="text-slate-600">สถานะในทะเบียนบ้าน:</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3.5 h-3.5 border border-slate-700 text-center leading-3 font-bold">
              {patient?.householdStatus === "HEAD_OF_HOUSEHOLD" ? "✓" : ""}
            </span>
            <span>เจ้าบ้าน</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3.5 h-3.5 border border-slate-700 text-center leading-3 font-bold">
              {patient?.householdStatus === "RESIDENT" ? "✓" : ""}
            </span>
            <span>ผู้อาศัย</span>
          </span>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">บ้านเลขที่:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.houseNo || ""}
            </span>
          </div>
          <div className="col-span-2 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">หมู่:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.moo || ""}
            </span>
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ซอย:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.soi || ""}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ถนน:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.road || ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">ตำบล/แขวง:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.subDistrict || ""}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">อำเภอ/เขต:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.district || ""}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">จังหวัด:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.province || ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">รหัสไปรษณีย์:</span>
            <span className="flex-1 font-mono border-b border-dotted border-slate-400 px-1">
              {patient?.zipCode || ""}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">โทรศัพท์มือถือ:</span>
            <span className="flex-1 font-mono font-bold border-b border-dotted border-slate-400 px-1">
              {patient?.mobileNumber || ""}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">อีเมล:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.email || ""}
            </span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-2 border-t border-slate-200 space-y-1.5">
          <span className="font-bold text-slate-800 text-[11px] block">
            บุคคลที่สามารถติดต่อได้ในกรณีฉุกเฉิน:
          </span>
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5 flex items-baseline gap-1">
              <span className="shrink-0 text-slate-600">ชื่อ - สกุล:</span>
              <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
                {emergency?.contactName || ""}
              </span>
            </div>
            <div className="col-span-3 flex items-baseline gap-1">
              <span className="shrink-0 text-slate-600">ความสัมพันธ์:</span>
              <span className="flex-1 border-b border-dotted border-slate-400 px-1">
                {emergency?.relationship || ""}
              </span>
            </div>
            <div className="col-span-4 flex items-baseline gap-1">
              <span className="shrink-0 text-slate-600">เบอร์โทรศัพท์:</span>
              <span className="flex-1 font-mono border-b border-dotted border-slate-400 px-1">
                {emergency?.mobileNumber || ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Health & Allergies */}
      <div className="border border-slate-400 p-3 rounded-xs space-y-2">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs">
          ๓. ข้อมูลสุขภาพเบื้องต้น (Health Profile & Allergies)
        </h4>

        <div className="grid grid-cols-2 gap-3 items-center">
          <div className="flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">กรุ๊ปเลือด:</span>
            <span className="flex-1 font-mono font-bold text-rose-700 border-b border-dotted border-slate-400 px-1">
              {patient?.bloodGroup || patient?.bloodGroupAbo || ""}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">สิทธิการรักษาพยาบาล:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.treatmentRights || (isBlank ? "" : "ชำระเงินเอง")}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-1 pt-1">
          <span className="shrink-0 text-rose-800 font-bold">ประวัติการแพ้ยา:</span>
          <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1 text-rose-900">
            {patient?.healthProfile?.drugAllergy || (isBlank ? "" : "ปฏิเสธประวัติแพ้ยา")}
          </span>
        </div>

        <div className="flex items-baseline gap-1 pt-1">
          <span className="shrink-0 text-slate-700 font-bold">โรคประจำตัว:</span>
          <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
            {patient?.healthProfile?.underlyingDisease || (isBlank ? "" : "ไม่มี")}
          </span>
        </div>
      </div>

      {/* Signature & Confirmation */}
      <div className="pt-4 border-t border-slate-300 space-y-4">
        <p className="text-[11px] text-slate-600 text-center">
          ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ
        </p>
        <div className="grid grid-cols-2 gap-8 pt-4 text-center">
          <div className="space-y-4">
            <p className="text-slate-500">ลงชื่อ .................................................... ผู้ให้ข้อมูล / ผู้ป่วย</p>
            <p className="text-slate-700 font-medium">({patient?.fullname || "...................................................."})</p>
            <p className="text-[11px] text-slate-500">วันที่ .......... / .......... / ..............</p>
          </div>
          <div className="space-y-4">
            <p className="text-slate-500">ลงชื่อ .................................................... เจ้าหน้าที่ผู้รับบันทึก</p>
            <p className="text-slate-700 font-medium">(....................................................)</p>
            <p className="text-[11px] text-slate-500">วันที่ .......... / .......... / ..............</p>
          </div>
        </div>
      </div>
    </main>
  );
}
