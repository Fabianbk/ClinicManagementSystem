"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  RecordTreatmentResponseDTO,
  PatientResponseDTO,
  MedicineResponseDTO,
  RecordTreatmentRequestDTO,
  RecordTreatmentMedicineResponseDTO,
} from "@/lib/types";

interface RecordTreatmentEditClientProps {
  treatment: RecordTreatmentResponseDTO;
  patient: PatientResponseDTO | null;
  medicines: MedicineResponseDTO[];
  doctorId: number;
}

const PAIN_SCORES = [
  { score: 0, label: "ไม่ปวด", emoji: "😊" },
  { score: 2, label: "ปวดเล็กน้อย", emoji: "🙂" },
  { score: 4, label: "ปวดปานกลาง", emoji: "😐" },
  { score: 6, label: "ปวดมาก", emoji: "🙁" },
  { score: 8, label: "ปวดรุนแรง", emoji: "😣" },
  { score: 10, label: "ปวดมากที่สุด", emoji: "😭" },
];

export function RecordTreatmentEditClient({
  treatment,
  patient,
  medicines,
  doctorId,
}: RecordTreatmentEditClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Clinical fields
  const [symptoms, setSymptoms] = useState(treatment.symptoms || "");
  const [temp, setTemp] = useState<number | "">(treatment.temp ?? 36.5);
  const [pulse, setPulse] = useState<number | "">(treatment.pulse ?? 76);
  const [respirationRate, setRespirationRate] = useState<number | "">(treatment.respirationRate ?? 18);
  const [bp, setBp] = useState(treatment.bp || "120/80");
  const [height, setHeight] = useState<number | "">(treatment.height ?? 165);
  const [weight, setWeight] = useState<number | "">(treatment.weight ?? 60);
  const [painScoreBefore, setPainScoreBefore] = useState<number>(treatment.painScoreBefore ?? 4);
  const [painScoreAfter, setPainScoreAfter] = useState<number>(treatment.painScoreAfter ?? 2);

  const [ttmDiagnosis, setTtmDiagnosis] = useState(treatment.ttmDiagnosis || "");
  const [modernDiagnosis, setModernDiagnosis] = useState(treatment.modernDiagnosis || "");
  const [diagnosisElements, setDiagnosisElements] = useState(treatment.diagnosisElements || "");
  const [causeOfSymptoms, setCauseOfSymptoms] = useState(treatment.causeOfSymptoms || "");
  const [summaryOfSickness, setSummaryOfSickness] = useState(treatment.summaryOfSickness || "");

  const [treatmentPlan, setTreatmentPlan] = useState(treatment.treatmentPlan || "");
  const [treatmentProgram, setTreatmentProgram] = useState(treatment.treatmentProgram || "");
  const [suggestions, setSuggestions] = useState(treatment.suggestions || "");
  const [followup, setFollowup] = useState(treatment.followup || "");

  // Dispensed medicines
  const [dispensedMedicines, setDispensedMedicines] = useState<RecordTreatmentMedicineResponseDTO[]>(
    treatment.recordTreatmentMedicines || []
  );

  // New medicine add form
  const [selectedMedId, setSelectedMedId] = useState<number>(
    medicines.length > 0 ? medicines[0].medicineId : 0
  );
  const [medQuantity, setMedQuantity] = useState<number>(1);
  const [isAddingMed, setIsAddingMed] = useState(false);

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

  // Handle Add Medicine to active record
  const handleAddMedicine = async () => {
    if (!selectedMedId || medQuantity <= 0) return;
    try {
      setIsAddingMed(true);
      setErrorMsg(null);
      const res = await fetch("/api/record-treatment-medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordTreatmentId: treatment.recordTreatmentId,
          medicineId: selectedMedId,
          quantity: medQuantity,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถเพิ่มรายการยาได้");
      }

      const newMed: RecordTreatmentMedicineResponseDTO = await res.json();
      setDispensedMedicines((prev) => [...prev, newMed]);
      setMedQuantity(1);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsAddingMed(false);
    }
  };

  // Handle Remove Medicine
  const handleRemoveMedicine = async (recordTreatmentMedicineId: number) => {
    if (!confirm("ยืนยันการลบรายการยานี้และคืนสต็อก?")) return;
    try {
      setErrorMsg(null);
      const res = await fetch(`/api/record-treatment-medicines/${recordTreatmentMedicineId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถลบรายการยาได้");
      }

      setDispensedMedicines((prev) =>
        prev.filter((m) => m.recordTreatmentMedicineId !== recordTreatmentMedicineId)
      );
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Submit Update Treatment
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!symptoms.trim()) {
      setErrorMsg("กรุณาระบุอาการสำคัญ");
      return;
    }

    try {
      const updateDTO: RecordTreatmentRequestDTO = {
        appointmentId: treatment.appointmentId,
        doctorId: doctorId,
        recordDate: treatment.recordDate ? new Date(treatment.recordDate).toISOString() : new Date().toISOString(),
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
        modernDiagnosis: modernDiagnosis.trim() || undefined,
        treatmentPlan: treatmentPlan.trim() || undefined,
        treatmentProgram: treatmentProgram.trim() || undefined,
        suggestions: suggestions.trim() || undefined,
        followup: followup.trim() || undefined,
        painScoreBefore: painScoreBefore,
        painScoreAfter: painScoreAfter,
      };

      const res = await fetch(`/api/record-treatments/${treatment.recordTreatmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateDTO),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถอัปเดตข้อมูลการรักษาได้");
      }

      setSuccessMsg("บันทึกการแก้ไขเวชระเบียนเรียบร้อยแล้ว!");
      startTransition(() => {
        setTimeout(() => {
          router.push(`/doctor/treatments/${treatment.recordTreatmentId}`);
          router.refresh();
        }, 1000);
      });
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <form onSubmit={handleUpdate} className="max-w-5xl mx-auto space-y-6 pb-20 font-body text-clinic-ink">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/doctor/treatments/${treatment.recordTreatmentId}`}
            className="text-xs font-semibold text-clinic-primary hover:underline"
          >
            ← กลับไปดูเวชระเบียน
          </Link>
          <h1 className="font-display text-2xl font-bold text-clinic-primary-deep mt-1">
            ✏️ แก้ไขข้อมูลเวชระเบียน #{treatment.recordTreatmentId}
          </h1>
          <p className="text-xs text-clinic-ink-soft mt-0.5">
            ผู้ป่วย: <strong>{treatment.patientFullname}</strong> (HN: #{treatment.patientId}) · นัดหมาย: #{treatment.appointmentId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/doctor/treatments/${treatment.recordTreatmentId}`}
            className="px-4 py-2 rounded-control text-xs font-semibold text-clinic-ink bg-clinic-bg border border-clinic-line hover:bg-slate-100"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-control text-xs font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-2xs cursor-pointer"
          >
            {isPending ? "กำลังบันทึก…" : "✓ บันทึกการแก้ไข"}
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
        <div className="p-4 rounded-control bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-medium animate-in fade-in">
          ✅ {successMsg}
        </div>
      )}

      {/* Physical Exam & Vitals */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-4">
        <h2 className="font-display font-bold text-sm text-clinic-primary-deep border-b border-clinic-line pb-3">
          🩺 สัญญาณชีพและการตรวจร่างกาย
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">อุณหภูมิ (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">ชีพจร (bpm)</label>
            <input
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">การหายใจ (/min)</label>
            <input
              type="number"
              value={respirationRate}
              onChange={(e) => setRespirationRate(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">ความดันโลหิต BP</label>
            <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">ส่วนสูง (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">น้ำหนัก (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-mono"
            />
          </div>
        </div>

        {/* Pain score selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-clinic-line">
          <div>
            <label className="block text-xs font-bold text-clinic-ink mb-1.5">
              ระดับความปวดก่อนการรักษา: {painScoreBefore}/10
            </label>
            <div className="grid grid-cols-6 gap-1">
              {PAIN_SCORES.map((p) => (
                <button
                  key={p.score}
                  type="button"
                  onClick={() => setPainScoreBefore(p.score)}
                  className={`p-1.5 rounded-control text-center text-xs border cursor-pointer ${
                    painScoreBefore === p.score
                      ? "bg-clinic-primary text-white font-bold"
                      : "bg-clinic-bg/40 text-clinic-ink"
                  }`}
                >
                  <span>{p.emoji} {p.score}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-clinic-ink mb-1.5">
              ระดับความปวดหลังการรักษา: {painScoreAfter}/10
            </label>
            <div className="grid grid-cols-6 gap-1">
              {PAIN_SCORES.map((p) => (
                <button
                  key={p.score}
                  type="button"
                  onClick={() => setPainScoreAfter(p.score)}
                  className={`p-1.5 rounded-control text-center text-xs border cursor-pointer ${
                    painScoreAfter === p.score
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-clinic-bg/40 text-clinic-ink"
                  }`}
                >
                  <span>{p.emoji} {p.score}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms & Diagnosis */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-4">
        <h2 className="font-display font-bold text-sm text-clinic-primary-deep border-b border-clinic-line pb-3">
          🌿 อาการสำคัญและการวินิจฉัยโรค
        </h2>

        <div>
          <label className="block text-xs font-bold text-clinic-ink mb-1">อาการสำคัญ</label>
          <textarea
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">การวินิจฉัยแพทย์แผนไทย</label>
            <input
              type="text"
              value={ttmDiagnosis}
              onChange={(e) => setTtmDiagnosis(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">การวินิจฉัยแผนปัจจุบัน</label>
            <input
              type="text"
              value={modernDiagnosis}
              onChange={(e) => setModernDiagnosis(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
        </div>
      </div>

      {/* Treatment Plan & Suggestions */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-4">
        <h2 className="font-display font-bold text-sm text-clinic-primary-deep border-b border-clinic-line pb-3">
          💆 การรักษาและคำแนะนำ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">แผนการรักษา</label>
            <input
              type="text"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">วิธีการรักษา / หัตถการ</label>
            <input
              type="text"
              value={treatmentProgram}
              onChange={(e) => setTreatmentProgram(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">คำแนะนำสำหรับผู้ป่วย</label>
            <input
              type="text"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">นัดหมายติดตามผล</label>
            <input
              type="text"
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
        </div>
      </div>

      {/* Prescribed Medicines Management */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-4">
        <h2 className="font-display font-bold text-sm text-clinic-primary-deep border-b border-clinic-line pb-3">
          💊 รายการยาสมุนไพรที่จ่าย
        </h2>

        {/* Existing Dispensed Medicines */}
        {dispensedMedicines.length > 0 ? (
          <div className="overflow-x-auto border border-clinic-line rounded-control">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-clinic-bg text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                <tr>
                  <th className="px-4 py-2">รายการยา</th>
                  <th className="px-4 py-2 text-right">ราคา/หน่วย</th>
                  <th className="px-4 py-2 text-center">จำนวน</th>
                  <th className="px-4 py-2 text-right">รวม (บาท)</th>
                  <th className="px-4 py-2 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line bg-white">
                {dispensedMedicines.map((m) => (
                  <tr key={m.recordTreatmentMedicineId}>
                    <td className="px-4 py-2 font-semibold text-clinic-ink">{m.medicineName}</td>
                    <td className="px-4 py-2 text-right font-mono">฿{m.priceAtTime}</td>
                    <td className="px-4 py-2 text-center font-mono font-bold">{m.quantity}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-clinic-primary-deep">
                      ฿{m.subTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(m.recordTreatmentMedicineId)}
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
          <p className="text-xs text-clinic-ink-soft italic text-center py-2">ไม่มีรายการยา</p>
        )}

        {/* Add new medicine line */}
        <div className="bg-clinic-bg/40 p-3 rounded-control border border-clinic-line flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              เพิ่มยาจากคลัง
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-white"
            >
              {medicines.map((m) => (
                <option key={m.medicineId} value={m.medicineId}>
                  {m.medicineName} (฿{m.unitPrice}) · คงเหลือ {m.stockRemaining ?? 0}
                </option>
              ))}
            </select>
          </div>

          <div className="w-24">
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">จำนวน</label>
            <input
              type="number"
              min={1}
              value={medQuantity}
              onChange={(e) => setMedQuantity(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-white font-mono text-center"
            />
          </div>

          <button
            type="button"
            disabled={isAddingMed}
            onClick={handleAddMedicine}
            className="px-4 py-1.5 bg-clinic-primary hover:bg-clinic-primary-deep text-white font-bold text-xs rounded-control transition-all cursor-pointer shadow-2xs"
          >
            + จ่ายยาเพิ่ม
          </button>
        </div>
      </div>
    </form>
  );
}
