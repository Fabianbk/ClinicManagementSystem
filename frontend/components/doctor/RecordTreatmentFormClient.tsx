"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  AppointmentResponseDTO,
  PatientResponseDTO,
  MedicineResponseDTO,
  RecordTreatmentRequestDTO,
  RecordTreatmentResponseDTO,
} from "@/lib/types";

interface RecordTreatmentFormClientProps {
  doctorId: number;
  doctorFullname: string;
  defaultAppointmentId?: number;
  defaultPatientId?: number;
  appointments: AppointmentResponseDTO[];
  patients: PatientResponseDTO[];
  medicines: MedicineResponseDTO[];
}

interface PrescribedItem {
  medicineId: number;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  unitType?: string;
  subTotal: number;
}

const PAIN_SCORES = [
  { score: 0, label: "ไม่ปวด", emoji: "😊", color: "text-emerald-600 bg-emerald-50 border-emerald-300" },
  { score: 2, label: "ปวดเล็กน้อย", emoji: "🙂", color: "text-lime-600 bg-lime-50 border-lime-300" },
  { score: 4, label: "ปวดปานกลาง", emoji: "😐", color: "text-amber-600 bg-amber-50 border-amber-300" },
  { score: 6, label: "ปวดมาก", emoji: "🙁", color: "text-orange-600 bg-orange-50 border-orange-300" },
  { score: 8, label: "ปวดรุนแรง", emoji: "😣", color: "text-rose-600 bg-rose-50 border-rose-300" },
  { score: 10, label: "ปวดมากที่สุด", emoji: "😭", color: "text-red-700 bg-red-50 border-red-400" },
];

export function RecordTreatmentFormClient({
  doctorId,
  doctorFullname,
  defaultAppointmentId,
  defaultPatientId,
  appointments,
  patients,
  medicines,
}: RecordTreatmentFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Selection mode: From scheduled appointment or Direct Patient Walk-in
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | "WALK_IN">(
    defaultAppointmentId ?? (appointments.length > 0 ? appointments[0].appointmentId : "WALK_IN")
  );

  const [selectedPatientId, setSelectedPatientId] = useState<number>(() => {
    if (defaultPatientId) return defaultPatientId;
    if (defaultAppointmentId) {
      const app = appointments.find((a) => a.appointmentId === defaultAppointmentId);
      if (app) return app.patientId;
    }
    if (appointments.length > 0 && selectedAppointmentId !== "WALK_IN") {
      const app = appointments.find((a) => a.appointmentId === selectedAppointmentId);
      if (app) return app.patientId;
    }
    return patients.length > 0 ? patients[0].patientId : 0;
  });

  // Patient previous history & auto mode detection
  const [patientHistory, setPatientHistory] = useState<RecordTreatmentResponseDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form Mode: "FIRST_VISIT" (แบบบันทึกครั้งแรก - Pages 1-5) vs "CONTINUED_VISIT" (แบบบันทึกการรักษาต่อเนื่อง - Page 6)
  const [formMode, setFormMode] = useState<"FIRST_VISIT" | "CONTINUED_VISIT">("FIRST_VISIT");

  // Clinical Form Fields
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Part 1 & 2: Dhatu & Medical Information
  const [principleDhatu, setPrincipleDhatu] = useState("ปถวี ดิน (Pathavi Dhatu)");
  const [secondaryDhatu, setSecondaryDhatu] = useState("วาโย ลม (Vayo Dhatu)");
  const [symptoms, setSymptoms] = useState("");
  const [presentHistory, setPresentHistory] = useState("");
  const [underlyingDisease, setUnderlyingDisease] = useState("ปฏิเสธโรคประจำตัว");
  const [drugAllergy, setDrugAllergy] = useState("ปฏิเสธการแพ้ยา");
  const [foodAllergy, setFoodAllergy] = useState("ปฏิเสธการแพ้อาหาร");
  const [personalHistory, setPersonalHistory] = useState("ปฏิเสธการดื่มแอลกอฮอล์ และปฏิเสธการสูบบุหรี่");

  // Part 3: Physical Examination & Vitals
  const [temp, setTemp] = useState<number | "">(36.5);
  const [pulse, setPulse] = useState<number | "">(76);
  const [respirationRate, setRespirationRate] = useState<number | "">(18);
  const [bp, setBp] = useState("120/80");
  const [height, setHeight] = useState<number | "">(165);
  const [weight, setWeight] = useState<number | "">(60);
  const [painScoreBefore, setPainScoreBefore] = useState<number>(4);
  const [painScoreAfter, setPainScoreAfter] = useState<number>(2);

  // Reflexes & Modern Diagnosis
  const [reflexNotes, setReflexNotes] = useState("Bicep Jerk: 2+ RT / 2+ LT, Knee Jerk: 2+ RT / 2+ LT");
  const [modernDiagnosis, setModernDiagnosis] = useState("");

  // Part 4: Thai Traditional Medical Diagnosis
  const [diagnosisElements, setDiagnosisElements] = useState("ธาตุสมุฏฐาน: วาตะกำเริบ, กาลสมุฏฐาน: ปิตตะ");
  const [causeOfSymptoms, setCauseOfSymptoms] = useState("อิริยาบถนั่งทำงานนาน, ทำงานเกินกำลัง");
  const [summaryOfSickness, setSummaryOfSickness] = useState("");
  const [ttmDiagnosis, setTtmDiagnosis] = useState("โรคลมปลายปัตฆาตสัญญาณ 4-5");

  // Part 5: Treatment Program & Suggestions
  const [treatmentPlan, setTreatmentPlan] = useState("นวดรักษาและประคบสมุนไพรเพื่อคลายกล้ามเนื้อ");
  const [programCompress, setProgramCompress] = useState(true);
  const [programSteam, setProgramSteam] = useState(false);
  const [programMassage, setProgramMassage] = useState(true);
  const [programHerbalMed, setProgramHerbalMed] = useState(true);
  const [programConsult, setProgramConsult] = useState(true);
  const [suggestions, setSuggestions] = useState("หลีกเลี่ยงการยกของหนัก ปรับท่านั่งทำงาน และประคบอุ่นบริเวณที่ปวด");
  const [followup, setFollowup] = useState("นัดติดตามผลในอีก 1 สัปดาห์");

  // Part 6: Prescriptions & Billing
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<number>(
    medicines.length > 0 ? medicines[0].medicineId : 0
  );
  const [medQuantity, setMedQuantity] = useState<number>(1);

  // Billing
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [procedureFee, setProcedureFee] = useState<number>(300); // Default procedure fee

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto calculate BMI
  const bmiValue = useMemo(() => {
    if (!height || !weight || Number(height) <= 0 || Number(weight) <= 0) return null;
    const hMeters = Number(height) / 100;
    const val = Number(weight) / (hMeters * hMeters);
    return Math.round(val * 10) / 10;
  }, [height, weight]);

  const bmiClassification = useMemo(() => {
    if (!bmiValue) return null;
    if (bmiValue < 18.5) return { label: "น้ำหนักน้อยกว่าเกณฑ์", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (bmiValue <= 22.9) return { label: "สมส่วน / ปกติ", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (bmiValue <= 24.9) return { label: "ท้วม / น้ำหนักเกิน", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (bmiValue <= 29.9) return { label: "อ้วนระดับ 1", color: "text-orange-700 bg-orange-50 border-orange-200" };
    return { label: "อ้วนระดับ 2 (อันตราย)", color: "text-red-700 bg-red-50 border-red-300" };
  }, [bmiValue]);

  // Selected patient object
  const currentPatient = useMemo(() => {
    return patients.find((p) => p.patientId === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // When selected appointment changes, update patient ID
  const handleAppointmentChange = (appIdStr: string) => {
    if (appIdStr === "WALK_IN") {
      setSelectedAppointmentId("WALK_IN");
    } else {
      const appId = Number(appIdStr);
      setSelectedAppointmentId(appId);
      const app = appointments.find((a) => a.appointmentId === appId);
      if (app && app.patientId) {
        setSelectedPatientId(app.patientId);
      }
    }
  };

  // Fetch patient previous treatment records to detect first-time vs continued visit
  useEffect(() => {
    if (!selectedPatientId) return;

    let isMounted = true;
    setLoadingHistory(true);

    fetch(`/api/record-treatments/patient/${selectedPatientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const list: RecordTreatmentResponseDTO[] = data?.content || data?.data || [];
        setPatientHistory(list);

        // Auto-switch mode based on whether patient has prior records
        if (list.length > 0) {
          setFormMode("CONTINUED_VISIT");
          // Pre-populate past symptoms/disease from recent record if available
          const latest = list[0];
          if (latest.ttmDiagnosis) setTtmDiagnosis(latest.ttmDiagnosis);
          if (latest.treatmentPlan) setTreatmentPlan(latest.treatmentPlan);
        } else {
          setFormMode("FIRST_VISIT");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  // When patient changes, if they have principles or health profile in patient object, prefill
  useEffect(() => {
    if (!currentPatient) return;
    if (currentPatient.principle?.principleDhatu) {
      setPrincipleDhatu(currentPatient.principle.principleDhatu);
    }
    if (currentPatient.principle?.secondaryDhatu) {
      setSecondaryDhatu(currentPatient.principle.secondaryDhatu);
    }
    if (currentPatient.healthProfile?.underlyingDisease) {
      setUnderlyingDisease(currentPatient.healthProfile.underlyingDisease);
    }
    if (currentPatient.healthProfile?.drugAllergy) {
      setDrugAllergy(currentPatient.healthProfile.drugAllergy);
    }
    if (currentPatient.healthProfile?.foodAllergy) {
      setFoodAllergy(currentPatient.healthProfile.foodAllergy);
    }
  }, [currentPatient]);

  // Prescribe medicine action
  const handleAddMedicine = () => {
    if (!selectedMedId) return;
    const med = medicines.find((m) => m.medicineId === Number(selectedMedId));
    if (!med) return;

    const qty = Number(medQuantity);
    if (qty <= 0) return;

    // Check if already in list
    const existingIndex = prescribedMedicines.findIndex((p) => p.medicineId === med.medicineId);
    if (existingIndex >= 0) {
      const updated = [...prescribedMedicines];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].subTotal = updated[existingIndex].quantity * med.unitPrice;
      setPrescribedMedicines(updated);
    } else {
      setPrescribedMedicines((prev) => [
        ...prev,
        {
          medicineId: med.medicineId,
          medicineName: med.medicineName,
          unitPrice: med.unitPrice,
          quantity: qty,
          unitType: med.unitType ?? "ขวด/ซอง",
          subTotal: qty * med.unitPrice,
        },
      ]);
    }
    setMedQuantity(1);
  };

  const handleRemoveMedicine = (medId: number) => {
    setPrescribedMedicines((prev) => prev.filter((p) => p.medicineId !== medId));
  };

  // Grand Total Calculation
  const medicinesTotal = useMemo(() => {
    return prescribedMedicines.reduce((sum, item) => sum + item.subTotal, 0);
  }, [prescribedMedicines]);

  const grandTotal = useMemo(() => {
    return medicinesTotal + Number(procedureFee || 0);
  }, [medicinesTotal, procedureFee]);

  // Construct treatment program string from checkboxes
  const composedTreatmentProgram = useMemo(() => {
    const progs: string[] = [];
    if (programMassage) progs.push("นวด/หัตถการ");
    if (programCompress) progs.push("ประคบสมุนไพร");
    if (programSteam) progs.push("อบสมุนไพร");
    if (programHerbalMed) progs.push("จ่ายยาสมุนไพร");
    if (programConsult) progs.push("ให้คำปรึกษาทางการแพทย์");
    return progs.join(", ");
  }, [programCompress, programSteam, programMassage, programHerbalMed, programConsult]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedPatientId) {
      setErrorMsg("กรุณาเลือกผู้ป่วยที่เข้ารับการตรวจรักษา");
      return;
    }

    if (!symptoms.trim()) {
      setErrorMsg("กรุณาระบุอาการสำคัญของผู้ป่วย");
      return;
    }

    try {
      const treatmentDTO: RecordTreatmentRequestDTO = {
        appointmentId: selectedAppointmentId === "WALK_IN" ? undefined : selectedAppointmentId,
        patientId: selectedPatientId,
        doctorId: doctorId,
        recordDate: recordDate ? `${recordDate}T00:00:00` : new Date().toISOString(),
        symptoms: symptoms.trim(),
        temp: temp ? Number(temp) : undefined,
        pulse: pulse ? Number(pulse) : undefined,
        respirationRate: respirationRate ? Number(respirationRate) : undefined,
        bp: bp.trim() || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        bmi: bmiValue ? Number(bmiValue) : undefined,
        causeOfSymptoms: causeOfSymptoms.trim() || undefined,
        summaryOfSickness: summaryOfSickness.trim() || undefined,
        diagnosisElements: diagnosisElements.trim() || undefined,
        ttmDiagnosis: ttmDiagnosis.trim() || undefined,
        modernDiagnosis: modernDiagnosis.trim() || reflexNotes || undefined,
        treatmentPlan: treatmentPlan.trim() || undefined,
        treatmentProgram: composedTreatmentProgram || undefined,
        suggestions: suggestions.trim() || undefined,
        followup: followup.trim() || undefined,
        painScoreBefore: painScoreBefore,
        painScoreAfter: painScoreAfter,
      };

      // 1. Create Treatment Record
      const res = await fetch("/api/record-treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(treatmentDTO),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถบันทึกเวชระเบียนการรักษาได้");
      }

      const createdRecord: RecordTreatmentResponseDTO = await res.json();
      const recordTreatmentId = createdRecord.recordTreatmentId;

      // 2. Dispense Prescribed Medicines (if any)
      for (const item of prescribedMedicines) {
        await fetch("/api/record-treatment-medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordTreatmentId: recordTreatmentId,
            medicineId: item.medicineId,
            quantity: item.quantity,
          }),
        }).catch((err) => console.error("Medicine dispensing error:", err));
      }

      // 3. Issue Receipt & Billing
      if (grandTotal > 0) {
        await fetch("/api/receipts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordTreatmentId: recordTreatmentId,
            receiptDate: recordDate ? `${recordDate}T00:00:00` : new Date().toISOString(),
            paymentStatus: paymentStatus,
            paymentMethod: paymentMethod,
          }),
        }).catch((err) => console.error("Receipt error:", err));
      }

      setSuccessMsg("บันทึกเวชระเบียนการตรวจรักษาและออกใบสั่งการรักษาเรียบร้อยแล้ว!");
      startTransition(() => {
        setTimeout(() => {
          router.push(`/doctor/treatments/${recordTreatmentId}`);
          router.refresh();
        }, 1200);
      });
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20 font-body text-clinic-ink">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/doctor/treatments"
              className="text-xs font-semibold text-clinic-primary hover:underline"
            >
              ← กลับไปรายการการรักษา
            </Link>
          </div>
          <h1 className="font-display text-2xl font-bold text-clinic-primary-deep mt-1 flex items-center gap-2">
            <span>📝 บันทึกการตรวจรักษา (Clinical Record)</span>
          </h1>
          <p className="text-xs text-clinic-ink-soft mt-0.5">
            พิมพ์วิมานคลินิกการแพทย์แผนไทย · แพทย์ผู้ตรวจ: <strong>{doctorFullname}</strong>
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-clinic-bg rounded-control border border-clinic-line">
          <button
            type="button"
            onClick={() => setFormMode("FIRST_VISIT")}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all cursor-pointer ${
              formMode === "FIRST_VISIT"
                ? "bg-clinic-primary text-white shadow-2xs"
                : "text-clinic-ink-soft hover:text-clinic-ink"
            }`}
          >
            🌿 ตรวจรักษาครั้งแรก (Full Intake)
          </button>
          <button
            type="button"
            onClick={() => setFormMode("CONTINUED_VISIT")}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all cursor-pointer ${
              formMode === "CONTINUED_VISIT"
                ? "bg-clinic-primary text-white shadow-2xs"
                : "text-clinic-ink-soft hover:text-clinic-ink"
            }`}
          >
            📋 บันทึกการรักษาต่อเนื่อง (Continued Visit)
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium animate-in fade-in flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-2 cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-control bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-medium animate-in fade-in flex items-center gap-2">
          <span>✅ {successMsg}</span>
        </div>
      )}

      {/* SECTION 1: Patient & Visit Context */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>👤 ข้อมูลผู้รับบริการ & นัดหมาย</span>
          </h2>
          {patientHistory.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              เคยเข้ารับการรักษาแล้ว {patientHistory.length} ครั้ง
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Select Appointment */}
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              เลือกรายการนัดหมาย
            </label>
            <select
              value={selectedAppointmentId}
              onChange={(e) => handleAppointmentChange(e.target.value)}
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary"
            >
              <option value="WALK_IN">🚶 ผู้ป่วย Walk-in (สร้างนัดหมายอัตโนมัติ)</option>
              {appointments
                .filter((a) => a.status === "SCHEDULED")
                .map((app) => (
                  <option key={app.appointmentId} value={app.appointmentId}>
                    #{app.appointmentId} - {app.patientFullname} (
                    {new Date(app.slotStartTime).toLocaleDateString("th-TH")})
                  </option>
                ))}
            </select>
          </div>

          {/* Select Patient */}
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              ผู้ป่วย / ผู้รับบริการ <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary"
            >
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  HN: {p.patientId} - {p.fullname} ({p.gender}, ID: {p.idNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Record Date */}
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              วันที่บันทึกการรักษา
            </label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary"
            />
          </div>
        </div>

        {/* Patient Quick Summary Badge Card */}
        {currentPatient && (
          <div className="bg-clinic-bg/70 border border-clinic-line rounded-control p-3.5 text-xs text-clinic-ink space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-clinic-primary-deep text-sm">
                {currentPatient.fullname} (เพศ: {currentPatient.gender}, เกิด:{" "}
                {currentPatient.dateOfBirthThai || currentPatient.dateOfBirth || "-"})
              </span>
              <span className="text-clinic-ink-soft font-mono">
                เลขประจำตัว: {currentPatient.idNumber} · โทร: {currentPatient.mobileNumber}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-clinic-ink-soft pt-1 border-t border-clinic-line/60">
              <span>
                โรคประจำตัว:{" "}
                <strong className="text-clinic-ink">
                  {currentPatient.healthProfile?.underlyingDisease || "ปฏิเสธ"}
                </strong>
              </span>
              <span>
                แพ้ยา:{" "}
                <strong className="text-rose-700">
                  {currentPatient.healthProfile?.drugAllergy || "ปฏิเสธ"}
                </strong>
              </span>
              <span>
                แพ้อาหาร:{" "}
                <strong className="text-amber-700">
                  {currentPatient.healthProfile?.foodAllergy || "ปฏิเสธ"}
                </strong>
              </span>
              <span>
                ธาตุเจ้าเรือน:{" "}
                <strong className="text-clinic-primary">
                  {currentPatient.principle?.principleDhatu || "-"}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Physical Examination & Vital Signs (ตรวจร่างกายก่อนการรักษา) */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>🩺 การตรวจร่างกายและสัญญาณชีพ (Physical Examination)</span>
          </h2>
          <span className="text-[11px] text-clinic-ink-soft">
            * คำนวณค่า BMI อัตโนมัติเมื่อกรอกส่วนสูงและน้ำหนัก
          </span>
        </div>

        {/* Vital signs inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              อุณหภูมิ (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="36.5"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ชีพจร (bpm)
            </label>
            <input
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="76"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              การหายใจ (/min)
            </label>
            <input
              type="number"
              value={respirationRate}
              onChange={(e) =>
                setRespirationRate(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="18"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ความดันโลหิต BP
            </label>
            <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              placeholder="120/80"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ส่วนสูง (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="165"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              น้ำหนัก (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="60"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary font-mono"
            />
          </div>
        </div>

        {/* BMI result badge */}
        {bmiValue && bmiClassification && (
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-clinic-ink-soft">
              ดัชนีมวลกาย (BMI): <strong className="font-mono text-sm text-clinic-ink">{bmiValue}</strong>
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${bmiClassification.color}`}
            >
              {bmiClassification.label}
            </span>
          </div>
        )}

        {/* Pain Score Assessment Scale */}
        <div className="pt-3 border-t border-clinic-line space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-clinic-ink flex items-center gap-1.5">
              <span>🎯 ระดับความปวดก่อนการรักษา (Pain Score Before Treatment)</span>
            </label>
            <span className="text-xs font-bold text-clinic-primary-deep font-mono">
              {painScoreBefore} / 10
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PAIN_SCORES.map((p) => {
              const isSelected = painScoreBefore === p.score;
              return (
                <button
                  key={p.score}
                  type="button"
                  onClick={() => setPainScoreBefore(p.score)}
                  className={`p-2 rounded-control border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? "bg-clinic-primary text-white border-clinic-primary shadow-xs font-bold scale-[1.02]"
                      : "bg-clinic-bg/40 border-clinic-line hover:border-clinic-primary/50 text-clinic-ink"
                  }`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-xs font-mono">{p.score}</span>
                  <span className="text-[10px] truncate max-w-full">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: Symptoms & Medical Diagnosis (อาการสำคัญ & การวินิจฉัย) */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>🌿 อาการสำคัญและการวินิจฉัยโรค</span>
          </h2>
          <span className="text-xs text-clinic-ink-soft">
            {formMode === "FIRST_VISIT" ? "แบบเต็ม (First Visit)" : "แบบต่อเนื่อง (Continued)"}
          </span>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-xs font-bold text-clinic-ink mb-1">
            อาการสำคัญ (Chief Complaint / Symptoms) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="ระบุอาการสำคัญ เช่น ปวดบ่าและคอร้าวขึ้นศีรษะ กล้ามเนื้อตึงตัวบริเวณบ่าสองข้าง เป็นมา 3 วัน..."
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary"
            required
          />
        </div>

        {/* Fields specific to First Visit (Pages 1-3) */}
        {formMode === "FIRST_VISIT" && (
          <div className="space-y-4 pt-2 border-t border-clinic-line/70">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
                  ธาตุเจ้าเรือนหลัก (A Principal Dhatu)
                </label>
                <input
                  type="text"
                  value={principleDhatu}
                  onChange={(e) => setPrincipleDhatu(e.target.value)}
                  className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
                  ธาตุเจ้าเรือนรอง (A Secondary Dhatu)
                </label>
                <input
                  type="text"
                  value={secondaryDhatu}
                  onChange={(e) => setSecondaryDhatu(e.target.value)}
                  className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
                ประวัติปัจจุบัน (Present History)
              </label>
              <textarea
                rows={2}
                value={presentHistory}
                onChange={(e) => setPresentHistory(e.target.value)}
                placeholder="ประวัติการเจ็บป่วยปัจจุบัน เริ่มเป็นเมื่อใด มีอาการต่อเนื่องอย่างไร..."
                className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
                  ผลการวิเคราะห์สมุฏฐาน 5 ด้าน (Principles for Diagnosis)
                </label>
                <input
                  type="text"
                  value={diagnosisElements}
                  onChange={(e) => setDiagnosisElements(e.target.value)}
                  placeholder="ธาตุสมุฏฐาน, อุตุสมุฏฐาน, กาลสมุฏฐาน..."
                  className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
                  มูลเหตุการเกิดโรค (Cause of symptoms)
                </label>
                <input
                  type="text"
                  value={causeOfSymptoms}
                  onChange={(e) => setCauseOfSymptoms(e.target.value)}
                  placeholder="อิริยาบถ, อาหาร, อดนอน, ความร้อน-เย็น..."
                  className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis & Sickness summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-clinic-line/70">
          <div>
            <label className="block text-xs font-bold text-clinic-primary-deep mb-1">
              การวินิจฉัยโรคทางการแพทย์แผนไทย / รหัสโรค (TTM Diagnosis)
            </label>
            <input
              type="text"
              value={ttmDiagnosis}
              onChange={(e) => setTtmDiagnosis(e.target.value)}
              placeholder="เช่น โรคลมปลายปัตฆาตสัญญาณ 4-5, ลมจับโปงแห้งเข่า..."
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              การวินิจฉัยทางการแพทย์แผนปัจจุบัน (ถ้ามี) Modern Diagnosis
            </label>
            <input
              type="text"
              value={modernDiagnosis}
              onChange={(e) => setModernDiagnosis(e.target.value)}
              placeholder="เช่น Myofascial Pain Syndrome, Cervical Spondylosis..."
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Treatment Program & Suggestions (การรักษา & คำแนะนำ) */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>💆 แผนการรักษาและหัตถการ (Treatment Program)</span>
          </h2>
        </div>

        {/* Treatment Plan */}
        <div>
          <label className="block text-xs font-bold text-clinic-ink mb-1">
            แผนการรักษา (Treatment Plan)
          </label>
          <input
            type="text"
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
            placeholder="ระบุแผนการรักษา เช่น นวดแก้อาการกล้ามเนื้อบ่า และประคบสมุนไพรสด..."
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary"
          />
        </div>

        {/* Procedure Checkboxes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-clinic-ink-soft">
            วิธีการรักษา / หัตถการ (เลือกรายการที่ดำเนินการ):
          </label>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-clinic-ink cursor-pointer">
              <input
                type="checkbox"
                checked={programMassage}
                onChange={(e) => setProgramMassage(e.target.checked)}
                className="rounded text-clinic-primary focus:ring-clinic-primary"
              />
              <span>นวด / หัตถการรักษา</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-clinic-ink cursor-pointer">
              <input
                type="checkbox"
                checked={programCompress}
                onChange={(e) => setProgramCompress(e.target.checked)}
                className="rounded text-clinic-primary focus:ring-clinic-primary"
              />
              <span>ประคบสมุนไพร (Herbal Compress)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-clinic-ink cursor-pointer">
              <input
                type="checkbox"
                checked={programSteam}
                onChange={(e) => setProgramSteam(e.target.checked)}
                className="rounded text-clinic-primary focus:ring-clinic-primary"
              />
              <span>อบสมุนไพร (Herbal Steam)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-clinic-ink cursor-pointer">
              <input
                type="checkbox"
                checked={programHerbalMed}
                onChange={(e) => setProgramHerbalMed(e.target.checked)}
                className="rounded text-clinic-primary focus:ring-clinic-primary"
              />
              <span>จ่ายยาสมุนไพร</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-clinic-ink cursor-pointer">
              <input
                type="checkbox"
                checked={programConsult}
                onChange={(e) => setProgramConsult(e.target.checked)}
                className="rounded text-clinic-primary focus:ring-clinic-primary"
              />
              <span>ให้คำปรึกษาทางการแพทย์</span>
            </label>
          </div>
        </div>

        {/* Post-Treatment Pain Score */}
        <div className="pt-3 border-t border-clinic-line space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-clinic-ink flex items-center gap-1.5">
              <span>✨ ระดับความปวดหลังการรักษา (Pain Score After Treatment)</span>
            </label>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              {painScoreAfter} / 10 {painScoreBefore - painScoreAfter > 0 && `(ลดลง -${painScoreBefore - painScoreAfter})`}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PAIN_SCORES.map((p) => {
              const isSelected = painScoreAfter === p.score;
              return (
                <button
                  key={p.score}
                  type="button"
                  onClick={() => setPainScoreAfter(p.score)}
                  className={`p-2 rounded-control border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold scale-[1.02]"
                      : "bg-clinic-bg/40 border-clinic-line hover:border-emerald-500/50 text-clinic-ink"
                  }`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-xs font-mono">{p.score}</span>
                  <span className="text-[10px] truncate max-w-full">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggestions & Follow up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-clinic-line/70">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              คำแนะนำสำหรับผู้รับบริการ (Suggestions)
            </label>
            <input
              type="text"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="คำแนะนำการปฏิบัติตัว ท่าบริหาร..."
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              การนัดหมายเพื่อติดตามผล (Follow-up)
            </label>
            <input
              type="text"
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
              placeholder="เช่น นัดติดตามผลในอีก 1 สัปดาห์ (หรือระบุวันที่)"
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: Prescriptions & Billing (การสั่งจ่ายยา & การเงิน) */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>💊 การสั่งจ่ายยาสมุนไพรและค่ารักษาพยาบาล (Prescription & Billing)</span>
          </h2>
          <span className="text-xs font-semibold text-clinic-ink-soft">
            ยอดรวมทั้งสิ้น: <strong className="font-mono text-base text-clinic-primary-deep">฿{grandTotal.toLocaleString()}</strong>
          </span>
        </div>

        {/* Add Medicine Selector */}
        <div className="bg-clinic-bg/60 border border-clinic-line rounded-control p-4 space-y-3">
          <div className="font-bold text-xs text-clinic-primary-deep flex items-center gap-1.5">
            <span>+ เพิ่มรายการยาสมุนไพรจากคลัง</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
                เลือกยาสมุนไพร / เวชภัณฑ์
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-white focus:ring-2 focus:ring-clinic-primary"
              >
                {medicines.map((m) => (
                  <option key={m.medicineId} value={m.medicineId}>
                    {m.medicineName} (฿{m.unitPrice} / {m.unitType ?? "หน่วย"}) · คงเหลือ {m.stockRemaining ?? 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
                จำนวน
              </label>
              <input
                type="number"
                min={1}
                value={medQuantity}
                onChange={(e) => setMedQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-white focus:ring-2 focus:ring-clinic-primary font-mono text-center"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleAddMedicine}
                className="w-full px-4 py-1.5 bg-clinic-primary hover:bg-clinic-primary-deep text-white font-bold text-xs rounded-control transition-all shadow-2xs cursor-pointer"
              >
                + เพิ่มลงรายการ
              </button>
            </div>
          </div>
        </div>

        {/* Prescribed Items Table */}
        {prescribedMedicines.length > 0 ? (
          <div className="overflow-x-auto border border-clinic-line rounded-control">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-clinic-bg text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                <tr>
                  <th className="px-4 py-2.5">รายการยา</th>
                  <th className="px-4 py-2.5 text-right">ราคา/หน่วย</th>
                  <th className="px-4 py-2.5 text-center">จำนวน</th>
                  <th className="px-4 py-2.5 text-right">รวม (บาท)</th>
                  <th className="px-4 py-2.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line bg-white">
                {prescribedMedicines.map((item) => (
                  <tr key={item.medicineId} className="hover:bg-clinic-bg/30">
                    <td className="px-4 py-2.5 font-semibold text-clinic-ink">
                      {item.medicineName}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">฿{item.unitPrice}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold">
                      {item.quantity} {item.unitType}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-clinic-primary-deep">
                      ฿{item.subTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(item.medicineId)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-clinic-ink-soft text-center py-3 bg-clinic-bg/30 rounded-control border border-dashed border-clinic-line">
            ยังไม่มีรายการยาสมุนไพรที่สั่งจ่ายในครั้งนี้
          </p>
        )}

        {/* Procedure Fee & Payment details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-clinic-line">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              ค่าบริการตรวจ/หัตถการ (บาท)
            </label>
            <input
              type="number"
              value={procedureFee}
              onChange={(e) => setProcedureFee(Number(e.target.value))}
              placeholder="300"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              วิธีการชำระเงิน
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
            >
              <option value="CASH">💵 เงินสด (CASH)</option>
              <option value="TRANSFER">🏦 โอนเงินผ่านธนาคาร (TRANSFER)</option>
              <option value="QR_CODE">📱 สแกน QR Code (PromptPay)</option>
              <option value="CREDIT_CARD">💳 บัตรเครดิต (CREDIT_CARD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              สถานะการชำระเงิน
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 font-semibold"
            >
              <option value="PAID">✅ ชำระเงินเรียบร้อยแล้ว (PAID)</option>
              <option value="PENDING">⏳ รอดำเนินการชำระเงิน (PENDING)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Submit Action Bar */}
      <div className="bg-white border border-clinic-line rounded-card p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="text-xs text-clinic-ink-soft">
          <p className="font-semibold text-clinic-ink">
            ยอดรวมค่ารักษาและยาสมุนไพร:{" "}
            <span className="font-mono text-lg font-bold text-clinic-primary-deep ml-1">
              ฿{grandTotal.toLocaleString()}
            </span>{" "}
            บาท
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/doctor/treatments"
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-control text-xs font-semibold text-clinic-ink bg-clinic-bg border border-clinic-line hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-control text-sm font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{isPending ? "กำลังบันทึกเวชระเบียน…" : "✓ บันทึกการตรวจรักษาและออกใบสั่งการรักษา"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
